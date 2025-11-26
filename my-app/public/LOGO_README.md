# Gym Manager Logo - Premium Edition

## Design Concept
**Bold, High-Contrast Shield + Dumbbell** logo representing security, management, and fitness with premium SaaS styling.

## Design Features
- ✅ **Strong Contrast**: High-impact color gradients
- ✅ **Sharp Edges**: Clean geometric shapes
- ✅ **Glossy Highlights**: Metallic/3D depth effects
- ✅ **Electric Glow**: Subtle glow filters for energy
- ✅ **Premium Look**: Professional, powerful, energetic

## Files

### React Component
- `components/layout/Logo.tsx` - React component with multiple variants

### SVG Files (Premium Versions)
- `logo-premium.svg` - **Navy + Electric Blue** (Light backgrounds)
- `logo-premium-dark.svg` - **White + Electric Blue** (Dark backgrounds)
- `logo-premium-neon.svg` - **Black + Neon Green** (High-impact variant)

### Legacy Files
- `logo.svg` - Original light version
- `logo-dark.svg` - Original dark version

## Color Schemes

### 1. Navy + Electric Blue (Default)
**Light Background:**
- Shield: Navy gradient (#0f172a → #1e3a8a → #1e40af)
- Dumbbell: White gradient (#ffffff → #e0e7ff)
- Accent: Electric Blue (#0ea5e9)
- Highlight: Light Blue (#60a5fa)

**Dark Background:**
- Shield: White gradient (#ffffff → #f1f5f9 → #e2e8f0)
- Dumbbell: Navy gradient (#0f172a → #1e293b)
- Accent: Electric Blue (#0ea5e9)
- Highlight: Light Blue (#60a5fa)

### 2. Black + Neon Green (Neon Variant)
- Shield: Black gradient (#000000 → #0f172a → #1e293b)
- Dumbbell: Neon Green gradient (#10b981 → #059669)
- Accent: Neon Green (#10b981)
- Highlight: Bright Green (#34d399)
- **Strong glow effect** for high-impact look

## Usage

### React Component
```tsx
import { Logo } from '@/components/layout/Logo';

// Auto-detect (defaults to Navy+Blue)
<Logo className="h-10 w-10" />

// Explicit variants
<Logo className="h-10 w-10" variant="light" />    // Navy + Blue
<Logo className="h-10 w-10" variant="dark" />    // White + Blue
<Logo className="h-10 w-10" variant="neon" />     // Black + Neon Green
<Logo className="h-10 w-10" variant="auto" />    // Auto-detect
```

### SVG Files
```html
<!-- Light background - Navy + Electric Blue -->
<img src="/logo-premium.svg" alt="Gym Manager" />

<!-- Dark background - White + Electric Blue -->
<img src="/logo-premium-dark.svg" alt="Gym Manager" />

<!-- High-impact - Black + Neon Green -->
<img src="/logo-premium-neon.svg" alt="Gym Manager" />
```

## Design Principles
- **Bold**: Strong geometric shapes with sharp edges
- **High Contrast**: Vibrant gradients for visual impact
- **3D Depth**: Subtle highlights and shadows for dimension
- **Energetic**: Glow effects and metallic finishes
- **Premium**: Professional SaaS-quality design
- **Scalable**: Vector-based SVG for any size
- **Versatile**: Multiple variants for different contexts

## Technical Details
- **ViewBox**: 0 0 120 120
- **Gradients**: Linear gradients for depth
- **Filters**: Gaussian blur for glow effects
- **Stroke Width**: 2.5px for bold appearance
- **Optimized**: Clean SVG code, no unnecessary elements

