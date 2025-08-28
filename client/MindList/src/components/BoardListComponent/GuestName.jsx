const GuestName = ({ displayName, setDisplayName }) => {
  return (
    <section>
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm p-4 sm:p-5">
        <label className="text-xs font-medium text-slate-300">
          Nama tampilan (guest)
        </label>
        <div className="mt-1 flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            className="w-full sm:w-80 rounded-xl border border-white/10 bg-[#0f1c40] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/25"
            placeholder="Contoh: Budi"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};

export default GuestName;
