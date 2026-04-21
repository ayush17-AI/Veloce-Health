/**
 * HospitalEnvironment — Adaptive Background System
 *
 * Phase 1 (Intro): Premium milk white canvas
 *   - Layered gradients for clinical lighting
 *   - Micro noise texture for premium feel
 *   - Subtle vignette for cinematic depth
 *
 * Phase 2 (Hospital Mode): High-end hospital environment
 *   - Crossfade to hospital corridor image
 *   - Blur + dark overlay for text readability
 *   - Smooth 1.2s transition
 */
import { motion } from 'framer-motion';

interface HospitalEnvironmentProps {
  /** When true, show the hospital environment instead of sterile white */
  hospitalMode?: boolean;
}

export default function HospitalEnvironment({ hospitalMode = false }: HospitalEnvironmentProps) {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* ═══ Layer 1: Sterile White Base ═══ */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: hospitalMode ? 0 : 1 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      >
        {/* Base white */}
        <div className="absolute inset-0 bg-sterile-white" />

        {/* Overhead hospital lighting — bright center, softer edges */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 25%, rgba(255,255,255,1) 0%, rgba(253,253,253,1) 50%, rgba(240,240,242,0.6) 100%)',
          }}
        />

        {/* Very faint warm accent — simulating clinical LED warmth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 55% 50%, rgba(185,28,28,0.008) 0%, transparent 55%)',
          }}
        />

        {/* Subtle directional light from top-right — depth illusion */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(145deg, rgba(255,255,255,0.4) 0%, transparent 40%, rgba(0,0,0,0.012) 100%)',
          }}
        />

        {/* Gentle depth vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.018) 100%)',
          }}
        />

        {/* Ultra-faint noise texture — premium paper feel */}
        <div
          className="absolute inset-0 opacity-[0.012] mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px',
          }}
        />
      </motion.div>

      {/* ═══ Layer 2: Hospital Environment ═══ */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: hospitalMode ? 1 : 0 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      >
        {/* Hospital background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/hospital-bg.png)',
            filter: 'blur(5px) brightness(0.6) saturate(0.8)',
            transform: 'scale(1.05)', // prevent blur edge artifacts
          }}
        />

        {/* Dark overlay for text readability */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.65) 100%)',
          }}
        />

        {/* Subtle red accent glow at center */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, rgba(185,28,28,0.06) 0%, transparent 60%)',
          }}
        />

        {/* Cinematic vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
          }}
        />
      </motion.div>
    </div>
  );
}
