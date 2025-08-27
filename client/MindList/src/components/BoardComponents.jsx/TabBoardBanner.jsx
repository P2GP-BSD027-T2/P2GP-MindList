const Tab = ({ name, active }) => {
  return (
    <button
      className={`px-3 py-1.5 rounded-xl text-sm transition-colors select-none border ${
        active
          ? "bg-indigo-700 text-white border-indigo-500 shadow-sm"
          : "border-transparent text-slate-300 hover:bg-white/5 hover:text-white"
      }`}
    >
      {name}
    </button>
  );
};

export default Tab;
