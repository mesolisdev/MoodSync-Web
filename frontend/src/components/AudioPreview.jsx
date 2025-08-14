import { useEffect, useRef, useState } from "react";

export default function AudioPreview({ src }) {
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
    // stop if src changes
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
      setPlaying(false);
    }
  }, [src]);

  if (!src) return <div className="text-xs text-slate-400">Sin preview</div>;

  return (
    <div className="flex items-center gap-2">
      <button
        className="btn bg-white/10 text-white px-3 py-1"
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
      >
        {playing ? "Pausar" : "Reproducir"}
      </button>
      <audio ref={audioRef} src={src} preload="none" />
    </div>
  );
}