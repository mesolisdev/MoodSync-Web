import { motion } from "framer-motion";
import { useMood } from "../store/moodStore";

const MOODS = [
  { key: "happy", label: "Feliz" },
  { key: "relaxed", label: "Relajado" },
  { key: "motivated", label: "Motivado" },
  { key: "melancholic", label: "Melancólico" },
  { key: "nostalgic", label: "Nostálgico" },
  { key: "intense", label: "Intenso" },
];

export default function MoodPicker() {
  const { mood, setMood } = useMood();
  return (
    <div className="flex flex-wrap gap-3">
      {MOODS.map((m) => (
        <motion.button
          key={m.key}
          onClick={() => setMood(m.key)}
          className={`btn ${
            mood === m.key ? "bg-white text-slate-900" : "bg-white/10 text-white"
          }`}
          whileTap={{ scale: 0.98 }}
          whileHover={{ scale: 1.02 }}
        >
          {m.label}
        </motion.button>
      ))}
    </div>
  );
}