
import React from "react";
import { cn } from "@/lib/utils";
import MacroRing from "./MacroRing";
import { Flame, Zap, Wheat, Droplet, Drumstick } from "lucide-react";

interface MacroProgressProps {
  label: string;
  current: number;
  target: number;
  color?: string;
  unit?: string;
  className?: string;
  icon?: "calories" | "protein" | "carbs" | "fat";
}

const MacroProgress: React.FC<MacroProgressProps> = ({
  label,
  current,
  target,
  color = "primary",
  unit = "g",
  className,
  icon
}) => {
  const progress = Math.min(100, Math.max(0, (current / target) * 100));

  const colorClasses = {
    primary: "bg-primary",
    protein: "bg-blue-400", 
    carbs: "bg-green-400",
    fat: "bg-yellow-400"
  };

  const getIcon = () => {
    switch (icon) {
      case "calories":
        return <Flame className="h-4 w-4 text-orange-400" />;
      case "protein":
        return <Drumstick className="h-4 w-4 text-blue-400" />;
      case "carbs":
        return <Wheat className="h-4 w-4 text-green-400" />;
      case "fat":
        return <Droplet className="h-4 w-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          {icon && <span className="mr-1.5">{getIcon()}</span>}
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <span className="text-sm font-medium">
          {current} / {target} {unit}
        </span>
      </div>
      <div className="h-2 relative w-full bg-secondary/50 overflow-hidden rounded-full">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorClasses[color as keyof typeof colorClasses] || colorClasses.primary)}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default MacroProgress;
