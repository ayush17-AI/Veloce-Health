/**
 * LetterRevealSystem — ECG-Synced VELOCE Brand Reveal
 *
 * THE SIGNATURE MOMENT:
 * Each letter of "VELOCE" appears letter-by-letter as the ECG sweep
 * passes its horizontal position. The ECG is "writing the brand."
 *
 * Letter Styling:
 *   "V", "E", "L" → Blood Red (#B91C1C)
 *   "O", "C", "E" → White with thin dark outline
 *
 * Scale: ~40% of screen width
 *   font-size: clamp(8rem, 12vw, 14rem)
 *
 * Each letter on reveal:
 *   - opacity: 0 → 1
 *   - translateY: 30px → 0
 *   - glow flash + micro scale bump (1 → 1.05 → 1)
 */
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LetterConfig {
  char: string;
  threshold: number;
  colorClass: 'red' | 'white';
}

const LETTERS: LetterConfig[] = [
  { char: 'V', threshold: 0.12, colorClass: 'red' },
  { char: 'E', threshold: 0.25, colorClass: 'red' },
  { char: 'L', threshold: 0.38, colorClass: 'red' },
  { char: 'O', threshold: 0.52, colorClass: 'white' },
  { char: 'C', threshold: 0.65, colorClass: 'white' },
  { char: 'E', threshold: 0.78, colorClass: 'white' },
];

interface LetterRevealSystemProps {
  /** ECG sweep progress 0→1 */
  progress: number;
  /** Whether the system is visible */
  visible: boolean;
}

/** Individual letter component with glow animation */
function RevealLetter({
  char,
  colorClass,
  revealed,
}: {
  char: string;
  colorClass: 'red' | 'white';
  revealed: boolean;
}) {
  const [hasGlowed, setHasGlowed] = useState(false);
  const prevRevealed = useRef(false);

  // Trigger glow flash on first reveal
  useEffect(() => {
    if (revealed && !prevRevealed.current) {
      setHasGlowed(true);
      const timeout = setTimeout(() => setHasGlowed(false), 600);
      prevRevealed.current = true;
      return () => clearTimeout(timeout);
    }
  }, [revealed]);

  const isRed = colorClass === 'red';

  return (
    <motion.span
      className="veloce-letter"
      style={{
        fontSize: 'clamp(8rem, 12vw, 14rem)',
        color: isRed ? '#B91C1C' : '#FDFDFD',
        WebkitTextStroke: isRed ? 'none' : '2.5px #374151',
        paintOrder: isRed ? 'normal' : 'stroke fill',
        display: 'inline-block',
        willChange: 'transform, opacity',
      }}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{
        opacity: revealed ? 1 : 0,
        y: revealed ? 0 : 30,
        scale: hasGlowed ? 1.05 : revealed ? 1 : 0.95,
      }}
      transition={{
        opacity: { duration: 0.25, ease: 'easeOut' },
        y: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
        scale: {
          duration: hasGlowed ? 0.15 : 0.3,
          ease: 'easeOut',
        },
      }}
    >
      {/* Glow overlay on entry */}
      <span
        className="relative"
        style={{
          textShadow: hasGlowed
            ? isRed
              ? '0 0 40px rgba(185, 28, 28, 0.7), 0 0 80px rgba(185, 28, 28, 0.4), 0 0 120px rgba(185, 28, 28, 0.2)'
              : '0 0 40px rgba(255, 255, 255, 0.6), 0 0 80px rgba(255, 255, 255, 0.3)'
            : revealed
              ? isRed
                ? '0 0 2px rgba(185, 28, 28, 0.15)'
                : '0 0 2px rgba(255, 255, 255, 0.1)'
              : 'none',
          transition: 'text-shadow 0.4s ease-out',
        }}
      >
        {char}
      </span>
    </motion.span>
  );
}

export default function LetterRevealSystem({ progress, visible }: LetterRevealSystemProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="letter-reveal"
          className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
          style={{ paddingBottom: '8vh' }}
          exit={{
            opacity: 0,
            scale: 0.9,
            transition: { duration: 0.5, ease: 'easeIn' },
          }}
        >
          <div
            className="flex items-center justify-center select-none"
            style={{
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
            aria-label="VELOCE"
            role="heading"
            aria-level={1}
          >
            {LETTERS.map((letter, i) => (
              <RevealLetter
                key={`${letter.char}-${i}`}
                char={letter.char}
                colorClass={letter.colorClass}
                revealed={progress > letter.threshold}
              />
            ))}
          </div>

          {/* Tagline — appears after all letters are revealed */}
          <motion.p
            className="absolute font-inter text-muted-text text-xs tracking-[0.35em] uppercase"
            style={{
              bottom: '28vh',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: progress > 0.9 ? 1 : 0,
              y: progress > 0.9 ? 0 : 10,
            }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Clinical Intelligence
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { LETTERS };
