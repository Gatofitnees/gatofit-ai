
import React, { useState } from "react";
import ProgressRing from "./ProgressRing";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  name: string;
  progress?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  isPremium?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  name, 
  progress = 0, 
  size = "md",
  className,
  isPremium = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

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

  // Log para debug
  console.log('Avatar Debug:', { src, name, imageError, imageLoaded, isPremium });

  const handleImageError = () => {
    console.log('Avatar image error for:', src);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Avatar image loaded successfully for:', src);
    setImageLoaded(true);
    setImageError(false);
  };

  // Determine if we should show image or initials
  const shouldShowImage = src && !imageError && imageLoaded;
  const shouldShowInitials = !src || imageError || !imageLoaded;

  return (
    <div className={cn("relative inline-flex", className)}>
      <ProgressRing 
        progress={progress} 
        size={ringSize} 
        strokeWidth={ringStrokeWidth} 
      />
      {/* Premium golden ring */}
      {isPremium && (
        <div 
          className="absolute inset-0 rounded-full border-2 border-gradient-to-r from-yellow-400 to-orange-500"
          style={{
            background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
            padding: '2px',
            borderRadius: '50%'
          }}
        >
          <div className="w-full h-full rounded-full bg-background" />
        </div>
      )}
      <div
        className={cn(
          "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary flex items-center justify-center overflow-hidden",
          isPremium ? "border-2 border-yellow-400 shadow-lg shadow-yellow-400/20" : "border border-black/10",
          sizeClasses[size]
        )}
      >
        {src && !imageError && (
          <img
            src={src}
            alt={name}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-200",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onError={handleImageError}
            onLoad={handleImageLoad}
            crossOrigin="anonymous"
          />
        )}
        {shouldShowInitials && (
          <span className="font-medium text-gray-200">{initials}</span>
        )}
      </div>
    </div>
  );
};

export default Avatar;
