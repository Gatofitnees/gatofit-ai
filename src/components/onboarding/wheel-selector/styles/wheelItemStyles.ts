
import { cn } from "@/lib/utils";

export const getWheelItemContainerStyles = (isSelected: boolean) => {
  return cn(
    "absolute left-0 w-full flex items-center justify-center cursor-pointer transition-all",
    isSelected ? "text-primary font-medium" : "text-muted-foreground"
  );
};

export const getWheelItemLabelStyles = (labelClassName?: string) => {
  return cn(
    "select-none text-center truncate px-2 transition-all duration-150",
    labelClassName
  );
};

// New helper to get enhanced 3D-like wheel styles
export const getWheelContainerStyles = (className?: string) => {
  return cn(
    "relative overflow-hidden rounded-xl bg-secondary/20 shadow-neu-card select-none touch-none",
    className
  );
};

// New helper for highlight styles
export const getWheelHighlightStyles = () => {
  return cn(
    "absolute left-0 top-1/2 w-full -translate-y-1/2 bg-primary/10 pointer-events-none z-10 backdrop-blur-[1px]"
  );
};
