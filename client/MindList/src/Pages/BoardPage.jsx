import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import BoardHeaderBanner from "../components/BoardComponents.jsx/BoardHeaderBanner.jsx";
import Column from "../components/BoardComponents.jsx/Column.jsx";
import KanbanCard from "../components/BoardComponents.jsx/KanbanCard.jsx";
import { BASE_URL } from "../constant/constant";
import { useBoard } from "../contexts/BoardContext";

const STATUSES = ["todo", "doing", "done"];

function groupTasks(tasks) {
  const group = { todo: [], doing: [], done: [] };
  tasks.forEach((task) => group[task.status]?.push(task));
  STATUSES.forEach((status) =>
    group[status].sort((a, b) => (a.order ?? 1) - (b.order ?? 1))
  );
  return group;
}

const BoardPage = () => {
  const { id: boardId } = useParams();
  const nav = useNavigate();

  const boardName = localStorage.getItem("board") || "Board";

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const {
    tasks,
    setTasks,
    grouped,
    loading,
    apiAddTask,
    apiEditTask,
    apiDeleteTask,
    apiGetTasks,
    apiReorderTasks,
  } = useBoard();

  const socketRef = useRef(null);

  // ===== Socket =====
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(BASE_URL, {
        withCredentials: true,
        transports: ["websocket"],
      });
    }
    const socket = socketRef.current;

    if (boardId) socket.emit("joinBoard", boardId);

    const onCreated = ({ task }) => {
      if (!task) return;
      setTasks((prev) =>
        prev.some((t) => String(t.id) === String(task.id))
          ? prev
          : [...prev, task]
      );
    };
    const onUpdated = ({ tasks: serverTasks }) =>
      Array.isArray(serverTasks) && setTasks(serverTasks);
    const onDeleted = ({ tasks: serverTasks }) =>
      Array.isArray(serverTasks) && setTasks(serverTasks);
    const onReordered = ({ tasks: serverTasks }) =>
      Array.isArray(serverTasks) && setTasks(serverTasks);

    socket.on("task:created", onCreated);
    socket.on("task:updated", onUpdated);
    socket.on("task:deleted", onDeleted);
    socket.on("task:reordered", onReordered);

    const onConnect = async () => {
      try {
        const fresh = await apiGetTasks(boardId);
        setTasks(fresh);
      } catch {}
    };
    socket.on("connect", onConnect);

    return () => {
      if (boardId) socket.emit("leaveBoard", boardId);
      socket.off("task:created", onCreated);
      socket.off("task:updated", onUpdated);
      socket.off("task:deleted", onDeleted);
      socket.off("task:reordered", onReordered);
      socket.off("connect", onConnect);
    };
  }, [boardId]);

  // ===== Initial fetch =====
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const t = await apiGetTasks(boardId);
        if (alive) setTasks(t);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Gagal memuat tasks");
      }
    })();
    return () => {
      alive = false;
    };
  }, [boardId]);

  // ===== CRUD =====
  const createTask = async () => {
    const title = newTitle.trim();
    const description = (newDesc || "").trim();
    if (!title) return;
    try {
      await apiAddTask({
        title,
        description: description || "(no description)",
      });
      setNewTitle("");
      setNewDesc("");
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
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    try {
      const updated = await apiEditTask(boardId, id, patch);
      setTasks(updated);
    } catch (e) {
      setTasks(backup);
      toast.error(e?.response?.data?.message || "Gagal update task");
    }
  };

  const reorderColumn = async (status, fromIndex, toIndex) => {
    const col = grouped[status];
    if (!col) return;

    const ids = col.map((t) => t.id);
    const working = [...ids];
    const [moved] = working.splice(fromIndex, 1);
    working.splice(toIndex, 0, moved);

    const backup = tasks;
    const optimistic = tasks.map((t) => {
      if (t.status !== status) return t;
      const idx = working.indexOf(t.id);
      return { ...t, order: idx + 1 };
    });
    setTasks(optimistic);

    try {
      await apiReorderTasks(boardId, status, working);
      const fresh = await apiGetTasks(boardId);
      setTasks(fresh);
    } catch (e) {
      setTasks(backup);
      toast.error(e?.response?.data?.message || "Gagal menyimpan urutan");
    }
  };

  const moveAcrossColumns = async (taskId, fromStatus, toStatus, toIndex) => {
    if (!grouped[fromStatus] || !grouped[toStatus]) return;

    const toIds = grouped[toStatus].map((t) => t.id);
    toIds.splice(toIndex, 0, taskId);
    const fromIds = grouped[fromStatus]
      .map((t) => t.id)
      .filter((id) => id !== taskId);

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
      await apiEditTask(boardId, taskId, { status: toStatus });
      await Promise.all([
        apiReorderTasks(boardId, fromStatus, fromIds),
        apiReorderTasks(boardId, toStatus, toIds),
      ]);
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

  const generateFromAI = () => {
    const p = prompt.trim();
    if (!p) return;
    setIsLoadingAI(true);
    setTimeout(async () => {
      try {
        const ideas = [
          { title: `Riset: ${p}` },
          { title: `Rencana ${p}` },
          { title: `Kerjakan inti: ${p}` },
          { title: `Review hasil ${p}` },
        ];
        for (const it of ideas) {
          await apiAddTask({ title: it.title, description: "(AI)" });
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

            {/* AI Prompt */}
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
                {isLoadingAI ? <span>...</span> : "Generate"}
              </button>
              <button
                onClick={() => nav("/")}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#121e44]/80 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-[#142354] active:scale-[.98]"
                title="Kembali ke Boards"
              >
                <span className="sm:hidden">←</span>
                <span className="hidden sm:inline">Exit</span>
              </button>
            </div>
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
