import { motion } from 'framer-motion';
import { useScrollContext } from '@/contexts/ScrollContext';

const ForHerSection = () => {
  const message = "A Rose for MY woman who colors MY world with love";
  const scrollContext = useScrollContext();

  return (
    <section id="for-her" className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 overflow-hidden">
      {/* Background decoration (parallax) */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-rose-blush/30 to-transparent"
        style={scrollContext ? { y: scrollContext.backgroundY } : undefined}
      />

      <div className="relative container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 sm:mb-16"
        >
          <span className="text-3xl sm:text-4xl mb-3 sm:mb-4 block">💐</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            For You, Sharon
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto px-2">
            A personalized message of love, for my Baby!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-rose relative overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-soft to-rose-glow opacity-10 pointer-events-none" />

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", delay: 0.2 }}
                className="text-3xl sm:text-4xl mb-3 sm:mb-4"
              >
                🌹
              </motion.div>
              <p className="font-serif text-xl sm:text-2xl md:text-3xl text-rose-deep italic leading-snug">
                "{message}"
              </p>
              <motion.div
                className="mt-6 flex justify-center gap-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                {[...Array(5)].map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="text-xl"
                  >
                    🌹
                  </motion.span>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ForHerSection;
