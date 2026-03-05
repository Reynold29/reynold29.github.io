import { lazy, Suspense, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollContext } from '@/contexts/ScrollContext';

const BURST_PETALS = 12;
const burstConfig = Array.from(
  { length: BURST_PETALS },
  (_, i) => ({
    angle: (i / BURST_PETALS) * Math.PI * 2,
    dist: 100 + (i % 4) * 25,
    emoji: i % 3 === 0 ? '🌹' : '💕',
  })
);

const Rose3D = lazy(() => import('./Rose3D'));

const Rose3DFallback = () => (
  <div className="w-full h-full flex items-center justify-center bg-rose-soft/10 rounded-2xl">
    <motion.span
      className="text-8xl"
      animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      🌹
    </motion.span>
  </div>
);

const HeroSection = () => {
  const scrollContext = useScrollContext();
  const [showBurst, setShowBurst] = useState(false);

  const handleSendRose = useCallback(() => {
    const forHer = document.getElementById('for-her');
    if (forHer) {
      forHer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setShowBurst(true);
    const t = setTimeout(() => setShowBurst(false), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-hero pt-14 pb-10 sm:pt-20 sm:pb-16 md:pt-24 md:pb-20">
      {/* Decorative elements with parallax */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Vignette effect */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, hsl(351, 78%, 92%, 0.3) 70%, hsl(351, 60%, 85%, 0.6) 100%)',
          }}
        />
        
        {/* Decorative circles (parallax + breathing) */}
        <motion.div 
          className="absolute top-20 left-10 w-64 h-64 rounded-full bg-rose-soft/20 blur-3xl"
          style={scrollContext ? { y: scrollContext.backgroundY } : undefined}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-rose-glow/20 blur-3xl"
          style={scrollContext ? { y: scrollContext.backgroundY } : undefined}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Valentine's Week Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute top-6 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="glass px-6 py-2 rounded-full flex items-center gap-2 whitespace-nowrap">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Valentine's Week</span>
          <span className="w-1 h-1 rounded-full bg-rose-deep" />
          <span className="text-sm font-semibold text-rose-deep">Rose Day • Feb 7</span>
          <span className="animate-pulse">🌹</span>
        </div>
      </motion.div>

      {/* Main Content - extra top padding so CTA isn't clipped */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-4 sm:pt-6 flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-12 min-h-0 flex-1 w-full">
        {/* Text Content */}
        <motion.div 
          className="text-center lg:text-left max-w-xl w-full"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="inline-block mb-4"
          >
            <span className="text-5xl sm:text-6xl">🌹</span>
          </motion.div>
          
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
            <span className="text-romantic">A Rose</span>
            <br />
            <span className="text-foreground">for You, My Love</span>
          </h1>
          
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 italic font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            "Because some feelings are better said with a rose"
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start"
          >
            <button 
              className="group relative min-h-[44px] min-w-[44px] px-6 py-3 sm:px-8 sm:py-4 bg-primary text-primary-foreground rounded-full font-medium shadow-rose hover:shadow-glow transition-all duration-300 overflow-hidden text-sm sm:text-base"
              onClick={handleSendRose}
              data-interactive
            >
              <span className="relative z-10">Send a Rose</span>
              <div className="absolute inset-0 bg-gradient-to-r from-rose-deep to-rose-glow opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </motion.div>
        </motion.div>

        {/* 3D Rose (lazy-loaded) - 3D rotation follows cursor/touch, resets after 2s */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5, type: "spring" }}
          className="w-full max-w-[min(85vw,320px)] sm:max-w-md lg:max-w-lg aspect-square min-h-[240px] sm:min-h-[280px]"
        >
          <Suspense fallback={<Rose3DFallback />}>
            <Rose3D className="w-full h-full" />
          </Suspense>
        </motion.div>
      </div>

      {/* Rose burst celebration on Send a Rose */}
      <AnimatePresence>
        {showBurst && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {burstConfig.map(({ angle, dist, emoji }, i) => {
              const x = Math.cos(angle) * dist;
              const y = Math.sin(angle) * dist;
              return (
                <motion.span
                  key={i}
                  className="absolute text-4xl"
                  initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                  animate={{
                    scale: [0, 1.2, 0.8],
                    x: [0, x],
                    y: [0, y],
                    opacity: [1, 0.8, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    delay: i * 0.02,
                    ease: 'easeOut',
                  }}
                >
                  {emoji}
                </motion.span>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default HeroSection;
