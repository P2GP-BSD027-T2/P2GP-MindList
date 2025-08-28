const CreateJoinAcc = ({
  newName,
  setNewName,
  createBoard,
  joinCode,
  setJoinCode,
  joinBoard,
}) => {
  const canCreate = newName.trim().length > 0;
  const canJoin = joinCode.trim().length > 0;

  return (
    <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Create Board */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm p-4 sm:p-5">
        <h2 className="text-base font-semibold text-slate-100">
          Buat board baru
        </h2>
        <form
          className="mt-3 flex flex-col sm:flex-row gap-2"
          onSubmit={createBoard}
          noValidate
        >
          <input
            className="w-full rounded-xl border border-white/10 bg-[#0f1c40] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/25"
            placeholder="Nama board baru"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Nama board baru"
          />
          <button
            type="submit"
            disabled={!canCreate}
            aria-disabled={!canCreate}
            className="inline-flex select-none items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Board
          </button>
        </form>
      </div>

      {/* Join with Code */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-sm p-4 sm:p-5">
        <h2 className="text-base font-semibold text-slate-100">
          Join dengan kode
        </h2>
        <form
          className="mt-3 flex flex-col sm:flex-row gap-2"
          onSubmit={joinBoard}
          noValidate
        >
          <input
            className="w-full rounded-xl border border-white/10 bg-[#0f1c40] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/25 uppercase"
            placeholder="Kode undangan (mis. A1B2C3)"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Kode undangan board"
          />
          <button
            type="submit"
            disabled={!canJoin}
            aria-disabled={!canJoin}
            className="inline-flex select-none items-center justify-center rounded-xl bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-600 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Board
          </button>
        </form>
      </div>
    </section>
  );
};

export default CreateJoinAcc;
