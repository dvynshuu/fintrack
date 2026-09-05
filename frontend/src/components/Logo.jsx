import React from 'react';

/**
 * Standard size presets in pixels:
 * xs: 16px | sm: 20px | md: 24px | ml: 28px | lg: 32px | xl: 40px | 2xl: 48px | 3xl: 64px | 4xl: 96px | 5xl: 128px
 */
const SIZE_PRESETS = {
  xs: 16,
  sm: 20,
  md: 24,
  ml: 28,
  lg: 32,
  xl: 40,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
  '5xl': 128
};

const Logo = ({
  size = 'md',
  showWordmark = false,
  wordmarkSize,
  surface = false,
  color = 'var(--accent, #10B981)',
  className = '',
  style = {}
}) => {
  // Resolve numeric pixel size
  const pxSize = typeof size === 'number' ? size : SIZE_PRESETS[size] || 24;

  // Derive proportionate wordmark font size if not explicitly provided
  const fontSize = wordmarkSize || Math.max(14, Math.round(pxSize * 0.78));

  // The definitive FinTrack tiered geometric mark (viewBox: 24x24)
  const mark = (
    <svg
      width={pxSize}
      height={pxSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="fintrack-logo-mark"
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="4" rx="2" fill={color} />
      <rect x="3" y="10" width="13" height="4" rx="2" fill={color} opacity="0.82" />
      <rect x="3" y="17" width="7" height="4" rx="2" fill={color} opacity="0.55" />
    </svg>
  );

  const containerContent = surface ? (
    <div
      className="fintrack-logo-surface"
      style={{
        width: Math.round(pxSize * 1.5),
        height: Math.round(pxSize * 1.5),
        borderRadius: Math.max(6, Math.round(pxSize * 0.3)),
        background: 'var(--accent-soft, rgba(16, 185, 129, 0.12))',
        border: '1px solid var(--border, rgba(255, 255, 255, 0.08))',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
    >
      {mark}
    </div>
  ) : (
    mark
  );

  if (!showWordmark) {
    return (
      <span
        className={`fintrack-logo-wrapper ${className}`}
        style={{ display: 'inline-flex', alignItems: 'center', ...style }}
      >
        {containerContent}
      </span>
    );
  }

  return (
    <span
      className={`fintrack-logo-with-wordmark ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: Math.max(6, Math.round(pxSize * 0.35)),
        textDecoration: 'none',
        ...style
      }}
    >
      {containerContent}
      <span
        className="fintrack-wordmark-text"
        style={{
          fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)",
          fontSize: `${fontSize}px`,
          fontWeight: 700,
          letterSpacing: '-0.025em',
          color: 'var(--text-primary, #F3F4F6)',
          lineHeight: 1
        }}
      >
        FinTrack
      </span>
    </span>
  );
};

export default Logo;
