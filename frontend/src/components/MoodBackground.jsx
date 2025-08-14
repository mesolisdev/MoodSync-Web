import { motion, AnimatePresence } from "framer-motion";
import { useMood } from "../store/moodStore";

const MOOD_STYLES = {
  happy: {
    from: "bg-gradient-to-br from-yellow-400/30 via-orange-500/20 to-pink-500/20",
    glow: "shadow-[0_0_80px_rgba(255,183,3,0.35)]",
  },
  relaxed: {
    from: "bg-gradient-to-br from-teal-300/30 via-cyan-400/20 to-blue-500/20",
    glow: "shadow-[0_0_80px_rgba(128,222,217,0.35)]",
  },
  motivated: {
    from: "bg-gradient-to-br from-green-300/30 via-lime-400/20 to-emerald-500/20",
    glow: "shadow-[0_0_80px_rgba(93,224,106,0.35)]",
  },
  melancholic: {
    from: "bg-gradient-to-br from-indigo-400/30 via-violet-500/20 to-blue-900/20",
    glow: "shadow-[0_0_80px_rgba(108,99,255,0.35)]",
  },
};

export default function MoodBackground() {
  const { mood } = useMood();
  const style = MOOD_STYLES[mood] ?? MOOD_STYLES.happy;

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={mood}
          className={`absolute inset-0 ${style.from}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </AnimatePresence>
      <motion.div
        className={`absolute -inset-20 rounded-full blur-3xl ${style.glow}`}
        animate={{
          x: [0, 20, -10, 0],
          y: [0, -10, 15, 0],
          rotate: [0, 10, -8, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
