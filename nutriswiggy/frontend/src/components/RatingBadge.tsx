import React from "react";
import { Star } from "lucide-react";

interface RatingBadgeProps {
  rating: number;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({ rating }) => {
  const getColors = () => {
    if (rating >= 4.5) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (rating >= 4.0) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    return "bg-rose-500/20 text-rose-400 border-rose-500/30";
  };

  return (
    <div className={`flex items-center gap-1 border px-2 py-0.5 rounded-lg text-xs font-black shadow-sm ${getColors()}`}>
      <Star className="w-3.5 h-3.5 fill-current stroke-[3px]" />
      <span>{rating.toFixed(1)}</span>
    </div>
  );
};
export default RatingBadge;
