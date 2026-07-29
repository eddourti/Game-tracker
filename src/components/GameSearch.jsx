import { useState, useRef, useEffect } from "react";

export default function GameSearch({ onPick }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState(null);
  const debounceRef = useRef(null);
  const skipNextSearch = useRef(false);

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    clearTimeout(debounceRef.current);
    setPicked(null);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(query), 350);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function runSearch(term) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/games-search?q=${encodeURIComponent(term)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setResults(data.results || []);
      setOpen(true);
    } catch (err) {
      setError(err.message || "Couldn't reach the games database — try again or enter details manually.");
    } finally {
      setLoading(false);
    }
  }

  async function pick(item) {
    setOpen(false);
    setResults([]);
    skipNextSearch.current = true;
    setQuery(item.name);
    setPicked(item);
    setFetchingDetails(true);

    // Fill in what we already know right away, then enrich with full
    // details (synopsis, real genres, release date) once they load.
    onPick({
      title: item.name,
      coverImage: item.image || "",
      category: item.genres?.[0] || "Uncategorized",
      genres: item.genres || [],
      description: "",
      releaseYear: item.released ? item.released.slice(0, 4) : "",
    });

    try {
      const res = await fetch(`/api/game-details?id=${encodeURIComponent(item.id)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onPick({
        title: item.name,
        coverImage: data.coverImage || item.image || "",
        category: data.genres?.[0] || item.genres?.[0] || "Uncategorized",
        genres: data.genres?.length ? data.genres : item.genres || [],
        description: data.description || "",
        releaseYear: data.released ? data.released.slice(0, 4) : (item.released ? item.released.slice(0, 4) : ""),
      });
    } catch (err) {
      // Basic info from the search result is already filled in — fine to
      // leave it there if the details call fails.
    } finally {
      setFetchingDetails(false);
    }
  }

  return (
    <div className="relative mb-4">
      <label className="block text-xs font-mono uppercase text-mist-400 mb-1">
        Search game database
      </label>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length && !picked && setOpen(true)}
        placeholder="Elden Ring..."
        className="w-full bg-ink-900 border border-ink-600 rounded px-3 py-2 text-sm text-mist-50 focus:border-blue outline-none"
      />
      {loading && (
        <p className="text-[11px] text-mist-400 font-mono mt-1">Searching…</p>
      )}
      {fetchingDetails && (
        <p className="text-[11px] text-blue font-mono mt-1">Loading full game info…</p>
      )}
      {error && <p className="text-[11px] text-rust font-mono mt-1">{error}</p>}

      {open && !picked && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-ink-900 border border-ink-600 rounded shadow-lg max-h-72 overflow-y-auto">
          {results.map((r) => (
            <button
              type="button"
              key={r.id}
              onClick={() => pick(r)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-ink-700 text-left"
            >
              {r.image ? (
                <img
                  src={r.image}
                  alt=""
                  className="w-14 h-9 object-cover rounded shrink-0"
                />
              ) : (
                <div className="w-14 h-9 rounded bg-ink-700 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm text-mist-50 truncate">{r.name}</p>
                <p className="text-[10px] text-mist-400 font-mono truncate">
                  {r.released ? r.released.slice(0, 4) : ""}
                  {r.platforms?.length ? ` · ${r.platforms.slice(0, 3).join(", ")}` : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
