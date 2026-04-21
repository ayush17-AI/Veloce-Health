/**
 * HeroLogo — VELOCE branding with phase-driven rendering
 *
 * Colors:
 *   "VEL" → Blood Red (#B91C1C)
 *   "OCE" → White with thin black outline (for contrast on white bg)
 *
 * Props:
 *   small — Render as small navbar logo vs. large hero display
 */
interface HeroLogoProps {
  small?: boolean;
}

export default function HeroLogo({ small = false }: HeroLogoProps) {
  return (
    <h1
      className={`font-rajdhani font-bold tracking-tight leading-none select-none ${
        small ? 'text-2xl' : ''
      }`}
      style={{
        fontSize: small ? undefined : 'clamp(4rem, 10vw, 8rem)',
        textShadow: small ? 'none' : '0 2px 40px rgba(0,0,0,0.05)',
      }}
    >
      <span style={{ color: '#B91C1C' }}>VEL</span>
      <span className={small ? 'veloce-outline-sm' : 'veloce-outline'}>
        OCE
      </span>
    </h1>
  );
}
