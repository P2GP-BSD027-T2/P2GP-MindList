import AvatarGroup from "./AvatarGroup";

const BoardHeaderBanner = ({ title = "Craftboard Project" }) => {
  return (
    <div className="space-y-3">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-xl font-semibold text-slate-100">{title}</div>
        </div>
        <div className="flex items-center gap-2">
          <AvatarGroup />
          <button className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 active:scale-[.98]">
            Invite
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardHeaderBanner;
