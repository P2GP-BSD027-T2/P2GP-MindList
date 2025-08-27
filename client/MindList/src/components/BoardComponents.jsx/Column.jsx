const Column = ({ title, count, children, onAdd }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-3 flex flex-col shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-100">{title}</span>
          <span className="px-2 py-[2px] text-[11px] rounded-full bg-indigo-900/40 text-indigo-200 ring-1 ring-inset ring-indigo-300/20">
            {count}
          </span>
        </div>
        <button
          className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-indigo-600 px-2 py-1 text-xs font-medium text-white shadow hover:bg-indigo-500 active:scale-[.98]"
          onClick={onAdd}
          title="Add task"
        >
          +
        </button>
      </div>

      {/* Children (tasks) */}
      <div className="flex-1 space-y-2 overflow-y-auto min-h-[50px]">
        {children}
      </div>
    </div>
  );
};

export default Column;
