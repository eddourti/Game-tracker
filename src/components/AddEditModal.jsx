import { useState, useEffect } from "react";
import Stars from "./Stars";
import GameSearch from "./GameSearch";

const STATUSES = ["Backlog", "Playing", "Finished", "Dropped"];
const PLATFORMS = [
  "PC",
  "PlayStation 5",
  "PlayStation 4",
  "Xbox Series X|S",
  "Xbox One",
  "Nintendo Switch",
  "Mobile",
  "Other",
];

const EMPTY = {
  title: "",
  platform: "PC",
  category: "Uncategorized",
  status: "Backlog",
  progress: 0,
  rating: 0,
  playtime: "",
  achievements: "",
  coverImage: "",
  releaseYear: "",
  description: "",
  genres: [],
  sessionLog: [],
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-wide text-mist-400 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function AddEditModal({ game, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [noteDraft, setNoteDraft] = useState("");

  useEffect(() => {
    setForm(game ? { ...EMPTY, ...game } : EMPTY);
  }, [game]);

  function set(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function addNote() {
    if (!noteDraft.trim()) return;
    const entry = { id: uid(), date: Date.now(), text: noteDraft.trim() };
    set({ sessionLog: [entry, ...(form.sessionLog || [])] });
    setNoteDraft("");
  }

  function removeNote(id) {
    set({ sessionLog: (form.sessionLog || []).filter((n) => n.id !== id) });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(form);
  }

  const hasInfo = form.description || form.genres?.length > 0 || form.releaseYear;

  return (
    <div
      className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-ink-800 border border-ink-600 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Banner */}
        <div className="relative h-28 sm:h-36 shrink-0 bg-ink-900">
          {form.coverImage && (
            <>
              <img
                src={form.coverImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-800 via-ink-800/50 to-ink-950/40" />
            </>
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-ink-950/70 text-mist-200 hover:text-mist-50 flex items-center justify-center text-sm"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="absolute bottom-3 left-5 right-5">
            {!game ? (
              <p className="text-xs font-semibold text-mist-200 uppercase tracking-wide">
                New entry
              </p>
            ) : (
              <h2 className="font-display font-bold text-xl text-mist-50 truncate drop-shadow">
                {form.title || "Untitled"}
              </h2>
            )}
          </div>
        </div>

        <div className="overflow-y-auto px-5 sm:px-6 py-5">
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-6">
            {/* Left column: game details + tracking */}
            <div className="space-y-4">
              <GameSearch
                onPick={({ title, coverImage, category, description, genres, releaseYear }) =>
                  set({ title, coverImage, category, description, genres, releaseYear })
                }
              />

              <Field label="Title">
                <input
                  value={form.title}
                  onChange={(e) => set({ title: e.target.value })}
                  placeholder="Elden Ring"
                  className="w-full bg-ink-900 border border-ink-600 rounded-lg px-3 py-2 text-sm text-mist-50 focus:border-blue outline-none"
                />
              </Field>

              <Field label="Cover image URL">
                <input
                  value={form.coverImage}
                  onChange={(e) => set({ coverImage: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-ink-900 border border-ink-600 rounded-lg px-3 py-2 text-sm text-mist-50 focus:border-blue outline-none"
                />
              </Field>

              {hasInfo && (
                <div className="p-3.5 bg-ink-900 border border-ink-600 rounded-lg">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.category && form.category !== "Uncategorized" && (
                      <span className="text-[10px] font-semibold text-gold bg-gold-soft px-2 py-0.5 rounded-full uppercase">
                        {form.category}
                      </span>
                    )}
                    {form.releaseYear && (
                      <span className="text-[10px] font-semibold text-mist-200 bg-ink-700 px-2 py-0.5 rounded-full">
                        {form.releaseYear}
                      </span>
                    )}
                    {(form.genres || []).map((g) => (
                      <span
                        key={g}
                        className="text-[10px] font-semibold text-blue bg-blue-soft px-2 py-0.5 rounded-full"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                  {form.description && (
                    <p className="text-xs text-mist-400 leading-relaxed line-clamp-4">
                      {form.description}
                    </p>
                  )}
                </div>
              )}

              <Field label="Platform">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => set({ platform: p })}
                      className={`px-1.5 py-1.5 rounded-md text-[10px] font-semibold uppercase border transition-colors ${
                        form.platform === p
                          ? "bg-blue text-white border-blue"
                          : "border-ink-600 text-mist-400 hover:border-mist-400"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => set({ status: e.target.value })}
                    className="w-full bg-ink-900 border border-ink-600 rounded-lg px-3 py-2 text-sm text-mist-50 focus:border-blue outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Hours played">
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    value={form.playtime}
                    onChange={(e) => set({ playtime: e.target.value })}
                    placeholder="4.8"
                    className="w-full bg-ink-900 border border-ink-600 rounded-lg px-3 py-2 text-sm text-mist-50 focus:border-blue outline-none"
                  />
                </Field>
              </div>

              <Field label="Achievements">
                <input
                  value={form.achievements}
                  onChange={(e) => set({ achievements: e.target.value })}
                  placeholder="14/14"
                  className="w-full bg-ink-900 border border-ink-600 rounded-lg px-3 py-2 text-sm text-mist-50 focus:border-blue outline-none"
                />
              </Field>

              <Field label={`Progress — ${form.progress}%`}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={form.progress}
                  onChange={(e) => set({ progress: Number(e.target.value) })}
                  className="w-full accent-blue"
                />
              </Field>

              <Field label="Rating">
                <Stars value={form.rating} onChange={(v) => set({ rating: v })} size="text-xl" />
              </Field>
            </div>

            {/* Right column: session log */}
            <div className="flex flex-col min-h-0">
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-mist-400 mb-1.5">
                Session notes
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addNote();
                    }
                  }}
                  placeholder="Beat the act 2 boss..."
                  className="flex-1 bg-ink-900 border border-ink-600 rounded-lg px-3 py-2 text-sm text-mist-50 focus:border-blue outline-none"
                />
                <button
                  type="button"
                  onClick={addNote}
                  className="px-3.5 py-2 text-sm font-semibold bg-blue text-white rounded-lg hover:bg-blue/90 shrink-0"
                >
                  Add
                </button>
              </div>

              {form.sessionLog?.length > 0 ? (
                <div className="flex-1 overflow-y-auto md:max-h-[420px] pr-1">
                  <div className="relative pl-4 border-l border-ink-600 space-y-4">
                    {form.sessionLog.map((entry) => (
                      <div key={entry.id} className="relative group">
                        <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-blue border-2 border-ink-800" />
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[10px] font-mono text-mist-400">
                            {formatDate(entry.date)}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeNote(entry.id)}
                            className="text-mist-400 hover:text-rust text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            aria-label="Remove note"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-sm text-mist-200 leading-snug mt-0.5">
                          {entry.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center border border-dashed border-ink-600 rounded-lg py-8 px-4">
                  <p className="text-xs text-mist-400">
                    No notes yet — jot down where you left off, thoughts, or
                    endings seen as you play.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 sm:px-6 py-4 border-t border-ink-600 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-mist-400 hover:text-mist-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold bg-blue text-white rounded-lg hover:bg-blue/90"
          >
            {game ? "Save changes" : "Add game"}
          </button>
        </div>
      </form>
    </div>
  );
}
