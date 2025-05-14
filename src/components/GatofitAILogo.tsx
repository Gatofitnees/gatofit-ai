
import React from "react";
import { cn } from "@/lib/utils";

interface GatofitAILogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const GatofitAILogo: React.FC<GatofitAILogoProps> = ({ 
  className,
  size = "md"
}) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl"
  };

  return (
    <h1 className={cn(
      "font-bold text-galactic", 
      sizeClasses[size],
      className
    )}>
      GatofitAI
    </h1>
  );
};

export default GatofitAILogo;
