/**
 * ECGWave — Animated P-QRS-T ECG trace with cinematic left-to-right sweep
 *
 * Each scroll phase triggers a new heartbeat sweep across the screen.
 * Previous sweeps dim to ghost traces — like a real patient monitor.
 *
 * Props:
 *   phase (0-5): Current scroll phase
 *     0: Faint baseline only
 *     1-3: Each triggers a new P-QRS-T sweep
 *     4+: ECG fades out
 */
import { motion } from 'framer-motion';

/* ── ECG Path Data (viewBox 0 0 1400 200, baseline y=100) ── */
const ecgPaths = [
  // Sweep 1 — standard clinical
  'M 0,100 L 350,100 C 380,100 392,82 410,82 C 428,82 440,100 452,100 L 538,100 L 552,112 L 578,15 L 604,155 L 628,100 L 738,100 C 774,100 804,68 834,68 C 864,68 894,100 924,100 L 1400,100',
  // Sweep 2 — tighter QRS, slightly more intense
  'M 0,100 L 310,100 C 340,100 352,78 372,78 C 392,78 402,100 414,100 L 506,100 L 520,115 L 550,10 L 580,162 L 608,100 L 724,100 C 762,100 794,62 824,62 C 854,62 884,100 914,100 L 1400,100',
  // Sweep 3 — most dramatic, highest R-wave
  'M 0,100 L 280,100 C 310,100 322,75 342,75 C 362,75 372,100 384,100 L 478,100 L 492,118 L 526,5 L 560,170 L 590,100 L 708,100 C 746,100 778,55 808,55 C 838,55 868,100 898,100 L 1400,100',
];

interface ECGWaveProps {
  phase: number;
}

export default function ECGWave({ phase }: ECGWaveProps) {
  const activeSweeps = Math.min(Math.max(phase, 0), 3);

  return (
    <div
      className="fixed inset-0 z-10 pointer-events-none flex items-center"
      style={{
        opacity: phase >= 4 ? 0 : 1,
        transition: 'opacity 1s ease-out',
        paddingTop: '8vh',
      }}
    >
      <svg
        className="w-full"
        viewBox="0 0 1400 200"
        preserveAspectRatio="none"
        style={{ height: '25vh' }}
        fill="none"
      >
        {/* Faint baseline — always visible (system is "on") */}
        <line
          x1="0" y1="100"
          x2="1400" y2="100"
          stroke="#E5E7EB"
          strokeWidth="0.8"
          strokeDasharray="6 10"
          opacity={0.4}
        />

        {/* ECG sweep traces */}
        {ecgPaths.map((d, i) => {
          const sweepIndex = i + 1;
          if (sweepIndex > activeSweeps) return null;

          const isCurrent = sweepIndex === activeSweeps;
          const ghostOpacity = Math.max(0.06, 0.15 - (activeSweeps - sweepIndex) * 0.04);

          return (
            <motion.path
              key={`sweep-${i}`}
              d={d}
              stroke="#B91C1C"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0, strokeWidth: 2.5 }}
              animate={{
                pathLength: 1,
                opacity: isCurrent ? 0.9 : ghostOpacity,
                strokeWidth: isCurrent ? 2.5 : 1,
              }}
              transition={{
                pathLength: { duration: 2.5, ease: 'linear' },
                opacity: { duration: isCurrent ? 0.4 : 0.8, delay: isCurrent ? 0 : 0 },
                strokeWidth: { duration: 0.6 },
              }}
            />
          );
        })}

        {/* Sweep scan line — vertical cursor sweeping left to right */}
        {activeSweeps > 0 && activeSweeps <= 3 && (
          <motion.rect
            key={`cursor-${activeSweeps}`}
            width={2}
            height={200}
            y={0}
            fill="#B91C1C"
            opacity={0.15}
            initial={{ x: 0 }}
            animate={{ x: 1400 }}
            transition={{ duration: 2.5, ease: 'linear' }}
          />
        )}

        {/* Glow filter for the trace head */}
        <defs>
          <filter id="ecg-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}
