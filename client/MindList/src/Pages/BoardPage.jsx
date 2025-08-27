import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "react-toastify";
import BoardHeaderBanner from "../components/BoardComponents.jsx/BoardHeaderBanner.jsx";
import Column from "../components/BoardComponents.jsx/Column.jsx";
import KanbanCard from "../components/BoardComponents.jsx/KanbanCard.jsx";
import { BASE_URL } from "../constant/constant";

// ===== Constants & helpers =====
const STATUSES = ["todo", "doing", "done"];

function groupTasks(tasks) {
  const group = { todo: [], doing: [], done: [] };
  tasks.forEach((task) => group[task.status]?.push(task));
  STATUSES.forEach((status) =>
    group[status].sort((a, b) => (a.order ?? 1) - (b.order ?? 1))
  );
  return group;
}

// ===== API layer (compatible with your routes/controllers) =====
const apiGetTasks = async (boardId) => {
  const { data } = await axios.get(`${BASE_URL}/boards/${boardId}/tasks`);
  return data.tasks || [];
};

const apiAddTask = async (boardId, payload) => {
  // payload: { title, description }
  const { data } = await axios.post(
    `${BASE_URL}/boards/${boardId}/tasks`,
    payload
  );
  return data.task;
};

const apiEditTask = async (boardId, taskId, patch) => {
  // patch: { title?, description?, status? }
  const { data } = await axios.patch(
    `${BASE_URL}/boards/${boardId}/tasks/${taskId}`,
    patch
  );
  // controller returns full tasks list
  return data.tasks;
};

const apiDeleteTask = async (boardId, taskId) => {
  const { data } = await axios.delete(
    `${BASE_URL}/boards/${boardId}/tasks/${taskId}`
  );
  return data.tasks;
};

const apiReorderTasks = async (boardId, status, orderedId) => {
  // orderedId: array of task IDs within a single status/column
  const { data } = await axios.put(
    `${BASE_URL}/boards/${boardId}/tasks/reorder`,
    {
      orderedId,
      status,
    }
  );
  // returns tasks for that status; we will refetch all for safety afterwards when needed
  return data.tasks;
};

