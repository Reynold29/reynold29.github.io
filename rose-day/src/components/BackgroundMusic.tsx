import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const AUDIO_SRC = '/audio/line-without-a-hook.mp3';

export default function BackgroundMusic() {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = 0.6;
    audioRef.current = audio;
    audio.muted = false;
    const p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted;
  }, [isMuted]);

  const toggle = () => {
    const audio = audioRef.current;
    if (audio && audio.paused && !isMuted) audio.play().catch(() => {});
    setIsMuted((m) => !m);
  };

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className="fixed bottom-5 right-5 z-50 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-rose-soft/40 bg-gradient-rose text-white shadow-rose backdrop-blur-sm transition hover:scale-105 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-rose-glow focus:ring-offset-2"
        aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>
    </>
  );
}
