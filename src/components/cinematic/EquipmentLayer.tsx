/**
 * EquipmentLayer — Medical Equipment Silhouettes (4 pieces)
 *
 * Appears AFTER the full VELOCE word is revealed.
 * Equipment surrounds the massive centered logo.
 *
 * Items:
 *   - Stethoscope (top-left)
 *   - IV Drip Stand (bottom-left)
 *   - Blood Pressure Monitor (top-right)
 *   - Reflex Hammer (bottom-right)
 *
 * Entry: fade-in + upward motion, staggered
 * Exit: dissolve outward (drift from center) via AnimatePresence
 */
import { motion } from 'framer-motion';

/* ═══════════════════════════════════════════════
   SVG Medical Equipment Icons (clean silhouette)
   ═══════════════════════════════════════════════ */

const Stethoscope = () => (
  <svg width="64" height="82" viewBox="0 0 56 72" fill="none" stroke="#1F2937" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="14" cy="6" r="4" />
    <circle cx="42" cy="6" r="4" />
    <path d="M14 10V22C14 30 28 34 28 34" />
    <path d="M42 10V22C42 30 28 34 28 34" />
    <path d="M28 34V52" />
    <circle cx="28" cy="60" r="8" />
    <circle cx="28" cy="60" r="3" fill="#1F2937" />
  </svg>
);

const BPMonitor = () => (
  <svg width="64" height="82" viewBox="0 0 56 72" fill="none" stroke="#1F2937" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="22" width="44" height="26" rx="4" />
    <circle cx="28" cy="12" r="9" />
    <line x1="28" y1="6" x2="28" y2="10" />
    <line x1="22" y1="12" x2="28" y2="12" />
    <path d="M28 21V22" />
    <path d="M28 48C28 48 20 54 20 60C20 64 24 68 28 68C32 68 36 64 36 60C36 54 28 48 28 48Z" />
  </svg>
);

const IVDrip = () => (
  <svg width="44" height="94" viewBox="0 0 36 84" fill="none" stroke="#1F2937" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 14V76" />
    <path d="M8 76H28" />
    <path d="M8 76L4 80M28 76L32 80" />
    <path d="M12 14L18 8L24 14" />
    <rect x="11" y="14" width="14" height="20" rx="3" />
    <path d="M18 34V48" strokeDasharray="2 3" />
    <rect x="15" y="48" width="6" height="5" rx="1" />
    <path d="M18 53V60" strokeDasharray="2 3" />
  </svg>
);

const ReflexHammer = () => (
  <svg width="56" height="82" viewBox="0 0 48 72" fill="none" stroke="#1F2937" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M24 22V64" />
    <path d="M8 22C8 14 16 8 24 8C32 8 40 14 40 22C40 26 34 28 24 28C14 28 8 26 8 22Z" />
    <circle cx="24" cy="66" r="4" />
  </svg>
);

/* ═══════════════════════════════════════════════
   Equipment Configuration
   ═══════════════════════════════════════════════ */

const equipmentItems = [
  {
    id: 'stethoscope',
    x: '10%',
    y: '15%',
    Icon: Stethoscope,
    delay: 0,
    driftX: -60,
    driftY: -40,
  },
  {
    id: 'iv-drip',
    x: '12%',
    y: '65%',
    Icon: IVDrip,
    delay: 0.15,
    driftX: -60,
    driftY: 40,
  },
  {
    id: 'bp-monitor',
    x: '82%',
    y: '18%',
    Icon: BPMonitor,
    delay: 0.3,
    driftX: 60,
    driftY: -40,
  },
  {
    id: 'reflex-hammer',
    x: '84%',
    y: '62%',
    Icon: ReflexHammer,
    delay: 0.45,
    driftX: 60,
    driftY: 40,
  },
];

/* ═══════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════ */

interface EquipmentLayerProps {
  /** Equipment is visible */
  visible: boolean;
  /** Equipment is dissolving outward */
  dissolving: boolean;
}

export default function EquipmentLayer({ visible, dissolving }: EquipmentLayerProps) {
  return (
    <div className="fixed inset-0 z-20 pointer-events-none" aria-hidden="true">
      {equipmentItems.map((item) => (
        <motion.div
          key={item.id}
          className="absolute"
          style={{ left: item.x, top: item.y }}
          initial={{ opacity: 0, y: 20, scale: 0.7 }}
          animate={{
            opacity: dissolving ? 0 : visible ? 0.5 : 0,
            y: dissolving ? item.driftY : visible ? 0 : 20,
            x: dissolving ? item.driftX : 0,
            scale: dissolving ? 0.3 : visible ? 1 : 0.7,
          }}
          transition={{
            duration: dissolving ? 0.9 : 0.7,
            delay: visible && !dissolving ? item.delay : 0,
            ease: dissolving
              ? [0.4, 0, 1, 1]
              : [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {/* Subtle floating animation when visible */}
          <motion.div
            animate={
              visible && !dissolving
                ? {
                    y: [0, -4, 0],
                  }
                : {}
            }
            transition={{
              duration: 3 + item.delay * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <item.Icon />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
