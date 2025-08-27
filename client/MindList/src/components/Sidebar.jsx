import { NavLink } from "react-router";
import PhotoProfile from "../assets/PhotoProfile";

const itemBase =
  "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors select-none";

const Item = ({ to, label, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      [
        itemBase,
        isActive
          ? "bg-indigo-900/40 text-slate-100 ring-1 ring-inset ring-indigo-300/20"
          : "text-slate-200/90 hover:bg-white/5 hover:text-slate-100",
      ].join(" ")
    }
  >
    <span
      className="inline-flex h-2 w-2 rounded-full bg-indigo-400/80"
      aria-hidden
    />
    <span className="truncate text-sm">{label}</span>
  </NavLink>
);

export default function Sidebar() {
  return (
    <aside className="h-full flex flex-col bg-[#0c1836]/80 text-slate-100 border-r border-white/10 backdrop-blur">
      {/* Profile */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 shrink-0 rounded-xl bg-indigo-800/60 grid place-items-center font-semibold text-indigo-200 ring-1 ring-inset ring-white/10">
            <img
              src={
                PhotoProfile[Math.floor(Math.random() * PhotoProfile.length)]
              }
              alt="PP"
              className="rounded-lg"
            />
          </div>
          <div className="text-sm min-w-0">
            <div className="font-semibold truncate">Manageko</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="p-3 space-y-1">
        <div className="text-[10px] tracking-wide uppercase text-slate-300/70 px-2 pt-3 pb-1">
          Main Menu
        </div>
        <Item to="/" label="Boards" end />
        <Item to="/search" label="Search" />
        <Item to="/calendar" label="Calendar" />
        <Item to="/settings" label="Settings" />
      </nav>

      {/* CTA */}
      <div className="mt-auto p-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4">
          <div className="text-sm font-medium mb-1">Add extra security</div>
          <p className="text-xs text-slate-300/90 mb-3">
            Enable 2-step verification for your account.
          </p>
          <button className="w-full inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500 active:scale-[.98]">
            Enable 2-step
          </button>
        </div>
      </div>
    </aside>
  );
}
