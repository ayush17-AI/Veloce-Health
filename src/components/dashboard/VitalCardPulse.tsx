/**
 * VitalCardPulse — Heart Rate vital card
 * Dark glassmorphism + 3D flip entrance via scroll
 */
import { HeartPulse, Activity } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { motion } from 'framer-motion';

export default function VitalCardPulse() {
  return (
    <motion.div
      initial={{ rotateX: 90, opacity: 0 }}
      whileInView={{ rotateX: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 80,
        damping: 20,
        mass: 1,
        delay: 0,
      }}
      viewport={{ once: true, amount: 0.3 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <GlassCard className="p-8 h-72 flex flex-col justify-between group overflow-hidden">
        <div className="flex items-center justify-between z-10 w-full relative">
          <div>
            <h3 className="text-white/40 font-inter text-xs font-semibold mb-1 uppercase tracking-widest">
              Heart Rate
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-rajdhani font-bold text-white">84</span>
              <span className="text-sm font-inter text-[#E0F2FE] pb-1.5 font-medium">BPM</span>
            </div>
          </div>
          <div className="p-3 bg-[#DC2626]/15 rounded-xl text-[#DC2626] group-hover:bg-[#DC2626] group-hover:text-white transition-all duration-300 shadow-sm border border-[#DC2626]/20">
            <HeartPulse size={24} strokeWidth={2.5} />
          </div>
        </div>

        {/* Pulsing Heart Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none group-hover:opacity-[0.12] transition-opacity duration-700">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg
              width="220"
              height="220"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#DC2626"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
                fill="#DC2626"
              />
            </svg>
          </motion.div>
        </div>

        <div className="z-10 mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-inter font-medium text-white/40">
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-[#10B981] text-lg leading-none"
              >
                •
              </motion.span>
              <span>Live telemetry active</span>
            </div>
            <Activity size={14} className="text-[#E0F2FE]/50" />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
