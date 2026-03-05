import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollContext } from '@/contexts/ScrollContext';

interface Rose {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  message: string;
}

const loveMessages = [
  "You are my forever rose 🌹",
  "Love blooms where you are",
  "My heart beats for you",
  "You make every day Valentine's Day",
  "If I had a rose for every time you made my heart skip, I’d have a whole garden by now.",
  "This rose isn’t as beautiful as you… but I figured I’d still give you the second-best thing in the world",
  "You are the most beautiful bloom",
  "Together, we create magic",
  "My love for you is eternal",
  "Roses may fade, but choosing you never will",
  "Every petal whispers your name",
  "In you, I found my paradise",
];

const RoseGarden = () => {
  const [selectedRose, setSelectedRose] = useState<Rose | null>(null);
  const scrollContext = useScrollContext();
  
  const roses: Rose[] = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 10 + (i % 4) * 25 + (Math.random() - 0.5) * 10,
    y: 10 + Math.floor(i / 4) * 30 + (Math.random() - 0.5) * 10,
    scale: 0.8 + Math.random() * 0.4,
    rotation: (Math.random() - 0.5) * 30,
    message: loveMessages[i],
  }));

  return (
    <section className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 min-h-screen overflow-hidden">
      {/* Background gradient (parallax) */}
      <motion.div 
        className="absolute inset-0"
        style={
          scrollContext
            ? { y: scrollContext.backgroundY, background: 'linear-gradient(180deg, hsl(36, 100%, 97%) 0%, hsl(351, 78%, 95%) 50%, hsl(36, 100%, 97%) 100%)' }
            : { background: 'linear-gradient(180deg, hsl(36, 100%, 97%) 0%, hsl(351, 78%, 95%) 50%, hsl(36, 100%, 97%) 100%)' }
        }
      />
      
      <div className="relative container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 sm:mb-16"
        >
          <span className="text-4xl sm:text-5xl mb-3 sm:mb-4 block">🌷</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            The Rose Garden
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-md mx-auto px-2">
            Tap each rose to discover hidden messages of love
          </p>
        </motion.div>

        {/* Rose Garden */}
        <div className="relative aspect-[4/3] max-w-4xl mx-auto min-h-[280px] sm:min-h-[320px]">
          {/* Ground decoration */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-32"
            style={{
              background: 'linear-gradient(to top, hsl(122, 39%, 85%) 0%, transparent 100%)',
              borderRadius: '50% 50% 0 0',
            }}
          />
          
          {roses.map((rose, index) => (
            <motion.div
              key={rose.id}
              className="absolute cursor-pointer"
              style={{
                left: `${rose.x}%`,
                top: `${rose.y}%`,
                transform: `scale(${rose.scale})`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: rose.scale }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: "spring" }}
              whileHover={{ scale: rose.scale * 1.3, zIndex: 10 }}
              onClick={() => setSelectedRose(rose)}
              data-interactive
            >
              <motion.div
                className="relative"
                animate={{ rotate: rose.rotation }}
                whileHover={{ rotate: 0 }}
              >
                {/* Rose stem */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-20 bg-gradient-to-b from-leaf to-leaf/60 rounded-full" />
                
                {/* Leaves */}
                <div className="absolute top-16 left-1/2 -translate-x-8 w-6 h-4 bg-leaf rounded-full transform -rotate-45" />
                <div className="absolute top-20 left-1/2 translate-x-2 w-6 h-4 bg-leaf/80 rounded-full transform rotate-45" />
                
                {/* Rose bloom */}
                <motion.div
                  className="relative w-16 h-16 flex items-center justify-center"
                  whileHover={{ 
                    filter: 'drop-shadow(0 0 20px hsl(351, 100%, 75%))',
                  }}
                >
                  <span className="text-5xl select-none">🌹</span>
                </motion.div>
                
                {/* Hover tooltip */}
                <motion.div
                  className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap"
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                >
                  <div className="glass px-4 py-2 rounded-full text-sm text-rose-deep shadow-rose">
                    Click to reveal message
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Message Modal */}
      <AnimatePresence>
        {selectedRose && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6"
              onClick={() => setSelectedRose(null)}
            >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring" }}
              className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-glow"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="text-5xl sm:text-6xl mb-3 sm:mb-4"
              >
                🌹
              </motion.div>
              
              <p className="font-serif text-xl sm:text-2xl text-rose-deep italic mb-4 sm:mb-6 leading-snug">
                "{selectedRose.message}"
              </p>
              
              <motion.div
                className="flex justify-center gap-2 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {[...Array(3)].map((_, i) => (
                  <motion.span
                    key={i}
                    className="text-xl"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  >
                    💕
                  </motion.span>
                ))}
              </motion.div>
              
              <button
                onClick={() => setSelectedRose(null)}
                className="min-h-[44px] px-6 py-2.5 sm:py-2 bg-rose-soft text-rose-deep rounded-full font-medium hover:bg-rose-glow/30 transition-colors text-sm sm:text-base"
                data-interactive
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default RoseGarden;
