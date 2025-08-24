import { useEffect, useRef, useState } from "react";

export default function AudioPreview({ src, fallbackUrl }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onEnded = () => setPlaying(false);
    a.addEventListener("ended", onEnded);
    return () => a.removeEventListener("ended", onEnded);
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
      setPlaying(false);
    }
  }, [src]);

  // 👇 Si no hay preview, mostramos CTA a Spotify
  if (!src) {
    return fallbackUrl ? (
      <a
        href={fallbackUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-full transition-all duration-200 hover:scale-105 shadow-lg group"
      >
        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.95 11.95l-6.36 3.64c-.58.33-1.32-.09-1.32-.75V7.16c0-.66.74-1.08 1.32-.75l6.36 3.64c.58.33.58 1.17 0 1.5z"/>
        </svg>
        Spotify
      </a>
    ) : (
      <div className="text-xs text-zinc-500 bg-zinc-800 px-3 py-2 rounded-full">
        Sin preview
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-200 shadow-lg hover:scale-105 ${
          playing 
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
            : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
        onClick={() => {
          const a = audioRef.current;
          if (!a) return;
          if (playing) {
            a.pause();
            setPlaying(false);
          } else {
            a.play();
            setPlaying(true);
          }
        }}
        aria-label={playing ? "Pausar" : "Reproducir"}
      >
        {playing ? (
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>
      <audio ref={audioRef} src={src} preload="none" />
    </div>
  );
}
