import { useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Navbar from "../components/BoardListComponent/Navbar";
import GuestName from "../components/BoardListComponent/GuestName";
import CreateJoinAcc from "../components/BoardListComponent/CreateJoinAcc";
import Toolbar from "../components/BoardListComponent/ToolBar";
import BoardsList from "../components/BoardListComponent/BoardsList";
import { useBoardList } from "../contexts/BoardListContext";

const BoardListPage = () => {
  const {
    boards,
    loading,
    createBoard,
    joinBoard,
    handleOpenBoard,
    displayName,
    setDisplayName,
    newName,
    setNewName,
    joinCode,
    setJoinCode,
    fetchBoards,
  } = useBoardList();

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const refresh = () => {
    fetchBoards().then(() => toast.success("Boards refreshed"));
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
