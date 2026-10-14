import React from "react";
import { Star } from "lucide-react";

export default function RatingStars({ rating = 0, count = 0, size = "sm" }) {
  const numRating = Number(rating) || 0;
  const starSize = size === "lg" ? "w-5 h-5" : size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              numRating >= star
                ? "fill-amber-400 text-amber-400"
                : numRating >= star - 0.5
                ? "fill-amber-200 text-amber-400"
                : "text-slate-200"
            }`}
          />
        ))}
      </div>
      <span className="font-bold text-slate-800 text-xs">
        {numRating > 0 ? numRating.toFixed(1) : "New"}
      </span>
      {count > 0 && (
        <span className="text-slate-400 text-xs">
          ({count})
        </span>
      )}
    </div>
  );
}
