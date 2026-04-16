# Galaxy Hero

A stunning, interactive 3D hero component featuring particle-based text formation, shooting stars, and a physics-based gold mouse trail.

## Features

### 🌟 Core Visual Elements
- **Particle Text System** - ICONIC text forms from 25,000-60,000 gold particles that animate from a sphere to text formation
- **Organic Shimmer** - Particles have a heat haze effect using shader-based noise during the sphere-to-text transition
- **Shooting Stars** - Automatic gold shooting stars appear periodically across the scene
- **Physics-Based Mouse Trail** - 100 gold particles follow the cursor with organic drift and fading

### 🎨 Visual Effects
- **Bloom Post-Processing** - Dreamy glow effect with intensity 2.0
- **Film Grain Noise** - Subtle texture overlay (opacity 0.04)
- **Vignette** - Cinematic darkening at edges (darkness 1.3)
- **Additive Blending** - Glowing, luminous particle effects

### 📱 Responsive Design
- **Dynamic Particle Count** - 25,000 particles on mobile, 60,000 on desktop
- **Responsive Scaling** - Text scales appropriately for different screen sizes
- **Performance Optimized** - Uses instanced meshes for the mouse trail

## Dependencies

```json
{
  "react": "^18.0.0",
  "three": "^0.160.0",
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.90.0",
  "@react-three/postprocessing": "^2.16.0"
}
```

## Usage

### Basic Implementation

```tsx
import GalaxyHero from './GalaxyHero';

function App() {
  return (
    <GalaxyHero />
  );
}
```

### Custom Styling

The component has a fixed height of `100vh` and a dark background (`#020205`). You can wrap it in a container to control its size:

```tsx
<div style={{ height: '500px' }}>
  <GalaxyHero />
</div>
```

## Component Structure

### Shader Materials

1. **PricelessMaterial** - Custom shader for particle text with:
   - Organic noise-based shimmering
   - Smooth sphere-to-text transition
   - Color mixing between navy and gold

2. **StarMaterial** - Shader for background stars with:
   - Individual twinkle effects
   - Size-based depth rendering
   - Color variation

3. **ShootingStarMaterial** - Shader for shooting stars with:
   - Tail-based rendering
   - Progressive fade effect
   - Custom color support

### Key Components

- **ParticleSystem** - Manages ICONIC text particle formation
- **StarField** - Background twinkling star field
- **ShootingStars** - Manager for automatic shooting stars
- **MouseTrail** - Physics-based particle trail following cursor

## Customization

### Colors

The component uses your brand gold color `rgb(0.91, 0.62, 0.0)` throughout. To change colors, modify:

```glsl
// In PricelessMaterial fragment shader
vec3 colorGold = vec3(0.91, 0.62, 0.0);

// In MouseTrail component
<meshBasicMaterial color={[0.91, 0.62, 0.0]} />
```

### Bloom Intensity

Adjust the bloom effect in the EffectComposer:

```tsx
<Bloom 
  luminanceThreshold={0.2} 
  mipmapBlur 
  intensity={2.0}  // Increase for more glow
  radius={0.7} 
/>
```

### Mouse Trail

Adjust the trail behavior:

```tsx
// In MouseTrail component
const count = 100; // Number of particles
p.age += delta * 0.5; // Aging rate (lower = slower fade)
const s = (1 - p.age) * 0.05; // Particle size
```

## Performance

### Optimizations
- **Instanced Rendering** - Mouse trail uses instanced meshes for 100 particles
- **Responsive Particle Count** - Reduces particles on mobile devices
- **Efficient Shaders** - GPU-accelerated particle rendering
- **Lazy Updates** - Only updates geometry when needed

### Performance Tips
- Reduce particle count for lower-end devices
- Disable bloom for better performance
- Use `dpr={[1, 1]}` for lower pixel ratio on mobile

## Browser Support

- Modern browsers with WebGL 2.0 support
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## File Structure

```
galaxy-hero/
├── GalaxyHero.tsx  # Main component
└── README.md       # This file
```

## Technical Details

### Particle Animation
- Uses custom GLSL shaders for GPU-accelerated rendering
- Smooth easing functions for natural motion
- Staggered particle delays for organic formation

### Mouse Trail Physics
- Velocity-based particle movement
- Age-based scaling and fading
- Real-time 3D world position calculation

### Post-Processing Pipeline
1. Normal pass rendering
2. Bloom effect (mipmap blur)
3. Noise overlay
4. Vignette darkening

## License

Part of the Iconic tools project.

## Credits

Built with:
- React Three Fiber
- Three.js
- React Three Drei
- React Three Postprocessing
