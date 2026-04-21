/**
 * App.tsx — "The Pulse-Sync Experience" — Final Cinematic Orchestrator
 *
 * THE COMPLETE FLOW:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ Phase 0: Milk white canvas + "Scroll to Begin" prompt          │
 * │ Phase 1: ECG sweep → letters V-E-L-O-C-E reveal one-by-one    │
 * │ Phase 2: Equipment appears around completed logo (auto-timer)  │
 * │ Phase 3: Equipment dissolves + logo flight to TOP LEFT         │
 * │ Phase 4: Hospital background + scroll unlocked + discovery     │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * CRITICAL RULES:
 *   - ECG drives the branding (not a simple fade)
 *   - Logo moves to TOP LEFT (not right)
 *   - Hospital bg replaces sterile white at unlock
 *   - Discovery sections are scroll-driven 3D reveals
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HospitalEnvironment from './components/cinematic/HospitalEnvironment';
import ECGWaveSystem from './components/cinematic/ECGWaveSystem';
import LetterRevealSystem from './components/cinematic/LetterRevealSystem';
import EquipmentLayer from './components/cinematic/EquipmentLayer';
import BioStatusController from './components/cinematic/BioStatusController';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
/* ─── Phase Constants ─── */
const PHASE = {
  IDLE: 0,           // Waiting for first scroll
  ECG_SWEEP: 1,      // ECG sweeping + letter reveal
  EQUIPMENT: 2,      // Equipment appears around logo
  CLEARING: 3,       // Equipment dissolves + logo flight
  UNLOCKED: 4,       // Hospital bg + free scroll
} as const;

type Phase = (typeof PHASE)[keyof typeof PHASE];

const CLEARING_DURATION_MS = 1200; // Duration of the clearing transition

