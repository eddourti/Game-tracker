export default function Toolbar({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  categories,
  platformFilter,
  setPlatformFilter,
  platforms,
  sortBy,
  setSortBy,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-ink-800 border border-ink-600 rounded-xl px-4 py-3 mb-6">
      <div className="flex flex-wrap gap-2 items-center">
        <FilterPill label="Sort by">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-mist-50 text-xs font-semibold outline-none"
          >
            <option value="updated" className="bg-ink-800">Recently updated</option>
            <option value="title" className="bg-ink-800">Title A–Z</option>
            <option value="progress" className="bg-ink-800">Progress</option>
            <option value="rating" className="bg-ink-800">Rating</option>
          </select>
        </FilterPill>

        <FilterPill label="Platform">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="bg-transparent text-mist-50 text-xs font-semibold outline-none"
          >
            <option value="All" className="bg-ink-800">All platforms</option>
            {platforms.map((p) => (
              <option key={p} value={p} className="bg-ink-800">
                {p}
              </option>
            ))}
          </select>
        </FilterPill>

        <FilterPill label="Category">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent text-mist-50 text-xs font-semibold outline-none"
          >
            <option value="All" className="bg-ink-800">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c} className="bg-ink-800">
                {c}
              </option>
            ))}
          </select>
        </FilterPill>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search your library..."
        className="bg-ink-900 border border-ink-600 rounded-lg px-3 py-2 text-sm text-mist-50 focus:border-blue outline-none w-full sm:w-64"
      />
    </div>
  );
}

function FilterPill({ label, children }) {
  return (
    <div className="flex items-center gap-1.5 bg-ink-900 border border-ink-600 rounded-lg px-3 py-1.5">
      <span className="text-[10px] text-mist-400 font-semibold uppercase">
        {label}:
      </span>
      {children}
    </div>
  );
}
