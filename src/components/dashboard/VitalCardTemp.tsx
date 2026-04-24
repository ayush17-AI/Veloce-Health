/**
 * VitalCardTemp — Body Temperature vital card
 * Dark glassmorphism + 3D flip entrance with stagger delay
 */
import { Thermometer } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { motion } from 'framer-motion';

export default function VitalCardTemp() {
  return (
    <motion.div
      initial={{ rotateX: 90, opacity: 0 }}
      whileInView={{ rotateX: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 80,
        damping: 20,
        mass: 1,
        delay: 0.15,
      }}
      viewport={{ once: true, amount: 0.3 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <GlassCard className="p-8 h-72 flex flex-col justify-between group overflow-hidden">
        <div className="flex items-center justify-between z-10 w-full mb-6 relative">
          <div>
            <h3 className="text-white/40 font-inter text-xs font-semibold mb-1 uppercase tracking-widest">
              Body Temp
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-rajdhani font-bold text-white">37.0</span>
              <span className="text-sm font-inter text-[#E0F2FE] pb-1.5 font-medium">°C</span>
            </div>
          </div>
          <div className="p-3 bg-[#E0F2FE]/10 rounded-xl text-[#E0F2FE] group-hover:bg-[#E0F2FE] group-hover:text-[#0A0A0A] transition-all duration-300 shadow-sm border border-[#E0F2FE]/20">
            <Thermometer size={24} strokeWidth={2.5} />
          </div>
        </div>

        {/* Animated Liquid Thermometer Visual */}
        <div className="flex-1 flex items-center justify-center relative w-full h-full z-10">
          <div className="w-6 h-32 bg-white/5 rounded-t-full rounded-b-xl border border-white/10 shadow-inner relative overflow-hidden flex self-center mr-8">
            {/* Tick marks */}
            <div className="absolute left-1/2 -translateX-1/2 top-3 bottom-3 w-full flex flex-col justify-between gap-1 mix-blend-overlay opacity-20 pointer-events-none z-20">
              <div className="w-1/2 h-[1px] bg-white mx-auto" />
              <div className="w-3/4 h-[1px] bg-white mx-auto" />
              <div className="w-1/2 h-[1px] bg-white mx-auto" />
              <div className="w-3/4 h-[1px] bg-white mx-auto" />
              <div className="w-1/2 h-[1px] bg-white mx-auto" />
            </div>

            <motion.div
              initial={{ height: '0%' }}
              whileInView={{ height: '70%' }}
              transition={{ duration: 1.5, type: 'spring', bounce: 0.2, delay: 0.6 }}
              viewport={{ once: true }}
              className="absolute bottom-0 w-full bg-[#E0F2FE] rounded-b-xl z-10"
              style={{ boxShadow: '0 0 12px rgba(224,242,254,0.4)' }}
            />
          </div>

          {/* Subtle trend graph bars */}
          <div className="w-full flex gap-1.5 items-end h-16 ml-4">
            {[40, 50, 45, 60, 55, 70, 65, 85, 75, 80].map((val, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                whileInView={{ height: `${val}%` }}
                transition={{ duration: 1, type: 'spring', delay: 0.1 * i + 0.5 }}
                viewport={{ once: true }}
                className="flex-1 rounded-t-sm bg-[#E0F2FE]/15 group-hover:bg-[#E0F2FE]/30 transition-colors"
              />
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
