/**
 * HeroLogo — Scroll-driven "VELOCE" transformation
 *
 * Initial: Massive centered text (~8–10rem)
 * On scroll: Scales down + moves to top-left → fixed navbar logo
 *
 * Color logic:
 *   "VEL" → Ice Blue (#E0F2FE)
 *   "OCE" → Heart Red (#DC2626)
 */
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function HeroLogo() {
  const { scrollYProgress } = useScroll();

  // Raw transforms — scroll range 0 to 0.25 (first quarter of scroll)
  const rawScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.17]);
  const rawX = useTransform(scrollYProgress, [0, 0.2], ['0vw', '-40vw']);
  const rawY = useTransform(scrollYProgress, [0, 0.2], ['0vh', '-42vh']);

  // Spring-smoothed for premium eased motion
  const scale = useSpring(rawScale, { stiffness: 80, damping: 30, mass: 0.8 });
  const x = useSpring(rawX, { stiffness: 80, damping: 30, mass: 0.8 });
  const y = useSpring(rawY, { stiffness: 80, damping: 30, mass: 0.8 });

  // Subtle opacity for the tagline that fades out on scroll
  const taglineOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const smoothTaglineOpacity = useSpring(taglineOpacity, { stiffness: 120, damping: 25 });

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{ x, y, scale }}
    >
      <div className="flex flex-col items-center">
        {/* The VELOCE wordmark */}
        <h1
          className="font-rajdhani font-bold tracking-tight leading-none select-none"
          style={{
            fontSize: 'clamp(5rem, 10vw, 10rem)',
            textShadow: '0 4px 60px rgba(0,0,0,0.3)',
          }}
        >
          <span style={{ color: '#E0F2FE' }}>VEL</span>
          <span style={{ color: '#DC2626' }}>OCE</span>
        </h1>

        {/* Tagline — fades out on scroll */}
        <motion.p
          className="font-inter text-white/50 text-sm tracking-[0.35em] uppercase mt-4"
          style={{
            opacity: smoothTaglineOpacity,
            textShadow: '0 2px 20px rgba(0,0,0,0.4)',
          }}
        >
          Clinical Intelligence
        </motion.p>
      </div>
    </motion.div>
  );
}
