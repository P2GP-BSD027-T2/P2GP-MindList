import { Link } from "react-router";
import { useUser } from "../../contexts/UserContext";

const Navbar = ({ refresh, loading }) => {
  const { displayName } = useUser();

  return (
    <nav className="sticky top-0 z-10 border-b border-white/10 bg-blue-950/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/20 ring-1 ring-inset ring-white/10">
              <img
                src="https://res.cloudinary.com/drzqzizv1/image/upload/v1756288958/Icon_MindList_nthlji.png"
                alt="Icon"
              />
            </div>
            <Link
              to="/"
              className="text-2xl font-semibold tracking-wide text-slate-100"
            >
              MindList
            </Link>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#121e44]/80 px-3 py-1.5 text-xs font-medium text-slate-100 shadow-sm transition hover:bg-[#142354] active:scale-[.98] disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="size-3.5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                  Refreshing…
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <svg
                    viewBox="0 0 20 20"
                    className="size-4"
                    fill="currentColor"
                  >
                    <path d="M4 4v4h.01H8a1 1 0 100-2H7.06A6 6 0 1110 16a1 1 0 100 2A8 8 0 104 4z" />
                  </svg>
                  Refresh
                </span>
              )}
            </button>
            <div className="h-6 w-px bg-white/10" />
            <span className="text-xs text-slate-300 hidden md:inline">
              {(displayName || "Guest").trim()}
            </span>
          </div>

          {/* Mobile action */}
          <button
            onClick={refresh}
            className="sm:hidden inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#121e44]/80 px-3 py-1.5 text-xs font-medium text-slate-100 shadow-sm"
          >
            <svg viewBox="0 0 20 20" className="size-4" fill="currentColor">
              <path d="M4 4v4h.01H8a1 1 0 100-2H7.06A6 6 0 1110 16a1 1 0 100 2A8 8 0 104 4z" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
