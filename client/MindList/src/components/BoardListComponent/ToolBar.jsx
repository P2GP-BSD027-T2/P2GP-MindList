const Toolbar = ({ query, setQuery, sortBy, setSortBy }) => {
  return (
    <section className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 flex items-center gap-2">
        <div className="relative w-full sm:w-80">
          <input
            className="w-full rounded-2xl border border-white/10 bg-[#0f1c40]/90 backdrop-blur px-10 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/20"
            placeholder="Cari board atau kode…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari board"
          />
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <svg viewBox="0 0 20 20" className="size-4" fill="currentColor">
              <path d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM8 14a6 6 0 100-12 6 6 0 000 12z" />
            </svg>
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-300">Sort</label>
        <select
          className="rounded-xl border border-white/10 bg-[#0f1c40] px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
        >
          <option value="recent">Terbaru</option>
          <option value="az">A → Z</option>
          <option value="za">Z → A</option>
        </select>
      </div>
    </section>
  );
};

export default Toolbar;
