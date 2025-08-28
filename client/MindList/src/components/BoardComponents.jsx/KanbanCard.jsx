import { useMemo, useState } from "react";

export default function KanbanCard({
  task,
  onDelete,
  onChangeStatus,
  onEditTitle,
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title || "");

  const initials = useMemo(() => {
    const words = String(task.title || "?")
      .trim()
      .split(/\s+/)
      .slice(0, 2);
    return words.map((w) => w[0]?.toUpperCase() || "?").join("");
  }, [task.title]);

  const commitTitle = () => {
    const newtitle = title.trim();
    if (!newtitle || newtitle === task.title) return setEditing(false);
    if (typeof onEditTitle === "function") onEditTitle(task.id, newtitle);
    setEditing(false);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-3 shadow-sm hover:shadow transition-colors">
      {/* Title (editable) */}
      <div className="w-full mt-1.5"></div>
      {editing ? (
        <input
          autoFocus
          className="w-full rounded-xl border border-white/10 bg-[#0f1c40] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/20"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={commitTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitTitle();
            if (e.key === "Escape") {
              setTitle(task.title || "");
              setEditing(false);
            }
          }}
        />
      ) : (
        <button
          type="button"
          className="w-full text-center text-lg font-semibold leading-snug mb-2 text-slate-100 hover:text-white"
          title="Klik untuk edit judul"
          onDoubleClick={() => setEditing(true)}
        >
          {task.title}
        </button>
      )}
      <p className="text-sm text-black mb-2 p-2 bg-gray-400 rounded-md">
        <h1 className="line-clamp-3">{task.description}</h1>
      </p>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        <select
          className="w-32 rounded-lg border border-white/10 bg-[#0f1c40] px-2 py-1.5 text-xs text-slate-100 outline-none focus:ring-4 focus:ring-indigo-500/20"
          value={task.status}
          onChange={(event) => onChangeStatus(task.id, event.target.value)}
        >
          <option value="todo">To-do</option>
          <option value="doing">On Progress</option>
          <option value="done">Completed</option>
        </select>

        <div className="inline-flex items-center gap-1.5">
          {!editing && typeof onEditTitle === "function" && (
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-xs text-slate-100 hover:bg-white/15 active:scale-[.98]"
              onClick={() => setEditing(true)}
              title="Edit title"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="currentColor"
              >
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.34a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
              </svg>
              Edit
            </button>
          )}
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-rose-900/40 bg-rose-900/30 px-2.5 py-1 text-xs text-rose-100 hover:bg-rose-900/45 active:scale-[.98]"
            onClick={() => onDelete(task.id)}
            title="Delete task"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="currentColor"
            >
              <path d="M9 3h6a1 1 0 011 1v1h5v2H3V5h5V4a1 1 0 011-1zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
            </svg>
            Delete
          </button>
        </div>
      </div>
      <label className="cursor-pointer border-stone-800 border-2 text-white text-sm self-center font-semibold rounded-lg h-8 w-1/4 px-[0.625rem] flex items-center justify-center hover:bg-stone-700 mt-4">
        <i className="fa-solid fa-file"></i>
        <input
          type="file"
          accept="image/*,application/pdf,application/msword"
          onChange={(event) => handleUploadfile(task.id, event)}
          className="hidden"
        />
      </label>
    </div>
  );
}
