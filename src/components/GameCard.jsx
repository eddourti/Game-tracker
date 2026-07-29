import StatusStamp from "./StatusStamp";
import SaveBar from "./SaveBar";
import Stars from "./Stars";

const PLATFORM_SHORT = {
  PC: "PC",
  "PlayStation 5": "PS5",
  "PlayStation 4": "PS4",
  "Xbox Series X|S": "XSX",
  "Xbox One": "XB1",
  "Nintendo Switch": "SWITCH",
  Mobile: "MOBILE",
  Other: "OTHER",
};

export default function GameCard({ game, onEdit, onDelete }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onEdit(game)}
      onKeyDown={(e) => (e.key === "Enter" ? onEdit(game) : null)}
      className="group relative bg-ink-800 border border-ink-600 rounded-xl overflow-hidden hover:border-blue/60 hover:-translate-y-0.5 transition-all cursor-pointer"
    >
      <div className="relative aspect-video bg-ink-900">
        {game.coverImage ? (
          <img
            src={game.coverImage}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-mist-400/30 font-display text-3xl">
            {(game.title || "?").slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="bg-ink-950/85 text-mist-200 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded">
            {PLATFORM_SHORT[game.platform] || game.platform}
          </span>
        </div>
        {game.category && game.category !== "Uncategorized" && (
          <div className="absolute bottom-2 left-2">
            <span className="bg-ink-950/85 text-blue text-[10px] font-semibold px-2 py-0.5 rounded">
              {game.category}
            </span>
          </div>
        )}
      </div>

      <div className="p-3.5">
        <h3 className="font-display font-bold text-sm text-mist-50 truncate mb-0.5">
          {game.title || "Untitled"}
        </h3>
        <p className="text-[11px] text-mist-400 mb-3">
          {game.releaseYear || "—"}
          {game.playtime ? ` · ${game.playtime}h played` : ""}
        </p>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="flex items-center gap-1 bg-gold-soft text-gold text-[11px] font-semibold px-2 py-1 rounded-full">
            ★ {game.progress}%
          </span>
          {game.achievements && (
            <span className="flex items-center gap-1 bg-ink-700 text-mist-200 text-[11px] font-semibold px-2 py-1 rounded-full">
              🏆 {game.achievements}
            </span>
          )}
          <StatusStamp status={game.status} />
        </div>

        <SaveBar progress={game.progress} status={game.status} segments={10} />

        <div className="flex items-center justify-between mt-3">
          <Stars value={game.rating} readOnly size="text-[11px]" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(game.id);
            }}
            className="text-[10px] text-mist-400 hover:text-rust font-semibold uppercase opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
