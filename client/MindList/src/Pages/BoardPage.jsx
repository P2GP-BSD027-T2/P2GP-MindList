import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "react-toastify";
import BoardHeaderBanner from "../components/BoardComponents.jsx/BoardHeaderBanner.jsx";
import Column from "../components/BoardComponents.jsx/Column.jsx";
import KanbanCard from "../components/BoardComponents.jsx/KanbanCard.jsx";

const LS_BOARDS = "dummy_boards";
const lsKey = (boardId) => `dummy_tasks_${boardId}`;
const STATUSES = ["todo", "doing", "done"];

const loadBoards = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_BOARDS)) || [];
  } catch {
    return [];
  }
};
const loadTasks = (boardId) => {
  try {
    return JSON.parse(localStorage.getItem(lsKey(boardId))) || [];
  } catch {
    return [];
  }
};
const saveTasks = (boardId, tasks) =>
  localStorage.setItem(lsKey(boardId), JSON.stringify(tasks));

function groupTasks(tasks) {
  const group = { todo: [], doing: [], done: [] };
  tasks.forEach((task) => group[task.status].push(task));
  STATUSES.forEach((status) =>
    group[status].sort((a, b) => (a.order ?? 1) - (b.order ?? 1))
  );
  return group;
}

const BoardPage = () => {
  const { id: boardId } = useParams();
  const nav = useNavigate();
  const boards = loadBoards();
  const board = boards.find((board) => String(board.id) === String(boardId));
  const boardName = board?.name || "Board";

  const [tasks, setTasks] = useState(() => loadTasks(boardId));
  const [newTitle, setNewTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const grouped = useMemo(() => groupTasks(tasks), [tasks]);

  useEffect(() => {}, []);

  useEffect(() => {
    setTasks(loadTasks(boardId));
  }, [boardId]);
  useEffect(() => {
    saveTasks(boardId, tasks);
  }, [boardId, tasks]);

  const nextOrder = (status) => (grouped[status].at(-1)?.order || 0) + 1;

  const createTask = () => {
    const title = newTitle.trim();
    if (!title) return;
    const task = {
      id: Math.random().toString(36).slice(2, 9),
      title,
      status: "todo",
      order: nextOrder("todo"),
    };
    setTasks((prev) => [...prev, task]);
    setNewTitle("");
  };
  const removeTask = (id) =>
    setTasks((prev) => prev.filter((task) => task.id !== id));
  const patchTask = (id, patch) =>
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...patch } : task))
    );

  const reorderColumn = (status, fromIndex, toIndex) => {
    const ids = grouped[status].map((task) => task.id);
    const [movedId] = ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, movedId);
    setTasks((prev) =>
      prev.map((t) => {
        if (t.status !== status) return t;
        const idx = ids.indexOf(t.id);
        return { ...t, order: idx + 1 };
      })
    );
  };

  const moveAcrossColumns = (taskId, fromStatus, toStatus, toIndex) => {
    const targetIds = grouped[toStatus].map((t) => t.id);
    targetIds.splice(toIndex, 0, taskId);
    setTasks((prev) => {
      let changed = prev.map((t) =>
        t.id === taskId ? { ...t, status: toStatus } : t
      );
      const fromIds = grouped[fromStatus]
        .map((t) => t.id)
        .filter((id) => id !== taskId);
      changed = changed.map((t) =>
        t.status !== fromStatus ? t : { ...t, order: fromIds.indexOf(t.id) + 1 }
      );
      changed = changed.map((t) =>
        t.status !== toStatus ? t : { ...t, order: targetIds.indexOf(t.id) + 1 }
      );
      return changed;
    });
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    const from = source.droppableId,
      to = destination.droppableId;
    if (from === to) {
      if (source.index !== destination.index)
        reorderColumn(from, source.index, destination.index);
      return;
    }
    moveAcrossColumns(draggableId, from, to, destination.index);
  };

  const generateFromAI = () => {
    const p = prompt.trim();
    if (!p) return;
    setIsLoadingAI(true);
    setTimeout(() => {
      const ideas = [
        { title: `Riset: ${p}`, status: "todo" },
        { title: `Rencana ${p}`, status: "todo" },
        { title: `Kerjakan inti: ${p}`, status: "doing" },
        { title: `Review hasil ${p}`, status: "done" },
      ];
      let last = Math.max(0, ...tasks.map((t) => t.order || 0));
      const created = ideas.map((it) => ({
        id: Math.random().toString(36).slice(2, 9),
        title: it.title,
        status: it.status,
        order: ++last,
      }));
      setTasks((prev) => [...prev, ...created]);
      setPrompt("");
      setIsLoadingAI(false);
      toast.success("AI dummy: tasks ditambahkan!");
    }, 900);
  };

  // Monochrome navy shades for columns
  const COLS = [
    { key: "todo", title: "To-do", list: grouped.todo, color: "bg-indigo-600" },
    {
      key: "doing",
      title: "On Progress",
      list: grouped.doing,
      color: "bg-indigo-500",
    },
    {
      key: "done",
      title: "Completed",
      list: grouped.done,
      color: "bg-indigo-400",
    },
  ];

  return (
    <div className="h-dvh flex flex-col bg-gradient-to-b from-[#0b1530] via-[#0e1b3d] to-[#0b1530] text-slate-100">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-10 border-b border-white/10 bg-[#0c1836]/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-18 items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="truncate text-sm sm:text-base font-semibold text-slate-100">
                {boardName}
              </h1>
            </div>

            {/* AI Prompt (collapses on small screens) */}
            <div className="hidden sm:flex items-center gap-2 w-[420px] max-w-full">
              <input
                className="w-full rounded-xl border border-white/10 bg-[#0f1c40] px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/20"
                placeholder="AI prompt (dummy)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generateFromAI()}
              />
              <button
                onClick={generateFromAI}
                disabled={isLoadingAI}
                className="inline-flex select-none items-center justify-center rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-500 active:scale-[.98] disabled:opacity-60"
              >
                {isLoadingAI ? (
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  "Generate"
                )}
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  nav("/");
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#121e44]/80 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-[#142354] active:scale-[.98]"
                title="Kembali ke Boards"
              >
                <span className="hidden sm:inline fa-solid fa-arrow-right-from-bracket"></span>
                <span className="sm:hidden">←</span>
              </button>
            </div>

            {/* Mobile generate button */}
            <button
              onClick={generateFromAI}
              disabled={isLoadingAI}
              className="sm:hidden inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md active:scale-[.98] disabled:opacity-60"
              title="Generate AI (dummy)"
            >
              {isLoadingAI ? (
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <span>AI</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-grow overflow-auto">
        <div className="max-w-7xl mx-auto space-y-4">
          <BoardHeaderBanner title={boardName} />

          {/* Add Task */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              className="w-full rounded-xl border border-white/10 bg-[#0f1c40] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/20"
              placeholder="Tambahkan tugas baru..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createTask()}
            />
            <button
              onClick={createTask}
              className="inline-flex select-none items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500 active:scale-[.98]"
            >
              Add Task
            </button>
          </div>

          {/* Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DragDropContext onDragEnd={onDragEnd}>
              {COLS.map((col) => (
                <Column
                  key={col.key}
                  title={col.title}
                  count={col.list.length}
                  color={col.color}
                >
                  <Droppable droppableId={col.key}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 p-2 min-h-[60px] rounded-xl border border-white/10 bg-white/5 backdrop-blur transition-all duration-300 ${
                          snapshot.isDraggingOver
                            ? "ring-2 ring-indigo-500/30"
                            : ""
                        }`}
                      >
                        {col.list.map((t, idx) => (
                          <Draggable
                            key={String(t.id)}
                            draggableId={String(t.id)}
                            index={idx}
                          >
                            {(prov, snap) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                className={`transform transition duration-200 ${
                                  snap.isDragging
                                    ? "rotate-[.5deg] scale-[1.02]"
                                    : "hover:scale-[1.01]"
                                }`}
                              >
                                <KanbanCard
                                  task={t}
                                  onDelete={removeTask}
                                  onChangeStatus={(id, s) =>
                                    patchTask(id, { status: s })
                                  }
                                  onEditTitle={(id, newTitle) =>
                                    patchTask(id, { title: newTitle })
                                  }
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Column>
              ))}
            </DragDropContext>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardPage;
