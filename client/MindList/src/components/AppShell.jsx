import { useState, useEffect } from "react";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";

const AppShell = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="h-dvh w-dvw bg-gradient-to-b from-[#0b1530] to-[#0e1b3d] text-slate-100">
      {/* Desktop layout */}
      <div className="hidden md:grid h-full grid-cols-[260px_1fr]">
        <aside className="border-r border-white/10 bg-[#0c1836]/80 backdrop-blur overflow-y-auto">
          <Sidebar />
        </aside>
        <main className="overflow-hidden bg-[#0f1c40]/40 backdrop-blur">
          <Outlet />
        </main>
      </div>

      {/* Mobile layout with collapsible sidebar */}
      <div className="md:hidden h-full relative">
        {/* Off-canvas sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] transform transition-transform duration-300 border-r border-white/10 bg-[#0c1836] text-slate-100 backdrop-blur ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Sidebar"
        >
          <div className="h-dvh overflow-y-auto">
            <Sidebar />
          </div>
        </div>

        {/* Backdrop */}
        {open && (
          <button
            className="fixed inset-0 z-30 bg-black/50"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar backdrop"
          />
        )}

        {/* Main content */}
        <main className="h-full overflow-hidden bg-[#0f1c40]/40 backdrop-blur">
          {/* Mobile top bar with hamburger */}
          <div className="sticky top-0 z-10 flex items-center gap-2 p-3 border-b border-white/10 bg-[#0c1836]/80 backdrop-blur">
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-[#121e44]/80 px-3 py-1.5 text-xs font-medium text-slate-100 shadow-sm active:scale-[.98]"
              aria-label="Open sidebar"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
              </svg>
            </button>
            <span className="text-sm text-slate-200">Menu</span>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
