# Iconic Hero - Galaxy Hero

A stunning, interactive 3D hero component featuring particle-based text formation, shooting stars, and a physics-based gold mouse trail. Built with React, Three.js, and modern WebGL technologies.

## ✨ Features

- **Particle Text System** - ICONIC text forms from 25,000-60,000 gold particles with smooth sphere-to-text animation
- **Organic Shimmer** - Heat haze effect using shader-based noise during particle transitions
- **Shooting Stars** - Automatic gold shooting stars appear periodically across the scene
- **Physics-Based Mouse Trail** - 100 gold particles follow the cursor with organic drift and fading
- **Post-Processing** - Bloom, noise, and vignette effects for cinematic quality
- **Responsive Design** - Adapts to different screen sizes with dynamic particle counts
- **High Performance** - Uses instanced rendering and GPU-accelerated shaders

## 🚀 Installation

```bash
npm install
```

## 📦 Usage

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

## 📁 Component Location

The main component is located at:
```
src/galaxy-hero/GalaxyHero.tsx
```

See the component's [README](./src/galaxy-hero/README.md) for detailed documentation and customization options.

## 🛠️ Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Helper components for React Three Fiber
- **React Three Postprocessing** - Post-processing effects

## 📂 Project Structure

```
src/
├── galaxy-hero/
│   ├── GalaxyHero.tsx    # Main component
│   └── README.md          # Component documentation
├── App.tsx                # Root component
├── main.tsx               # Entry point
├── index.css              # Global styles
└── assets/                # Static assets
```

## 🌐 Deployment

### Vercel
This project is configured for Vercel deployment with `vercel.json`:
- Framework: Vite (auto-detected)
- Build Command: `npm run build`
- Output Directory: `dist`

To deploy:
1. Connect your GitHub repository to Vercel
2. Vercel will auto-detect the configuration
3. Deploy with one click

### Other Platforms
The project can be deployed to any platform that supports Vite:
- Netlify
- Cloudflare Pages
- GitHub Pages (with configuration)

## 🎨 Customization

The component uses your brand gold color `rgb(0.91, 0.62, 0.0)` throughout. See the component's [README](./src/galaxy-hero/README.md) for detailed customization options including:
- Color schemes
- Bloom intensity
- Mouse trail behavior
- Particle count
- Animation timing

## 📊 Performance

- **Mobile**: 25,000 particles
- **Desktop**: 60,000 particles
- **Instanced rendering** for mouse trail
- **GPU-accelerated** particle rendering
- **Lazy updates** for geometry

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires WebGL 2.0 support.

## 📝 License

Part of the Iconic tools project.