// ===== Page component =====
const BoardPage = () => {
  const { id: boardId } = useParams();
  const nav = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const boardName = localStorage.getItem("board");

  // add task inputs
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // dummy AI prompt (unchanged)
  const [prompt, setPrompt] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const grouped = useMemo(() => groupTasks(tasks), [tasks]);

  // ===== initial fetch =====
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const t = await apiGetTasks(boardId);
        if (alive) setTasks(t);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Gagal memuat tasks");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [boardId]);

  // ===== derived helpers =====
  const nextOrder = (status) => (grouped[status].at(-1)?.order || 0) + 1;

  // ===== CRUD handlers =====
  const createTask = async () => {
    const title = newTitle.trim();
    const description = (newDesc || "").trim();
    if (!title) return; // backend will 400 EMPTY_TITLE
    try {
      const created = await apiAddTask(boardId, {
        title,
        description: description || "(no description)", // controller requires description
      });
      setTasks((prev) => [...prev, created]);
      setNewTitle("");
      setNewDesc("");
      toast.success("Task dibuat");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Gagal membuat task");
    }
  };

  const removeTask = async (id) => {
    const backup = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      const updated = await apiDeleteTask(boardId, id);
      setTasks(updated);
      toast.success("Task dihapus");
    } catch (e) {
      setTasks(backup);
      toast.error(e?.response?.data?.message || "Gagal menghapus task");
    }
  };

  const patchTask = async (id, patch) => {
    const backup = tasks;
    // optimistic
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    try {
      const updated = await apiEditTask(boardId, id, patch);
      setTasks(updated);
    } catch (e) {
      setTasks(backup);
      toast.error(e?.response?.data?.message || "Gagal update task");
    }
  };

  // ===== DnD handlers =====
  const reorderColumn = async (status, fromIndex, toIndex) => {
    const ids = grouped[status].map((t) => t.id);
    const working = [...ids];
    const [moved] = working.splice(fromIndex, 1);
    working.splice(toIndex, 0, moved);

    // optimistic re-order in FE
    const backup = tasks;
    const optimistic = tasks.map((t) => {
      if (t.status !== status) return t;
      const idx = working.indexOf(t.id);
      return { ...t, order: idx + 1 };
    });
    setTasks(optimistic);

    try {
      await apiReorderTasks(boardId, status, working);
      // optional: trust server or refetch all to ensure consistency
      const fresh = await apiGetTasks(boardId);
      setTasks(fresh);
    } catch (e) {
      setTasks(backup);
      toast.error(e?.response?.data?.message || "Gagal menyimpan urutan");
    }
  };

  const moveAcrossColumns = async (taskId, fromStatus, toStatus, toIndex) => {
    // build id lists after move
    const toIds = grouped[toStatus].map((t) => t.id);
    toIds.splice(toIndex, 0, taskId);
    const fromIds = grouped[fromStatus]
      .map((t) => t.id)
      .filter((id) => id !== taskId);

    // optimistic: change status and reorders
    const backup = tasks;
    const optimistic = tasks
      .map((t) => (t.id === taskId ? { ...t, status: toStatus } : t))
      .map((t) => {
        if (t.status === fromStatus)
          return { ...t, order: fromIds.indexOf(t.id) + 1 };
        if (t.status === toStatus)
          return { ...t, order: toIds.indexOf(t.id) + 1 };
        return t;
      });
    setTasks(optimistic);

    try {
      // 1) update status task
      await apiEditTask(boardId, taskId, { status: toStatus });
      // 2) reorder dua kolom
      await Promise.all([
        apiReorderTasks(boardId, fromStatus, fromIds),
        apiReorderTasks(boardId, toStatus, toIds),
      ]);
      // 3) refetch all for consistency
      const fresh = await apiGetTasks(boardId);
      setTasks(fresh);
    } catch (e) {
      setTasks(backup);
      toast.error(e?.response?.data?.message || "Gagal memindahkan task");
    }
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    const from = source.droppableId;
    const to = destination.droppableId;

    if (from === to) {
      if (source.index !== destination.index)
        reorderColumn(from, source.index, destination.index);
      return;
    }
    moveAcrossColumns(draggableId, from, to, destination.index);
  };

  // ===== Dummy AI generator (optional, unchanged) =====
  const generateFromAI = () => {
    const p = prompt.trim();
    if (!p) return;
    setIsLoadingAI(true);
    setTimeout(async () => {
      try {
        const ideas = [
          { title: `Riset: ${p}`, status: "todo" },
          { title: `Rencana ${p}`, status: "todo" },
          { title: `Kerjakan inti: ${p}`, status: "doing" },
          { title: `Review hasil ${p}`, status: "done" },
        ];
        for (const it of ideas) {
          await apiAddTask(boardId, { title: it.title, description: "(AI)" });
          // status default todo sesuai controller-mu; pindah kolom manual jika perlu
        }
        const fresh = await apiGetTasks(boardId);
        setTasks(fresh);
        toast.success("AI dummy: tasks ditambahkan!");
      } catch (e) {
        toast.error(e?.response?.data?.message || "Gagal generate tasks AI");
      } finally {
        setPrompt("");
        setIsLoadingAI(false);
      }
    }, 800);
  };

  // ===== UI =====
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
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm p-3 grid grid-cols-1 sm:grid-cols-[1fr_220px_auto] gap-2 items-stretch">
            <input
              className="w-full rounded-xl border border-white/10 bg-[#0f1c40] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/20"
              placeholder="Judul tugas..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createTask()}
            />
            <input
              className="w-full rounded-xl border border-white/10 bg-[#0f1c40] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/20"
              placeholder="Deskripsi singkat (opsional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
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
                        {loading && col.list.length === 0 ? (
                          <div className="h-24 animate-pulse rounded-xl bg-white/10" />
                        ) : (
                          col.list.map((t, idx) => (
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
                                    onEditTitle={(id, title) =>
                                      patchTask(id, { title })
                                    }
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
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
