'use client';

import { cn } from '@/lib/utils/cn';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'auto' | 'neon';
}

export function Logo({ className, variant = 'auto' }: LogoProps) {
  // Determine colors and gradients based on variant
  const getDesign = () => {
    if (variant === 'light' || variant === 'auto') {
      // Navy + Electric Blue (High Contrast)
      return {
        shieldGradient: ['#0f172a', '#1e3a8a', '#1e40af'],
        shieldStroke: '#0ea5e9',
        dumbbell: '#ffffff',
        dumbbellShadow: '#e0e7ff',
        accent: '#0ea5e9',
        highlight: '#60a5fa',
        glow: '#3b82f6',
      };
    }
    if (variant === 'dark') {
      // White + Electric Blue (High Contrast)
      return {
        shieldGradient: ['#ffffff', '#f1f5f9', '#e2e8f0'],
        shieldStroke: '#0ea5e9',
        dumbbell: '#0f172a',
        dumbbellShadow: '#1e293b',
        accent: '#0ea5e9',
        highlight: '#60a5fa',
        glow: '#3b82f6',
      };
    }
    if (variant === 'neon') {
      // Black + Neon Green (High Impact)
      return {
        shieldGradient: ['#000000', '#0f172a', '#1e293b'],
        shieldStroke: '#10b981',
        dumbbell: '#10b981',
        dumbbellShadow: '#059669',
        accent: '#10b981',
        highlight: '#34d399',
        glow: '#10b981',
      };
    }
    // Default to light
    return {
      shieldGradient: ['#0f172a', '#1e3a8a', '#1e40af'],
      shieldStroke: '#0ea5e9',
      dumbbell: '#ffffff',
      dumbbellShadow: '#e0e7ff',
      accent: '#0ea5e9',
      highlight: '#60a5fa',
      glow: '#3b82f6',
    };
  };

  const design = getDesign();
  const gradientId = `shield-gradient-${variant}`;
  const highlightId = `highlight-gradient-${variant}`;
  const dumbbellGradientId = `dumbbell-gradient-${variant}`;

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-8 w-8', className)}
    >
      <defs>
        {/* Shield gradient - deep to bright */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={design.shieldGradient[0]} />
          <stop offset="50%" stopColor={design.shieldGradient[1]} />
          <stop offset="100%" stopColor={design.shieldGradient[2]} />
        </linearGradient>
        
        {/* Highlight gradient for glossy effect */}
        <linearGradient id={highlightId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={design.highlight} stopOpacity="0.6" />
          <stop offset="100%" stopColor={design.highlight} stopOpacity="0" />
        </linearGradient>
        
        {/* Dumbbell gradient for depth */}
        <linearGradient id={dumbbellGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={design.dumbbell} />
          <stop offset="100%" stopColor={design.dumbbellShadow} />
        </linearGradient>
        
        {/* Glow filter for electric effect */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Shield Shape - Bold geometric design */}
      <path
        d="M60 6 L15 28 L15 62 C15 88 40 108 60 116 C80 108 105 88 105 62 L105 28 Z"
        fill={`url(#${gradientId})`}
        stroke={design.shieldStroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Shield inner highlight - glossy top section */}
      <path
        d="M60 10 L22 30 L22 62 C22 84 38 102 60 110 C82 102 98 84 98 62 L98 30 Z"
        fill={`url(#${highlightId})`}
      />
      
      {/* Sharp accent line - top edge */}
      <path
        d="M15 28 L60 6 L105 28"
        stroke={design.accent}
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#glow)"
      />
      
      {/* Dumbbell - Left Weight (bold geometric) */}
      <g filter="url(#glow)">
        <ellipse
          cx="35"
          cy="50"
          rx="9"
          ry="13"
          fill={`url(#${dumbbellGradientId})`}
          stroke={design.accent}
          strokeWidth="1.5"
        />
        {/* Left weight highlight */}
        <ellipse
          cx="33"
          cy="48"
          rx="4"
          ry="6"
          fill={design.highlight}
          opacity="0.4"
        />
      </g>
      
      {/* Dumbbell - Right Weight (bold geometric) */}
      <g filter="url(#glow)">
        <ellipse
          cx="85"
          cy="50"
          rx="9"
          ry="13"
          fill={`url(#${dumbbellGradientId})`}
          stroke={design.accent}
          strokeWidth="1.5"
        />
        {/* Right weight highlight */}
        <ellipse
          cx="83"
          cy="48"
          rx="4"
          ry="6"
          fill={design.highlight}
          opacity="0.4"
        />
      </g>
      
      {/* Dumbbell - Center Bar (bold and sharp) */}
      <rect
        x="44"
        y="45"
        width="32"
        height="10"
        rx="2"
        fill={`url(#${dumbbellGradientId})`}
        stroke={design.accent}
        strokeWidth="1.5"
        filter="url(#glow)"
      />
      
      {/* Center bar highlight */}
      <rect
        x="46"
        y="47"
        width="28"
        height="3"
        rx="1"
        fill={design.highlight}
        opacity="0.5"
      />
      
      {/* Bottom accent line for depth */}
      <path
        d="M15 62 L60 116 L105 62"
        stroke={design.shieldStroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}

