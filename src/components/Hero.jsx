export default function Hero({ featured, totalGames, totalHours, onOpen, onAdd }) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-ink-600 mb-8 min-h-[220px] flex items-end hero-glow bg-ink-800">
      {featured?.coverImage && (
        <>
          <img
            src={featured.coverImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/80 to-transparent" />
        </>
      )}

      <div className="relative p-6 sm:p-8 w-full">
        {featured ? (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-blue mb-2">
              Continue where you left off
            </p>
            <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-mist-50 mb-2 leading-tight">
              {featured.title}
            </h1>
            <p className="text-sm text-mist-300 mb-5 max-w-md">
              {featured.progress}% complete on {featured.platform}
              {featured.sessionLog?.[0] ? ` — "${featured.sessionLog[0].text}"` : ""}
            </p>
            <button
              onClick={() => onOpen(featured)}
              className="px-5 py-2.5 rounded-lg bg-blue text-white text-sm font-semibold hover:bg-blue/90 transition-colors"
            >
              Continue playing
            </button>
          </>
        ) : (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-blue mb-2">
              Your backlog starts here
            </p>
            <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-mist-50 mb-2 leading-tight">
              Track every game you play
            </h1>
            <p className="text-sm text-mist-300 mb-5 max-w-md">
              Add a game, track your progress, and never lose where you left
              off again.
            </p>
            <button
              onClick={onAdd}
              className="px-5 py-2.5 rounded-lg bg-blue text-white text-sm font-semibold hover:bg-blue/90 transition-colors"
            >
              + Add your first game
            </button>
          </>
        )}

        <div className="flex gap-6 mt-6 pt-5 border-t border-ink-600/60">
          <div>
            <p className="font-display font-bold text-xl text-mist-50">{totalGames}</p>
            <p className="text-[10px] uppercase tracking-widest text-mist-400 font-semibold">
              Games tracked
            </p>
          </div>
          <div>
            <p className="font-display font-bold text-xl text-mist-50">{totalHours}</p>
            <p className="text-[10px] uppercase tracking-widest text-mist-400 font-semibold">
              Hours logged
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
