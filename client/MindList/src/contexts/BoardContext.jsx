import axios from "axios";
import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { BASE_URL } from "../constant/constant";

const BoardContext = createContext();

export const BoardProvider = ({ children }) => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState(
    localStorage.getItem("name") || ""
  );
  const [newName, setNewName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const nav = useNavigate();

  // Fetch boards dari API
  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/boards`);
      setBoards(Array.isArray(data?.boards) ? data.boards : []);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Gagal memuat boards");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  console.log(boards);

  const createBoard = useCallback(
    async (event) => {
      event.preventDefault();

      if (!displayName.trim()) return toast.warn("Nama tidak boleh kosong");
      if (!newName.trim()) return toast.warn("Nama board tidak boleh kosong");

      try {
        const { data: userData } = await axios.post(`${BASE_URL}/register`, {
          name: displayName.trim(),
        });

        const userId = userData?.user?.id;
        const userName = userData?.user?.name;

        if (userId) localStorage.setItem("id", String(userId));
        if (userName) localStorage.setItem("name", String(userName));
        localStorage.setItem("board", displayName);

        const { data: createBoards } = await axios.post(`${BASE_URL}/boards`, {
          name: userName || displayName.trim(),
          boardName: newName.trim(),
        });

        const boardId = createBoards?.board?.id;
        const code = createBoards?.board?.code;
        if (code) localStorage.setItem("codeRoom", String(code));

        if (boardId) {
          toast.success("Board dibuat");
          await fetchBoards();
          nav(`/boards/${boardId}`);
        } else {
          toast.error("Gagal membuat board");
        }
      } catch (error) {
        console.error(error);
        toast.error(error?.response?.data?.message || "Gagal membuat board");
      }
    },
    [displayName, newName, nav]
  );

  // Join Board
  const joinBoard = useCallback(
    async (event) => {
      event.preventDefault();

      if (!displayName) return toast.warn("Nama tidak boleh kosong");
      if (!joinCode) return toast.warn("Kode join tidak boleh kosong");

      try {
        const { data } = await axios.post(`${BASE_URL}/boards/join`, {
          name: displayName,
          code: joinCode,
        });

        const boardId = data.data?.BoardId;
        localStorage.setItem("id", data.data?.id);
        localStorage.setItem("name", data.data?.name);
        localStorage.setItem("board", displayName);

        if (boardId) {
          toast.success("Berhasil bergabung ke board");
          nav(`/boards/${boardId}`);
        } else {
          toast.error("Kode tidak valid");
        }
      } catch (error) {
        console.error(error);
        toast.error(error?.response?.data?.message || "Gagal join board");
      }
    },
    [displayName, joinCode, nav]
  );

  // Open Board
  const handleOpenBoard = useCallback(
    async (b) => {
      try {
        const name = localStorage.getItem("name") || "Guest";
        if (!b.isMember) {
          const { data } = await axios.post(`${BASE_URL}/boards/join`, {
            name,
            code: b.code,
          });

          localStorage.setItem("id", data.data?.id);
          localStorage.setItem("name", data.data?.name);
          localStorage.setItem("board", b.boardName);

          toast.success("Bergabung ke board berhasil");
        }
        nav(`/boards/${b.id}`);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Gagal join board");
      }
    },
    [nav]
  );

  return (
    <BoardContext.Provider
      value={{
        boards,
        setBoards,
        loading,
        setLoading,
        displayName,
        setDisplayName,
        newName,
        setNewName,
        joinCode,
        setJoinCode,
        fetchBoards,
        createBoard,
        joinBoard,
        handleOpenBoard,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => useContext(BoardContext);
