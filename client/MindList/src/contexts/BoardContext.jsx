import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../constant/constant";

const BoardContext = createContext();
export const useBoard = () => useContext(BoardContext);

export const BoardProvider = ({ boardId, children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);

  // === API wrappers ===
  const apiGetTasks = async () => {
    const { data } = await axios.get(`${BASE_URL}/boards/${boardId}/tasks`);
    return data.tasks || [];
  };

  const apiAddTask = async (payload) => {
    try {
      const { data } = await axios.post(
        `${BASE_URL}/boards/${boardId}/tasks`,
        payload
      );
      setTasks((prev) => [...prev, data.task]);
      toast.success("Task dibuat");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Gagal membuat task");
    }
  };

  const apiEditTask = async (id, patch) => {
    try {
      const { data } = await axios.patch(
        `${BASE_URL}/boards/${boardId}/tasks/${id}`,
        patch
      );
      setTasks(data.tasks);
    } catch (e) {
      toast.error("Gagal update task");
    }
  };

  const apiDeleteTask = async (id) => {
    try {
      const { data } = await axios.delete(
        `${BASE_URL}/boards/${boardId}/tasks/${id}`
      );
      setTasks(data.tasks);
    } catch (e) {
      toast.error("Gagal hapus task");
    }
  };

  const apiReorderTasks = async (status, orderedId) => {
  try {
    const { data } = await axios.put(
      `${BASE_URL}/boards/${boardId}/tasks/reorder`,
      { orderedId, status }
    );
    setTasks(data.tasks);
  } catch (e) {
    toast.error("Gagal menyimpan urutan");
  }
};

  // === Socket connect ===
  useEffect(() => {
    if (!boardId) return;
    if (!socketRef.current) {
      socketRef.current = io(BASE_URL, {
        withCredentials: true,
        transports: ["websocket"],
      });
    }
    const socket = socketRef.current;

    socket.emit("joinBoard", boardId);
    socket.on("task:created", ({ task }) =>
      setTasks((prev) => [...prev, task])
    );
    socket.on("task:updated", ({ tasks }) => setTasks(tasks));
    socket.on("task:deleted", ({ tasks }) => setTasks(tasks));

    (async () => {
      setLoading(true);
      try {
        const fresh = await apiGetTasks();
        setTasks(fresh);
      } catch {
        toast.error("Gagal memuat task");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      socket.emit("leaveBoard", boardId);
      socket.off();
    };
  }, [boardId]);

  const grouped = useMemo(() => {
    const group = { todo: [], doing: [], done: [] };
    tasks.forEach((t) => group[t.status]?.push(t));
    return group;
  }, [tasks]);

  return (
    <BoardContext.Provider
      value={{
        tasks,
        grouped,
        loading,
        apiAddTask,
        apiEditTask,
        apiDeleteTask,
        apiReorderTasks
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};
