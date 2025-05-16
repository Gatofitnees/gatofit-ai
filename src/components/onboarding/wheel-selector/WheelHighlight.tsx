
import React from "react";
import { cn } from "@/lib/utils";

interface WheelHighlightProps {
  itemHeight?: number;
}

const WheelHighlight: React.FC<WheelHighlightProps> = ({ itemHeight = 40 }) => {
  return (
    <div 
      className="absolute left-0 top-1/2 w-full -translate-y-1/2 bg-primary/10 pointer-events-none z-10 border-y border-primary/20"
      style={{ height: `${itemHeight}px` }}
    />
  );
};

export default WheelHighlight;
