const AvatarGroup = () => {
  return (
    <div className="flex -space-x-2 pr-2">
      {["AL", "AB", "DT"].map((t, i) => (
        <div
          key={i}
          className="size-8 rounded-full grid place-items-center text-[11px] font-semibold border border-white/20 bg-white/10 text-slate-100 backdrop-blur"
        >
          {t}
        </div>
      ))}
    </div>
  );
};

export default AvatarGroup;
