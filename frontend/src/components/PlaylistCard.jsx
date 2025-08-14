import { motion } from "framer-motion";

export default function PlaylistCard({ item, onOpen }) {
  const img = item.images?.[0]?.url;
  return (
    <motion.button
      onClick={onOpen}
      className="card p-3 text-left w-full"
      whileHover={{ y: -4 }}
      layout
    >
      <div className="flex gap-3">
        <img src={img} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
        <div className="flex-1">
          <h3 className="font-display text-lg leading-tight">{item.name}</h3>
          <p className="text-sm text-slate-300 line-clamp-2">{item.description || ""}</p>
          <div className="text-xs text-slate-400 mt-1">
            {item.owner ? `por ${item.owner}` : ""} · {item.tracks_total ?? 0} temas
          </div>
        </div>
      </div>
    </motion.button>
  );
}