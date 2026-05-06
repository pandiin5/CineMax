import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating?: number; // typically out of 10 from TMDB
  max?: number;
  className?: string;
  showText?: boolean;
}

export function StarRating({ rating = 0, max = 5, className = "", showText = true }: StarRatingProps) {
  // Convert 10-point scale to 5-point scale if max is 5
  const normalizedRating = max === 5 ? rating / 2 : rating;
  
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center text-gold">
        <Star size={16} fill="currentColor" strokeWidth={0} />
      </div>
      {showText && (
        <span className="text-white font-medium text-sm">
          {rating ? rating.toFixed(1) : "0.0"}
        </span>
      )}
    </div>
  );
}
