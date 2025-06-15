
import React from "react";
import { cn } from "@/lib/utils";

interface GatofitAILogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  iconOnly?: boolean;
  textOnly?: boolean;
}

const GatofitAIIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 251 251" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="GatofitAI Logo">
        <g clipPath="url(#clip0_1094_1021_logo)">
            <path d="M125.5 251C194.796 251 251 194.796 251 125.5C251 56.204 194.796 0 125.5 0C56.204 0 0 56.204 0 125.5C0 194.796 56.204 251 125.5 251Z" fill="url(#paint0_linear_1094_1021_logo)"/>
            <path d="M152.01 176.45C152.01 176.45 151.04 186.23 140.29 186.23C129.54 186.23 129.54 176.45 129.54 176.45C129.54 176.45 120.04 176.45 120.04 166.4C120.04 156.35 129.54 156.35 129.54 156.35V132.89L152.01 154.62V176.45Z" fill="white"/>
            <path d="M165.73 133.4C165.73 133.4 175.22 132.89 175.22 143.14C175.22 153.39 165.73 154.38 165.73 154.38C165.73 154.38 165.73 163.63 156.48 163.63C147.23 163.63 147.23 154.38 147.23 154.38L129.52 132.89H156.72L165.73 133.4Z" fill="white"/>
            <path d="M110.53 74.55C110.53 74.55 111.27 64.77 122.02 64.77C132.77 64.77 132.77 74.55 132.77 74.55C132.77 74.55 142.27 74.55 142.27 84.6C142.27 94.65 132.77 94.65 132.77 94.65V118.11L110.53 96.38V74.55Z" fill="white"/>
            <path d="M96.81 117.6C96.81 117.6 87.32 118.11 87.32 107.86C87.32 97.61 96.81 96.62 96.81 96.62C96.81 96.62 96.81 87.37 106.06 87.37C115.31 87.37 115.31 96.62 115.31 96.62L132.79 118.11H105.82L96.81 117.6Z" fill="white"/>
        </g>
        <defs>
            <linearGradient id="paint0_linear_1094_1021_logo" x1="251" y1="125.5" x2="0" y2="125.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2D7EFD"/>
                <stop offset="0.510417" stopColor="#A54FF5"/>
                <stop offset="1" stopColor="#2D7EFD"/>
            </linearGradient>
            <clipPath id="clip0_1094_1021_logo">
                <rect width="251" height="251" fill="white"/>
            </clipPath>
        </defs>
    </svg>
);

const GatofitAILogo: React.FC<GatofitAILogoProps> = ({ 
  className,
  size = "md",
  iconOnly = false,
  textOnly = false,
}) => {
  const sizeClasses = {
    icon: {
      sm: "h-6 w-6",
      md: "h-8 w-8",
      lg: "h-10 w-10",
      xl: "h-20 w-20",
    },
    text: {
      sm: "text-lg",
      md: "text-2xl",
      lg: "text-3xl",
      xl: "text-4xl",
    }
  };
  
  if (iconOnly) {
    return <GatofitAIIcon className={cn(sizeClasses.icon[size], className)} />;
  }

  const textElement = (
    <span className={cn(
      "font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-600 to-blue-500 animate-galaxy-pulse animate-galaxy-glow", 
      sizeClasses.text[size]
    )}>
      GatofitAI
    </span>
  );

  if (textOnly) {
    return (
      <div className={cn("inline-flex items-center align-middle", className)}>
        {textElement}
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-3 align-middle", className)}>
        <GatofitAIIcon className={cn(sizeClasses.icon[size])} />
        {textElement}
    </div>
  );
};

export default GatofitAILogo;
