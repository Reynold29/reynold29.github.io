import { motion } from 'framer-motion';
import { useScrollContext } from '@/contexts/ScrollContext';

const Footer = () => {
  const scrollContext = useScrollContext();

  return (
    <footer className="relative overflow-visible min-h-[50vh] pt-20 pb-24 sm:pt-24 sm:pb-28 md:pt-28 md:pb-32">
      {/* Background (parallax) */}
      <motion.div 
        className="absolute inset-0"
        style={
          scrollContext
            ? { y: scrollContext.backgroundY, background: 'linear-gradient(180deg, hsl(36, 100%, 97%) 0%, hsl(351, 78%, 92%) 100%)' }
            : { background: 'linear-gradient(180deg, hsl(36, 100%, 97%) 0%, hsl(351, 78%, 92%) 100%)' }
        }
      />
      
      <div className="relative container mx-auto max-w-4xl text-center py-10 sm:py-14 px-6 sm:px-8 md:px-10 overflow-visible">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="min-h-0 overflow-visible"
        >
          {/* Rose decoration */}
          <div className="flex justify-center gap-1.5 sm:gap-2 mb-8 sm:mb-10">
            {[...Array(5)].map((_, i) => (
              <motion.span
                key={i}
                className="text-3xl sm:text-4xl"
                animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
              >
                🌹
              </motion.span>
            ))}
          </div>
          
          {/* Wrapper with room for ascenders/descenders so gradient text isn't clipped */}
          <div className="py-6 sm:py-8 overflow-visible">
            <h3 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 tracking-tight break-words px-4 sm:px-6 leading-[1.25]">
              <span
                className="inline-block bg-gradient-to-r from-rose-deep via-rose-glow to-rose-deep bg-clip-text text-transparent py-[0.2em] drop-shadow-[0_2px_8px_hsl(351,78%,92%)]"
                style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                Happy Rose Day
              </span>
            </h3>
          </div>
          <div className="flex justify-center mb-4">
            <span className="block h-1 w-24 sm:w-32 rounded-full bg-gradient-to-r from-transparent via-rose-deep/60 to-transparent" />
          </div>
          
          <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto px-2">
          Just a reminder that you've already got my heart in full bloom 🌹😘💕
          </p>
          
          {/* Valentine's week */}
          <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md mx-auto mb-8 sm:mb-10">
            <h4 className="font-serif text-base sm:text-lg text-foreground mb-3 sm:mb-4">You make me whole, baby! I love you more than words can say 💕</h4>

          </div>
          
          <p className="text-xs sm:text-sm text-muted-foreground">
            Made with LOVE 💕🌹 By Your Guy • Rose Day 2026
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
