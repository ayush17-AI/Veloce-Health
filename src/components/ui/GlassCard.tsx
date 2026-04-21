import { useRef } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  disableTilt?: boolean;
}

/**
 * GlassCard — Dark glassmorphism card with subtle 3D tilt
 * 
 * Features:
 * - Semi-transparent backdrop-blur
 * - Color-reactive glow from red/blue background bleed
 * - Micro-tilt on mouse move for depth
 */
export default function GlassCard({ children, className, disableTilt = false }: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], disableTilt ? ["0deg", "0deg"] : ["4deg", "-4deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], disableTilt ? ["0deg", "0deg"] : ["-4deg", "4deg"]);

  // Subtle highlight that follows cursor
  const highlightX = useTransform(mouseXSpring, [-0.5, 0.5], ["20%", "80%"]);
  const highlightY = useTransform(mouseYSpring, [-0.5, 0.5], ["20%", "80%"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
    if (!ref.current || disableTilt) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    if (disableTilt) return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "glass-panel glass-panel-hover relative overflow-hidden will-change-transform",
        className
      )}
    >
      {/* Cursor-following inner glow */}
      {!disableTilt && (
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(400px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(255,255,255,0.06), transparent 60%)`,
            // @ts-expect-error CSS custom props
            '--glow-x': highlightX,
            '--glow-y': highlightY,
          }}
        />
      )}
      {children}
    </motion.div>
  );
}
