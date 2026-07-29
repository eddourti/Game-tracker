import { useMemo, useState } from "react";
import { useGames } from "./hooks/useGames";
import Sidebar from "./components/Sidebar";
import MobileDrawer from "./components/MobileDrawer";
import Logo from "./components/Logo";
import Hero from "./components/Hero";
import Toolbar from "./components/Toolbar";
import GameCard from "./components/GameCard";
import AddEditModal from "./components/AddEditModal";
import BackupPanel from "./components/BackupPanel";

export default function App() {
  const {
    games,
    saveError,
    loading,
    addGame,
    updateGame,
    deleteGame,
    importGames,
    syncEnabled,
    syncCode,
    switchSyncCode,
  } = useGames();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [sortBy, setSortBy] = useState("updated");
  const [editingGame, setEditingGame] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const categories = useMemo(
    () => [...new Set(games.map((g) => g.category).filter((c) => c && c !== "Uncategorized"))].sort(),
    [games]
  );
  const platforms = useMemo(
    () => [...new Set(games.map((g) => g.platform))].sort(),
    [games]
  );

  const counts = useMemo(
    () => ({
      All: games.length,
      Playing: games.filter((g) => g.status === "Playing").length,
      Finished: games.filter((g) => g.status === "Finished").length,
      Backlog: games.filter((g) => g.status === "Backlog").length,
      Dropped: games.filter((g) => g.status === "Dropped").length,
    }),
    [games]
  );

  const totalHours = useMemo(
    () => games.reduce((sum, g) => sum + (Number(g.playtime) || 0), 0),
    [games]
  );

  const featured = useMemo(
    () =>
      [...games]
        .filter((g) => g.status === "Playing")
        .sort((a, b) => b.updatedAt - a.updatedAt)[0] || null,
    [games]
  );

  const visible = useMemo(() => {
    let list = games.filter((g) => {
      if (statusFilter !== "All" && g.status !== statusFilter) return false;
      if (categoryFilter !== "All" && g.category !== categoryFilter)
        return false;
      if (platformFilter !== "All" && g.platform !== platformFilter)
        return false;
      if (
        search.trim() &&
        !g.title.toLowerCase().includes(search.trim().toLowerCase())
      )
        return false;
      return true;
    });

    switch (sortBy) {
      case "title":
        list = [...list].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "progress":
        list = [...list].sort((a, b) => b.progress - a.progress);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      default:
        list = [...list].sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return list;
  }, [games, search, statusFilter, categoryFilter, platformFilter, sortBy]);

  function openAdd() {
    setEditingGame(null);
    setModalOpen(true);
  }

  function openEdit(game) {
    setEditingGame(game);
    setModalOpen(true);
  }

  function handleSave(form) {
    if (editingGame) {
      updateGame(editingGame.id, form);
    } else {
      addGame(form);
    }
    setModalOpen(false);
  }

  function handleDelete(id) {
    if (confirm("Delete this game from your tracker?")) {
      deleteGame(id);
    }
  }

  return (
    <div className="flex min-h-full">
      <Sidebar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        counts={counts}
        onOpenBackup={() => setBackupOpen(true)}
      />

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        counts={counts}
        onOpenBackup={() => setBackupOpen(true)}
      />

      <div className="flex-1 min-w-0">
        <header className="flex items-center justify-between gap-3 px-4 sm:px-8 py-4 sm:py-5 border-b border-ink-600">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden w-9 h-9 shrink-0 rounded-lg bg-ink-800 border border-ink-600 flex items-center justify-center text-mist-200"
              aria-label="Open menu"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </button>
            <div className="md:hidden">
              <Logo size="sm" />
            </div>
            <div className="hidden md:block">
              <p className="text-[11px] text-mist-400 font-medium">
                Library / {statusFilter === "All" ? "All games" : statusFilter}
              </p>
              <h2 className="font-display font-bold text-lg text-mist-50">
                {visible.length} game{visible.length === 1 ? "" : "s"}
              </h2>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="shrink-0 px-3 sm:px-4 py-2.5 text-sm font-display font-bold bg-blue text-white rounded-lg hover:bg-blue/90 transition-colors"
          >
            <span className="sm:hidden">+</span>
            <span className="hidden sm:inline">+ Add game</span>
          </button>
        </header>

        <main className="px-4 sm:px-8 py-6">
          <p className="md:hidden text-[11px] text-mist-400 font-medium mb-4">
            {statusFilter === "All" ? "All games" : statusFilter} · {visible.length} game{visible.length === 1 ? "" : "s"}
          </p>

          {saveError && (
            <div className="mb-5 px-4 py-2 text-xs font-mono text-rust border border-rust/40 bg-rust/10 rounded">
              {saveError}
            </div>
          )}

          {loading ? (
            <div className="text-center py-16 text-sm text-mist-400">
              Loading your library…
            </div>
          ) : (
            <>
              <Hero
                featured={featured}
                totalGames={games.length}
                totalHours={totalHours}
                onOpen={openEdit}
                onAdd={openAdd}
              />

              {games.length > 0 && (
                <Toolbar
                  search={search}
                  setSearch={setSearch}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                  categories={categories}
                  platformFilter={platformFilter}
                  setPlatformFilter={setPlatformFilter}
                  platforms={platforms}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />
              )}

              {games.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-ink-600 rounded-xl">
                  <p className="font-display font-bold text-lg text-mist-50 mb-1">
                    No saves yet
                  </p>
                  <p className="text-sm text-mist-400 mb-4">
                    Add your first game, or paste a list in bulk from Backup & bulk add.
                  </p>
                  <button
                    onClick={openAdd}
                    className="px-4 py-2.5 text-sm font-display font-bold bg-blue text-white rounded-lg hover:bg-blue/90"
                  >
                    + Add game
                  </button>
                </div>
              ) : visible.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-ink-600 rounded-xl">
                  <p className="text-sm text-mist-400">
                    Nothing matches those filters.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {visible.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        <footer className="px-4 sm:px-8 pb-8 text-[10px] uppercase tracking-widest text-mist-400/60 font-semibold">
          {syncEnabled
            ? `Synced via code ${syncCode} — manage it in Backup & bulk add`
            : "Stored locally in this browser — export backups from Backup & bulk add"}
        </footer>
      </div>

      {modalOpen && (
        <AddEditModal
          game={editingGame}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {backupOpen && (
        <BackupPanel
          games={games}
          onImportJSON={(data) => importGames(data, "merge")}
          onBulkAdd={async (list) => {
            for (const g of list) {
              await addGame(g);
            }
          }}
          onUpdateGame={updateGame}
          onClose={() => setBackupOpen(false)}
          syncEnabled={syncEnabled}
          syncCode={syncCode}
          onSwitchSyncCode={switchSyncCode}
        />
      )}
    </div>
  );
}
