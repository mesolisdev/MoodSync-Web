import React from "react";

const MODES = [
  { id: "feliz", label: "Feliz", emoji: "☀️", color: "text-amber-500" },
  { id: "melancolico", label: "Melancólico", emoji: "💧", color: "text-sky-500" },
  { id: "motivado", label: "Motivado", emoji: "⚡", color: "text-orange-500" },
  { id: "relajado", label: "Relajado", emoji: "😊", color: "text-emerald-600" },
  { id: "nostalgico", label: "Nostálgico", emoji: "🌙", color: "text-purple-500" },
  { id: "intenso", label: "Intenso", emoji: "🔥", color: "text-red-500" },
];

export default function MoodSelectorCard({ currentMood, onMoodChange, moods = MODES }) {
  return (
    <div className="p-6 mb-8 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-center">¿Cómo te sientes hoy?</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 place-items-stretch">
        {moods.map((mood) => {
          const isActive = currentMood === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => onMoodChange?.(mood.id)}
              className={[
                "h-20 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-2",
                "hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                isActive
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-lg mood-pulse"
                  : "bg-white/70 dark:bg-zinc-800/70 border-zinc-200 dark:border-zinc-700 hover:shadow-md"
              ].join(" ")}
              aria-pressed={isActive}
              aria-label={`Seleccionar mood ${mood.label}`}
            >
              <span
                className={[
                  "text-[22px] leading-none",
                  isActive ? "opacity-95" : mood.color
                ].join(" ")}
                aria-hidden
              >
                {mood.emoji}
              </span>
              <span className="text-xs font-medium">{mood.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
