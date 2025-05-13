
import React from "react";
import ProgressRing from "./ProgressRing";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  name: string;
  progress?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  name, 
  progress = 0, 
  size = "md",
  className
}) => {
  const sizeClasses = {
    sm: "w-10 h-10 text-xs",
    md: "w-16 h-16 text-sm",
    lg: "w-20 h-20 text-base",
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const ringSize = size === "sm" ? 40 : size === "md" ? 64 : 80;
  const ringStrokeWidth = size === "sm" ? 2 : 3;

  return (
    <div className={cn("relative inline-flex", className)}>
      <ProgressRing 
        progress={progress} 
        size={ringSize} 
        strokeWidth={ringStrokeWidth} 
      />
      <div
        className={cn(
          "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-black/10",
          sizeClasses[size]
        )}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <span className="font-medium text-gray-200">{initials}</span>
        )}
      </div>
    </div>
  );
};

export default Avatar;
