import { create } from "zustand";
import { produce } from "immer";

export const useAppStore = create((set) => ({
  user: { id: null, name: localStorage.getItem("name") || "Guest" },
  boards: [],
  tasksByStatus: { todo: [], doing: [], done: [] },

  setUser: (name) =>
    set(
      produce((set) => {
        set.user.name = name;
        localStorage.setItem("name", name);
      })
    ),

  setBoards: (arr) => set({ boards: arr }),

  setTasksFromList(list) {
    const grouped = { todo: [], doing: [], done: [] };
    list.forEach((todo) => grouped[todo.status].push(todo));
    Object.keys(grouped).forEach((key) =>
      grouped[key].sort((a, b) => a.order - b.order)
    );
    set({ tasksByStatus: grouped });
  },
}));
