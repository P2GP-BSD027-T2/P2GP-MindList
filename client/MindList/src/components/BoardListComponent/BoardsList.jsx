import { useNavigate } from "react-router";

const BoardsList = ({
  loading,
  filtered,
  hueFrom,
  onOpenBoard,
  onCopyCode,
}) => {
  const nav = useNavigate();

  const ringToneClass = [
    "ring-indigo-500/20",
    "ring-blue-500/20",
    "ring-sky-500/20",
    "ring-slate-500/20",
    "ring-indigo-500/20",
    "ring-blue-500/20",
    "ring-sky-500/20",
    "ring-slate-500/20",
  ];

  return (
    <section className="mt-4">
      <h2 className="sr-only">Daftar Board</h2>

      {loading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          role="status"
          aria-live="polite"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-white/5 border border-white/10 backdrop-blur shadow-sm overflow-hidden"
            >
              <div className="h-full w-full animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%]" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-slate-300">
          Belum ada board yang cocok. Coba buat baru atau ubah pencarian.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => {
            const tone = ringToneClass[hueFrom(b.id)];
            const createdStr = new Date(
              b.createdAt || Date.now()
            ).toLocaleDateString();
            const name = b.boardName || b.name || "(untitled)";

            return (
              <div
                key={String(b.id)}
                className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-[#101c42]/60 backdrop-blur shadow-sm transition hover:shadow-lg focus-within:shadow-lg ring-0 hover:ring-2 ${tone}`}
              >
                <button
                  onClick={() =>
                    onOpenBoard ? onOpenBoard(b) : nav(`/boards/${b.id}`)
                  }
                  title="Buka board"
                  className="block w-full text-left p-4 pr-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold truncate text-slate-100">
                        {name}
                      </div>
                      <div className="mt-1 text-xs text-slate-300 space-x-2">
                        <span className="font-mono">ID: {b.id}</span>
                        <span>•</span>
                        <span className="font-mono">Code: {b.code}</span>
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[10px] font-semibold text-slate-200">
                      {createdStr}
                    </span>
                  </div>
                </button>

                <div className="px-4 pb-4 -mt-2 flex items-center gap-2">
                  <button
                    onClick={() => onCopyCode?.(b.code, "Kode disalin")}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-200 border border-white/10 bg-white/10 hover:bg-white/15 transition"
                    aria-label={`Salin kode ${b.code}`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="size-4"
                      fill="currentColor"
                    >
                      <path d="M16 1H4a2 2 0 00-2 2v12h2V3h12V1zm3 4H8a2 2 0 00-2 2v14a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2zm0 16H8V7h11v14z" />
                    </svg>
                    Copy Code
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default BoardsList;
