import AvatarGroup from "./AvatarGroup";

const BoardHeaderBanner = ({ title = "Craftboard Project" }) => {
  return (
    <div className="space-y-3">
      {/* Title */}
      <div className="flex items-center justify-between pl-6">
        <div className="flex items-center gap-3">
          <div className="text-xl font-semibold text-slate-100">{title}</div>
        </div>
      </div>
    </div>
  );
};

export default BoardHeaderBanner;
