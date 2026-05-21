import React from "react";

export const SkeletonLoader = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden h-[300px] p-4 flex flex-col justify-between animate-pulse"
        >
          <div className="w-full h-40 bg-slate-800 rounded-xl mb-3" />
          <div className="space-y-2">
            <div className="h-4 bg-slate-800 rounded-md w-3/4" />
            <div className="h-3 bg-slate-800 rounded-md w-1/2" />
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/40">
            <div className="h-6 bg-slate-800 rounded-md w-12" />
            <div className="h-4 bg-slate-800 rounded-md w-16" />
            <div className="h-4 bg-slate-800 rounded-md w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};
export default SkeletonLoader;
