const PlaceCardSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="h-44 animate-pulse bg-slate-200" />
      <div className="space-y-4 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-200" />
        <div className="h-4 w-1/3 animate-pulse rounded-full bg-slate-200" />
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded-full bg-slate-200" />
          <div className="h-3 w-5/6 animate-pulse rounded-full bg-slate-200" />
        </div>
        <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-200" />
      </div>
    </div>
  );
};

export default PlaceCardSkeleton;