function Dashboard() {
  const [phase, setPhase] = useState<Phase>(PHASE.IDLE);
  const [ecgProgress, setEcgProgress] = useState(0);
  const lastScrollTime = useRef(0);
  const touchStartY = useRef(0);

  const isUnlocked = phase >= PHASE.UNLOCKED;

  /* ─── ECG Progress Callback ─── */
  const handleEcgProgress = useCallback((progress: number) => {
    setEcgProgress(progress);
  }, []);

  /* ─── ECG Completion → Auto-advance to Equipment ─── */
  const handleEcgComplete = useCallback(() => {
    // Auto-advance to equipment phase after a brief pause
    setTimeout(() => {
      setPhase(PHASE.EQUIPMENT);
    }, 600);
  }, []);

  /* ─── Equipment Display Timer → Auto-advance to Clearing on next scroll ─── */
  // Equipment stays visible until user scrolls again

  /* ─── Scroll Interception ─── */
  useEffect(() => {
    if (isUnlocked) {
      document.body.style.overflowY = 'auto';
      return;
    }

    document.body.style.overflowY = 'hidden';

    const advance = () => {
      const now = Date.now();
      if (now - lastScrollTime.current < 1200) return; // cooldown
      lastScrollTime.current = now;

      setPhase((prev) => {
        if (prev === PHASE.IDLE) return PHASE.ECG_SWEEP;
        if (prev === PHASE.EQUIPMENT) {
          // Start clearing, then auto-unlock
          setTimeout(() => {
            setPhase(PHASE.UNLOCKED);
          }, CLEARING_DURATION_MS);
          return PHASE.CLEARING;
        }
        return prev;
      });
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) advance();
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const dy = touchStartY.current - e.changedTouches[0].clientY;
      if (dy > 50) advance();
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isUnlocked]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflowY = 'auto';
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* ═══ Layer 0: Adaptive Background ═══ */}
      <HospitalEnvironment hospitalMode={isUnlocked} />

      {/* ═══ ECG WAVE SYSTEM (Phase 1) ═══ */}
      <AnimatePresence>
        {(phase === PHASE.ECG_SWEEP || (phase === PHASE.EQUIPMENT && !isUnlocked)) && (
          <motion.div
            key="ecg-system"
            className="fixed inset-0 z-10"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <ECGWaveSystem
              active={phase === PHASE.ECG_SWEEP}
              onProgress={handleEcgProgress}
              onComplete={handleEcgComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ LETTER REVEAL SYSTEM (Phases 1-3) ═══ */}
      <LetterRevealSystem
        progress={ecgProgress}
        visible={
          phase === PHASE.ECG_SWEEP ||
          phase === PHASE.EQUIPMENT
        }
      />

      {/* ═══ EQUIPMENT LAYER (Phase 2-3) ═══ */}
      <EquipmentLayer
        visible={phase === PHASE.EQUIPMENT || phase === PHASE.CLEARING}
        dissolving={phase === PHASE.CLEARING}
      />

      {/* ═══ NAVBAR LOGO (after unlock) ═══ */}
      <AnimatePresence>
        {isUnlocked && (
          <motion.div
            key="nav-logo"
            className="fixed top-5 left-8 z-[100] flex items-center gap-2"
            initial={{
              opacity: 0,
              scale: 0.3,
              x: 'calc(50vw - 50%)',
              y: 'calc(45vh - 50%)',
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
              y: 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 45,
              damping: 14,
              mass: 1.2,
              delay: 0.1,
            }}
          >
            <h1
              className="font-rajdhani font-bold tracking-tight leading-none select-none text-2xl"
              style={{
                textShadow: '0 2px 20px rgba(0,0,0,0.3)',
              }}
            >
              <span style={{ color: '#B91C1C' }}>VEL</span>
              <span
                style={{
                  color: '#FDFDFD',
                  WebkitTextStroke: '1px #374151',
                  paintOrder: 'stroke fill',
                }}
              >
                OCE
              </span>
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ SCROLL PROMPT (Phase 0 only) ═══ */}
      <AnimatePresence>
        {phase === PHASE.IDLE && (
          <motion.div
            key="scroll-prompt"
            className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <p className="text-[10px] font-inter text-muted-text tracking-[0.25em] uppercase mb-2">
                Scroll to Begin
              </p>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto"
              >
                <path d="M4 7L9 12L14 7" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ PHASE INDICATOR DOTS (Phases 1-3) ═══ */}
      <AnimatePresence>
        {phase >= PHASE.ECG_SWEEP && phase < PHASE.UNLOCKED && (
          <motion.div
            key="phase-dots"
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {[PHASE.ECG_SWEEP, PHASE.EQUIPMENT, PHASE.CLEARING].map((p) => (
              <motion.div
                key={p}
                className="rounded-full"
                animate={{
                  width: phase === p ? 20 : 6,
                  height: 6,
                  backgroundColor: phase >= p ? '#B91C1C' : '#D1D5DB',
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ MAIN CONTENT (Phase 4 — Hospital Mode) ═══ */}
      {isUnlocked && (
        <motion.main
          className="relative z-10"
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.2,
            delay: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {/* ── See-Saw Section — THE CENTERPIECE ── */}
          <section className="min-h-screen flex flex-col items-center justify-center py-16">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.7 }}
              viewport={{ once: true }}
            >
              <p className="text-[10px] font-inter font-semibold text-white/30 uppercase tracking-[0.3em] mb-2">
                Homeostasis Achieved
              </p>
              <h2 className="text-3xl md:text-4xl font-rajdhani font-bold text-white tracking-wide">
                The Medical Balance
              </h2>
              <p className="text-sm font-inter text-white/40 mt-2 max-w-md mx-auto">
                Heart rhythm and thermal precision in perfect equilibrium — your dual-sensor
                system visualized as homeostatic balance.
              </p>
            </motion.div>

            <motion.div
              className="w-full max-w-6xl mx-auto flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              viewport={{ once: true }}
            >
              <BioStatusController />
            </motion.div>

            {/* Sensor labels beneath the see-saw */}
            <motion.div
              className="flex justify-center gap-16 mt-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-center">
                <div className="w-8 h-[2px] bg-[#B91C1C] mx-auto mb-2" />
                <p className="text-[10px] font-inter text-white/30 uppercase tracking-wider">
                  Heartbeat
                </p>
                <p className="text-xs font-rajdhani font-bold text-white/60">
                  MAX30102
                </p>
              </div>
              <div className="text-center">
                <div className="w-8 h-[2px] bg-[#22C55E] mx-auto mb-2" />
                <p className="text-[10px] font-inter text-white/30 uppercase tracking-wider">
                  Temperature
                </p>
                <p className="text-xs font-rajdhani font-bold text-white/60">
                  MLX90614
                </p>
              </div>
            </motion.div>
          </section>





          {/* ── Footer ── */}
          <footer className="py-12 text-center border-t border-white/10">
            <p className="text-xs font-inter text-white/20 tracking-wider">
              VELOCE HEALTH — Clinical Intelligence Platform
            </p>
            <p className="text-[10px] font-inter text-white/10 mt-1">
              ESP32 Telemetry Ready · Dual Sensor Architecture
            </p>
          </footer>
        </motion.main>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* TEMPORARY BYPASS: Auth removed for testing */}
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
