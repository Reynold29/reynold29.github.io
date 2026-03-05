import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollContext } from '@/contexts/ScrollContext';
import { getAuthenticatedImagePath, PHOTOS_UNLOCKED_EVENT, dispatchPhotosUnlocked } from '@/lib/photoAuth';

const API = {
  check: () => fetch('/api/auth/check', { credentials: 'include' }).then((r) => r.json()),
  unlock: (password: string) =>
    fetch('/api/auth/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
      credentials: 'include',
    }),
  lock: () =>
    fetch('/api/auth/lock', {
      method: 'POST',
      credentials: 'include',
    }),
};

const PHOTOS = [
  { filename: 'selfie.JPG', caption: 'Cheeky Selfie ☕' },
  { filename: 'mirror.JPG', caption: 'Dirty Mirror Pic' },
  { filename: 'together.JPG', caption: 'US Together, Baby! 💕' },
];

function PhotoCard({
  filename,
  caption,
  index,
}: {
  filename: string;
  caption: string;
  index: number;
}) {
  const [loadError, setLoadError] = useState(false);
  const src = getAuthenticatedImagePath(filename);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
      style={{ transform: `rotate(${index % 2 === 0 ? -2 : 2}deg)` }}
    >
      <div className="bg-white/95 p-2 pb-8 rounded-lg shadow-lg hover:shadow-rose transition-shadow duration-300 hover:-translate-y-1">
        <div className="aspect-[4/3] rounded-md overflow-hidden bg-muted flex items-center justify-center">
          {loadError ? (
            <span className="text-4xl text-muted-foreground">📷</span>
          ) : (
            <img
              src={src}
              alt={caption}
              className="w-full h-full object-cover"
              onError={() => setLoadError(true)}
            />
          )}
        </div>
        <p className="text-center text-sm font-medium text-foreground mt-2 text-rose-deep/90">
          {caption}
        </p>
      </div>
    </motion.div>
  );
}

export default function PhotoLockSection() {
  const scrollContext = useScrollContext();
  const [photosUnlocked, setPhotosUnlocked] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const data = await API.check();
      setPhotosUnlocked(data.unlocked === true);
    } catch {
      setPhotosUnlocked(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await API.lock();
      await new Promise((r) => setTimeout(r, 400));
      await checkAuth();
    })();
  }, [checkAuth]);

  useEffect(() => {
    const handler = () => checkAuth();
    window.addEventListener(PHOTOS_UNLOCKED_EVENT, handler);
    return () => window.removeEventListener(PHOTOS_UNLOCKED_EVENT, handler);
  }, [checkAuth]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    try {
      const res = await API.unlock(password.trim());
      if (res.ok) {
        setPassword('');
        dispatchPhotosUnlocked();
        setPhotosUnlocked(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
  };

  return (
    <section className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={
          scrollContext
            ? {
                y: scrollContext.backgroundY,
                background:
                  'linear-gradient(180deg, hsl(351, 78%, 95%) 0%, hsl(36, 100%, 97%) 50%, hsl(351, 78%, 95%) 100%)',
              }
            : {
                background:
                  'linear-gradient(180deg, hsl(351, 78%, 95%) 0%, hsl(36, 100%, 97%) 50%, hsl(351, 78%, 95%) 100%)',
              }
        }
      />
      <div className="relative container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <span className="text-4xl sm:text-5xl mb-3 block">📷</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2">
            Our Moments
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Memories from earlier today... 😘 — unlock with our password! 🤪
          </p>
        </motion.div>

        {photosUnlocked === null ? (
          <div className="max-w-sm mx-auto text-center py-8 text-muted-foreground">
            Loading…
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!photosUnlocked ? (
              <motion.div
                key="lock"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-sm mx-auto"
              >
                <div className="glass rounded-3xl p-8 shadow-rose border-2 border-rose-soft/50">
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-rose-soft/30 flex items-center justify-center">
                      <span className="text-5xl">🔒</span>
                    </div>
                  </div>
                  <p className="text-center text-muted-foreground text-sm mb-6">
                    Enter the password to see our photos
                  </p>
                  <form onSubmit={handleUnlock} className="space-y-4">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(false);
                      }}
                      placeholder="Password"
                      className="w-full px-4 py-3 rounded-xl border-2 border-rose-soft/50 bg-background/80 text-foreground placeholder:text-muted-foreground focus:border-rose-deep focus:outline-none focus:ring-2 focus:ring-rose-deep/20 text-center"
                      autoComplete="off"
                      data-interactive
                    />
                    {error && (
                      <p className="text-center text-sm text-destructive">
                        Wrong password. Try again 💕
                      </p>
                    )}
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-rose-deep text-primary-foreground font-medium hover:bg-rose-deep/90 transition-colors"
                      data-interactive
                    >
                      Unlock
                    </button>
                  </form>
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    Hint: something you gave her today 🌹
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="gallery"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8"
              >
                {PHOTOS.map((photo, i) => (
                  <PhotoCard
                    key={photo.filename}
                    filename={photo.filename}
                    caption={photo.caption}
                    index={i}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
