'use client';

import React, { useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const PARTICLE_COUNT = 50;
const COLORS = [
  '#ff6b6b',
  '#feca57',
  '#48dbfb',
  '#ff9ff3',
  '#54a0ff',
  '#5f27cd',
  '#01a3a4',
  '#ff6348',
];

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  xVel: number;
  yVel: number;
  type: 'circle' | 'square' | 'triangle';
}

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 20,
    y: 40,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * 360,
    scale: 0.5 + Math.random() * 0.8,
    xVel: (Math.random() - 0.5) * 80,
    yVel: -40 - Math.random() * 60,
    type: (['circle', 'square', 'triangle'] as const)[Math.floor(Math.random() * 3)],
  }));
}

export function Confetti() {
  const { showConfetti } = useApp();
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    if (showConfetti) {
      particles.current = generateParticles();
    }
  }, [showConfetti]);

  if (!showConfetti) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <AnimatePresence>
        {particles.current.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: 1,
              scale: 0,
              rotate: 0,
            }}
            animate={{
              left: `${particle.x + particle.xVel}%`,
              top: `${particle.y + 120}%`,
              opacity: [1, 1, 0],
              scale: particle.scale,
              rotate: particle.rotation + 720,
            }}
            transition={{
              duration: 2 + Math.random(),
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="absolute"
            style={{ color: particle.color }}
          >
            {particle.type === 'circle' && (
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: particle.color }} />
            )}
            {particle.type === 'square' && (
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: particle.color }} />
            )}
            {particle.type === 'triangle' && (
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderBottom: `8px solid ${particle.color}`,
                }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
