import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import Navbar from "../components/BoardListComponent/Navbar";
import GuestName from "../components/BoardListComponent/GuestName";
import CreateJoinAcc from "../components/BoardListComponent/CreateJoinAcc";
import Toolbar from "../components/BoardListComponent/ToolBar";
import BoardsList from "../components/BoardListComponent/BoardsList";
import axios from "axios";
import { BASE_URL } from "../constant/constant";

const BoardListPage = () => {
  const nav = useNavigate();

  // State
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [newName, setNewName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  // Fetch boards from API
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

  const refresh = () => {
    fetchBoards().then(() => toast.success("Boards refreshed"));
  };

  // Actions
  const createBoard = async (event) => {
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
        nav(`/boards/${boardId}`);
      } else {
        toast.error("Gagal membuat board");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Gagal membuat board");
    }
  };

  const joinBoard = async (event) => {
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
  };

  const handleOpenBoard = async (b) => {
    try {
      const name = localStorage.getItem("name") || "Guest";
      if (!b.isMember) {
        const { data } = await axios.post(`${BASE_URL}/boards/join`, {
          name,
          code: b.code,
        });

        console.log(b.boardName);

        localStorage.setItem("id", data.data?.id);
        localStorage.setItem("name", data.data?.name);
        localStorage.setItem("board", b.boardName);

        toast.success("Bergabung ke board berhasil");
      }
      nav(`/boards/${b.id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal join board");
    }
  };

  // Derived list (search + sort)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = [...boards];

    if (q) {
      arr = arr.filter((b) => {
        const name = String(b?.name || b?.boardName || "").toLowerCase();
        const code = String(b?.code || "").toLowerCase();
        return name.includes(q) || code.includes(q);
      });
    }

    switch (sortBy) {
      case "az":
        arr.sort((a, b) =>
          String(a?.name || a?.boardName || "").localeCompare(
            String(b?.name || b?.boardName || "")
          )
        );
        break;
      case "za":
        arr.sort((a, b) =>
          String(b?.name || b?.boardName || "").localeCompare(
            String(a?.name || a?.boardName || "")
          )
        );
        break;
      case "recent":
      default:
        arr.sort(
          (a, b) =>
            Number(new Date(b?.createdAt || 0)) -
            Number(new Date(a?.createdAt || 0))
        );
        break;
    }

    return arr;
  }, [boards, query, sortBy]);

  // Utils
  const hueFrom = (seed) => {
    const s = String(seed || "seed");
    let hash = 0;
    for (let i = 0; i < s.length; i++)
      hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
    return hash % 8;
  };

  const copy = async (text, msg = "Disalin") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(msg);
    } catch {
      toast.error("Gagal menyalin");
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#0b1530] via-[#0e1b3d] to-[#0b1530] text-slate-100">
      {/* NAVBAR (Header) */}
      <Navbar refresh={refresh} loading={loading} displayName={displayName} />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {/* Guest name */}
        <GuestName displayName={displayName} setDisplayName={setDisplayName} />

        {/* Create & Join */}
        <CreateJoinAcc
          newName={newName}
          setNewName={setNewName}
          createBoard={createBoard}
          setJoinCode={setJoinCode}
          joinCode={joinCode}
          joinBoard={joinBoard}
        />

        {/* Toolbar */}
        <Toolbar
          query={query}
          setQuery={setQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* Boards list */}
        <BoardsList
          loading={loading}
          filtered={filtered}
          hueFrom={hueFrom}
          onOpenBoard={handleOpenBoard}
          onCopyCode={(code, msg) => copy(code, msg)}
        />
      </div>
      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default BoardListPage;
