import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';

// ─── 1. CUSTOM SHADER MATERIAL ───────────────────────────────────────────────
const PricelessMaterial = shaderMaterial(
  {
    uTime: 0,
    uPhase: 0,
    uMouse: new THREE.Vector3(0, 0, 0),
  },
  // Vertex Shader
  `
    uniform float uTime;
    uniform float uPhase;
    uniform vec3 uMouse;

    attribute vec3 targetPosition;
    attribute float staggerDelay;

    varying vec3 vPos;
    varying float vIntensity;
    varying float vStagger;

    void main() {
      float personalPhase = max(uPhase - staggerDelay * 1.5, 0.0);
      float t = clamp(personalPhase / 2.5, 0.0, 1.0);
      t = t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;

      vec3 pos = mix(position, targetPosition, t);

      // Organic noise for shimmering heat haze effect
      float noise = sin(pos.x * 10.0 + uTime) * cos(pos.y * 10.0 + uTime) * 0.05;
      pos.z += noise * (1.0 - t); // Only vibrate while in sphere form

      vIntensity = 0.0;
      vStagger  = staggerDelay;
      vPos      = pos;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = (14.0 / -mvPosition.z);
      gl_Position  = projectionMatrix * mvPosition;
    }
  `,
  // Fragment Shader
  `
    varying vec3 vPos;
    varying float vIntensity;
    varying float vStagger;
    uniform float uPhase;

    void main() {
      vec3 colorNavy = vec3(0.058, 0.09, 0.164);
      vec3 colorGold  = vec3(0.91,  0.62, 0.0);

      float wave = sin(vPos.x * 2.0 + vPos.y * 1.5 + uPhase) * 0.5 + 0.5;
      vec3 finalColor = mix(colorNavy, colorGold, wave + vIntensity * 0.5);


      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      float strength = pow(1.0 - (d * 2.0), 3.0);
      float alpha = strength * smoothstep(0.0, 0.1, uPhase - vStagger);
      gl_FragColor = vec4(finalColor * (1.5 + vIntensity), alpha);
    }
  `
);

// ─── 2. STAR-FIELD SHADER MATERIAL ───────────────────────────────────────────
const StarMaterial = shaderMaterial(
  { uTime: 0 },
  `
    attribute float aSize;
    attribute float aTwinkle;
    uniform float uTime;
    varying float vTwinkle;

    void main() {
      vTwinkle = aTwinkle;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      float twinkle = 0.6 + 0.4 * sin(uTime * aTwinkle * 3.0 + aTwinkle * 100.0);
      gl_PointSize = aSize * twinkle * (300.0 / -mvPosition.z);
      gl_Position  = projectionMatrix * mvPosition;
    }
  `,
  `
    uniform float uTime;
    varying float vTwinkle;

    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      float strength = pow(1.0 - d * 2.0, 2.5);
      float twinkle  = 0.6 + 0.4 * sin(uTime * vTwinkle * 3.0 + vTwinkle * 100.0);
      vec3  col = mix(vec3(0.6, 0.7, 1.0), vec3(1.0, 0.95, 0.8), vTwinkle);
      gl_FragColor = vec4(col * twinkle, strength * twinkle);
    }
  `
);

// ─── 3. SHOOTING STAR SHADER ──────────────────────────────────────────────────
const ShootingStarMaterial = shaderMaterial(
  { uProgress: 0, uColor: new THREE.Color(1, 1, 1) },
  `
    attribute float aAlongTail;
    uniform float uProgress;
    varying float vAlongTail;
    varying float vAlpha;

    void main() {
      vAlongTail = aAlongTail;
      // Only the leading segment [uProgress-tailLen .. uProgress] is visible
      float tailLen = 0.18;
      float start   = uProgress - tailLen;
      float inRange = step(start, aAlongTail) * step(aAlongTail, uProgress);
      float fade    = (aAlongTail - start) / tailLen; // 0=tail 1=head
      vAlpha = fade * inRange;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform vec3 uColor;
    varying float vAlongTail;
    varying float vAlpha;

    void main() {
      if (vAlpha <= 0.0) discard;
      gl_FragColor = vec4(uColor, vAlpha * vAlpha);
    }
  `
);

extend({ PricelessMaterial, StarMaterial, ShootingStarMaterial });

