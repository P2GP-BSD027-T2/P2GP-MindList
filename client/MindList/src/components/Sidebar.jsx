import { Link, NavLink } from "react-router";
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
      </div>

      {/* Nav */}
      <nav className="p-3 space-y-1">
        <div className="text-[10px] tracking-wide uppercase text-slate-300/70 px-2 pt-3 pb-1">
          Main Menu
        </div>
        <Item to="/" label="Boards" end />
        <Item label="Search" />
        <Item label="Calendar" />
        <Item label="Settings" />
      </nav>

      {/* CTA */}
    </aside>
  );
}
