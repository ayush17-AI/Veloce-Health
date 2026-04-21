/**
 * ECGWaveSystem — The Core Driver
 *
 * A Blood Red ECG line sweeps left → right across the screen.
 * Exposes a `progress` value (0→1) that drives the letter reveal system.
 *
 * Features:
 *   - Clinical P-QRS-T waveform SVG path
 *   - Smooth left-to-right animation (4s duration)
 *   - Vertical scan cursor with glow
 *   - Faint baseline always visible ("system is on")
 *   - Ghost trace remains after sweep completes
 */
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

/* ── Realistic P-QRS-T ECG Path (viewBox 0 0 1400 200, baseline y=100) ── */
const ECG_PATH =
  'M 0,100 L 280,100 ' +
  'C 310,100 325,85 340,85 C 355,85 365,100 380,100 ' +
  'L 500,100 ' +
  'L 520,115 ' +
  'L 555,8 ' +
  'L 590,165 ' +
  'L 618,100 ' +
  'L 750,100 ' +
  'C 790,100 820,60 855,60 C 890,60 920,100 955,100 ' +
  'L 1400,100';

const SWEEP_DURATION = 4.0;

const QRS_PEAK_POSITION = 555 / 1400;

interface ECGWaveSystemProps {
  active: boolean;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

export default function ECGWaveSystem({ active, onProgress, onComplete }: ECGWaveSystemProps) {
  const progress = useMotionValue(0);
  const smoothProgress = useSpring(progress, { stiffness: 300, damping: 40 });
  const [sweepDone, setSweepDone] = useState(false);
  const completedRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  // Derive the cursor X position from smoothProgress (always computed, not conditional)
  const cursorX = useTransform(smoothProgress, (v) => v * 1400);

  // Drive the sweep via requestAnimationFrame for precision
  useEffect(() => {
    if (!active || sweepDone) return;

    startTimeRef.current = null;
    completedRef.current = false;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = (timestamp - startTimeRef.current) / 1000;
      const p = Math.min(elapsed / SWEEP_DURATION, 1);

      progress.set(p);
      onProgress?.(p);

      if (p >= 1 && !completedRef.current) {
        completedRef.current = true;
        setSweepDone(true);
        onComplete?.();
        return;
      }

      if (p < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, sweepDone, progress, onProgress, onComplete]);

  return (
    <div
      className="fixed inset-0 z-10 pointer-events-none flex items-center"
      style={{ paddingTop: '4vh' }}
    >
      <svg
        className="w-full"
        viewBox="0 0 1400 200"
        preserveAspectRatio="none"
        style={{ height: '28vh' }}
        fill="none"
      >
        {/* Glow definitions */}
        <defs>
          <filter id="ecg-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Clip path for progressive reveal */}
          <clipPath id="ecg-clip">
            <motion.rect
              x={0}
              y={0}
              width={1400}
              height={200}
              style={{
                scaleX: smoothProgress,
                transformOrigin: '0 0',
              }}
            />
          </clipPath>
        </defs>

        {/* Faint baseline — always visible ("system is on") */}
        <line
          x1="0" y1="100"
          x2="1400" y2="100"
          stroke="#E5E7EB"
          strokeWidth="0.8"
          strokeDasharray="6 10"
          opacity={0.4}
        />

        {/* Ghost trace (visible after sweep completes) */}
        {sweepDone && (
          <path
            d={ECG_PATH}
            stroke="#B91C1C"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.12}
            fill="none"
          />
        )}

        {/* Active ECG trace — clipped by sweep progress */}
        {active && (
          <g clipPath="url(#ecg-clip)">
            <path
              d={ECG_PATH}
              stroke="#B91C1C"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              filter="url(#ecg-glow)"
            />
            <path
              d={ECG_PATH}
              stroke="#DC2626"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={0.5}
            />
          </g>
        )}

        {/* Sweep scan cursor — vertical line tracking sweep head */}
        {active && !sweepDone && (
          <motion.rect
            width={2}
            height={200}
            y={0}
            fill="#B91C1C"
            opacity={0.2}
            style={{ x: cursorX }}
          />
        )}
      </svg>
    </div>
  );
}

export { QRS_PEAK_POSITION, SWEEP_DURATION };