// ─── PARTICLE SYSTEM (ICONIC text) ───────────────────────────────────────────
function ParticleSystem() {
  const { size } = useThree();
  const matRef    = useRef<any>(null);
  const pointsRef = useRef<THREE.Points>(null!);
  
  // 1. Dynamic count based on screen size
  const count = useMemo(() => (size.width < 768 ? 25000 : 60000), [size.width]);

  const [pos, tar, stg] = useMemo(() => {
    const p = new Float32Array(count * 3);
    const t = new Float32Array(count * 3);
    const s = new Float32Array(count);

    const canvas = document.createElement('canvas');
    canvas.width = 1000; canvas.height = 250;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.fillStyle = 'white';
    ctx.font = '900 160px "Arial Black", sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ICONIC', 500, 125);

    // 2. Responsive Scaling Logic
    // Mobile: smaller scale (0.008), Desktop: medium scale (0.011)
    const responsiveScale = size.width < 768 ? 0.008 : 0.011;

    const imgData     = ctx.getImageData(0, 0, 1000, 250).data;
    const validPoints: { x: number; y: number }[] = [];
    for (let y = 0; y < 250; y += 2) {
      for (let x = 0; x < 1000; x += 2) {
        if (imgData[(y * 1000 + x) * 4] > 128) {
          // Use the responsiveScale here
          validPoints.push({ 
            x: (x - 500) * responsiveScale, 
            y: (125 - y) * responsiveScale 
          });
        }
      }
    }

    for (let i = 0; i < count; i++) {
      const r  = 3 + Math.random() * 2;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(Math.random() * 2 - 1);
      p[i * 3]     = r * Math.sin(ph) * Math.cos(th);
      p[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      p[i * 3 + 2] = r * Math.cos(ph);

      const pt = validPoints[Math.floor(Math.random() * validPoints.length)];
      t[i * 3]     = pt.x;
      t[i * 3 + 1] = pt.y;
      t[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
      s[i] = Math.sqrt(t[i * 3] ** 2 + t[i * 3 + 1] ** 2) * 0.15 + Math.random() * 0.4;
    }
    return [p, t, s];
  }, [count, size.width]); // Re-run if screen width changes


  useFrame((state) => {
    if (!matRef.current) return;
    matRef.current.uTime  = state.clock.elapsedTime;
    matRef.current.uPhase = state.clock.elapsedTime * 1.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position"       count={count} args={[pos, 3]} />
        <bufferAttribute attach="attributes-targetPosition" count={count} args={[tar, 3]} />
        <bufferAttribute attach="attributes-staggerDelay"   count={count} args={[stg, 1]} />
      </bufferGeometry>
      {/* @ts-ignore */}
      <pricelessMaterial ref={matRef} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// ─── STAR FIELD ───────────────────────────────────────────────────────────────
function StarField() {
  const matRef = useRef<any>(null);
  const STARS  = 3000;

  const [positions, sizes, twinkles] = useMemo(() => {
    const pos  = new Float32Array(STARS * 3);
    const sz   = new Float32Array(STARS);
    const tw   = new Float32Array(STARS);
    for (let i = 0; i < STARS; i++) {
      // Spread far in background (z very negative)
      pos[i * 3]     = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 2] = -10 - Math.random() * 40;
      sz[i] = 0.5 + Math.random() * 2.5;
      tw[i] = 0.3 + Math.random() * 0.7;
    }
    return [pos, sz, tw];
  }, []);

  useFrame((s) => {
    if (matRef.current) matRef.current.uTime = s.clock.elapsedTime;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={STARS} args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize"    count={STARS} args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aTwinkle" count={STARS} args={[twinkles, 1]} />
      </bufferGeometry>
      {/* @ts-ignore */}
      <starMaterial ref={matRef} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// ─── SINGLE SHOOTING STAR ─────────────────────────────────────────────────────
interface ShootingStarProps {
  startDelay: number;
  color: THREE.Color;
}

function ShootingStar({ startDelay, color }: ShootingStarProps) {
  const matRef    = useRef<any>(null);
  const lineRef   = useRef<THREE.Line>(null!);
  const SEGMENTS = 80;

  // Randomize trajectory once
  const { positions, aAlongTail } = useMemo(() => {
    const ox = (Math.random() - 0.5) * 30;
    const oy = 5 + Math.random() * 10;
    const oz = -5 - Math.random() * 10;
    const dx =  8 + Math.random() * 14;   // shoot right
    const dy = -(4 + Math.random() * 8);  // and downward

    const pos  = new Float32Array((SEGMENTS + 1) * 3);
    const tail = new Float32Array(SEGMENTS + 1);
    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS;
      pos[i * 3]     = ox + dx * t;
      pos[i * 3 + 1] = oy + dy * t;
      pos[i * 3 + 2] = oz;
      tail[i]        = t;
    }
    return { positions: pos, aAlongTail: tail, direction: new THREE.Vector3(dx, dy, 0) };
  }, []);

  const clock      = useRef(startDelay * -1); // negative = wait before start
  const CYCLE_TIME = 4 + Math.random() * 6;

  useFrame((_, delta) => {
    if (!matRef.current) return;
    clock.current += delta;
    const t = (clock.current % CYCLE_TIME) / CYCLE_TIME;
    matRef.current.uProgress = t;
    // Hide between cycles
    if (lineRef.current) lineRef.current.visible = clock.current > 0;
  });

  return (
    <line ref={lineRef as any}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position"   count={SEGMENTS + 1} args={[positions, 3]} />
        <bufferAttribute attach="attributes-aAlongTail" count={SEGMENTS + 1} args={[aAlongTail, 1]} />
      </bufferGeometry>
      {/* @ts-ignore */}
      <shootingStarMaterial ref={matRef} transparent depthWrite={false} blending={THREE.AdditiveBlending} uColor={color} />
    </line>
  );
}

// ─── SHOOTING STARS MANAGER ───────────────────────────────────────────────────
function ShootingStars() {
  const stars = useMemo(() => {
    const goldColor = new THREE.Color(0.91, 0.62, 0.0);  // gold (matching brand)
    return Array.from({ length: 8 }, (_, i) => ({
      id:    i,
      delay: i * 0.9,
      color: goldColor,
    }));
  }, []);

  return (
    <>
      {stars.map((s) => (
        <ShootingStar key={s.id} startDelay={s.delay} color={s.color} />
      ))}
    </>
  );
}

// ─── THE PRECISION TRAIL (FLUID GOLD) ────────────────────────────────────────
function MouseTrail() {
  const { camera, mouse } = useThree();
  const count = 100;
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  
  // Particles state: [x, y, z, age]
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      pos: new THREE.Vector3(),
      vel: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, 0).multiplyScalar(0.01),
      age: 0,
    }));
  }, []);

  const dummy = new THREE.Object3D();
  const tempVec = new THREE.Vector3();

  useFrame((_, delta) => {
    // 1. Get Mouse World Pos
    tempVec.set(mouse.x, mouse.y, 0.5).unproject(camera);
    const dir = tempVec.sub(camera.position).normalize();
    const dist = -camera.position.z / dir.z;
    const currentPos = camera.position.clone().add(dir.multiplyScalar(dist));

    particles.forEach((p, i) => {
      p.age += delta * 0.5;
      if (p.age > 1) {
        p.age = 0;
        p.pos.copy(currentPos);
        // Add a little "kick" based on mouse movement
        p.vel.set(mouse.x * 0.05, mouse.y * 0.05, 0);
      }

      // Physics: drift slightly
      p.pos.add(p.vel);
      
      // Update Transform
      const s = (1 - p.age) * 0.05; // Shrink as it ages
      dummy.position.copy(p.pos);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null as any, null as any, count]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color={[0.91, 0.62, 0.0]} transparent opacity={0.4} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

// ─── ROOT EXPORT ──────────────────────────────────────────────────────────────
export default function IconicHero() {
  return (
    <div style={{ width: '100%', height: '100vh', background: '#020617', position: 'relative', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, stencil: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={['#020205']} />
        
        <group>
          <StarField />
          <ShootingStars />
          <ParticleSystem />
          <MouseTrail />
        </group>

        <EffectComposer enableNormalPass={false}>
          <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={2.0} 
            radius={0.7} 
          />
          <Noise opacity={0.04} />
          <Vignette eskil={false} offset={0.05} darkness={1.3} />
        </EffectComposer>
      </Canvas>
      
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '30%',
        background: 'linear-gradient(to top, #020617, transparent)',
        pointerEvents: 'none'
      }} />
    </div>
  );
}