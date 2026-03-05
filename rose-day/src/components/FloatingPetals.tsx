import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Petal {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
  hue: number;
}

interface FloatingPetalsProps {
  count?: number;
}

const FloatingPetals = ({ count = 20 }: FloatingPetalsProps) => {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const generatedPetals: Petal[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 15 + Math.random() * 25,
      delay: Math.random() * 10,
      duration: 10 + Math.random() * 15,
      rotation: Math.random() * 360,
      hue: 351 + (Math.random() - 0.5) * 20,
    }));
    setPetals(generatedPetals);
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute"
          initial={{
            top: -100,
            left: `${petal.x}%`,
            rotate: petal.rotation,
            opacity: 0,
          }}
          animate={{
            top: '110%',
            left: `${petal.x + (Math.random() - 0.5) * 30}%`,
            rotate: petal.rotation + 720,
            opacity: [0, 0.8, 0.8, 0.3],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg
            width={petal.size}
            height={petal.size * 1.5}
            viewBox="0 0 20 30"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(193, 18, 31, 0.2))' }}
          >
            <defs>
              <linearGradient id={`petalGrad-${petal.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={`hsl(${petal.hue}, 100%, 85%)`} />
                <stop offset="100%" stopColor={`hsl(${petal.hue}, 85%, 55%)`} />
              </linearGradient>
            </defs>
            <path
              d="M10 0 C15 8, 20 15, 15 25 C12 28, 8 28, 5 25 C0 15, 5 8, 10 0 Z"
              fill={`url(#petalGrad-${petal.id})`}
            />
            <path
              d="M10 5 C12 10, 14 15, 12 22"
              stroke={`hsl(${petal.hue}, 70%, 45%)`}
              strokeWidth="0.5"
              fill="none"
              opacity={0.3}
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingPetals;
