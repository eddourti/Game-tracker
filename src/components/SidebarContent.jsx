import Logo from "./Logo";

export const NAV_ITEMS = [
  { key: "All", label: "Library", icon: "▦" },
  { key: "Playing", label: "Playing", icon: "▶" },
  { key: "Finished", label: "Finished", icon: "✓" },
  { key: "Backlog", label: "Backlog", icon: "▢" },
  { key: "Dropped", label: "Dropped", icon: "✕" },
];

export default function SidebarContent({
  statusFilter,
  setStatusFilter,
  counts,
  onOpenBackup,
  onNavigate,
}) {
  function selectStatus(key) {
    setStatusFilter(key);
    onNavigate?.();
  }

  function openBackup() {
    onOpenBackup();
    onNavigate?.();
  }

  return (
    <div className="flex flex-col h-full px-4 py-6">
      <div className="px-2 mb-8">
        <Logo />
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-widest text-mist-400 px-2 mb-2">
        Library
      </p>
      <nav className="space-y-1 mb-6">
        {NAV_ITEMS.map((item) => {
          const active = statusFilter === item.key;
          return (
            <button
              key={item.key}
              onClick={() => selectStatus(item.key)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-blue text-white font-semibold"
                  : "text-mist-200 hover:bg-ink-800"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className="text-xs w-4 text-center opacity-80">{item.icon}</span>
                {item.label}
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  active ? "bg-white/20" : "bg-ink-700 text-mist-400"
                }`}
              >
                {counts[item.key] ?? 0}
              </span>
            </button>
          );
        })}
      </nav>

      <p className="text-[10px] font-semibold uppercase tracking-widest text-mist-400 px-2 mb-2">
        Configure
      </p>
      <nav className="space-y-1">
        <button
          onClick={openBackup}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-mist-200 hover:bg-ink-800 transition-colors"
        >
          <span className="text-xs w-4 text-center opacity-80">⇅</span>
          Backup & bulk add
        </button>
      </nav>

      <div className="mt-auto pt-6">
        <div className="bg-ink-800 border border-ink-600 rounded-xl p-4">
          <p className="text-xs font-semibold text-mist-50 mb-1">
            Search auto-fills everything
          </p>
          <p className="text-[11px] text-mist-400 leading-relaxed">
            Add a game and search it by name — cover art, genre, and release
            year fill in automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
