
import { cn } from "@/lib/utils";

export const getWheelItemContainerStyles = (isSelected: boolean) => {
  return cn(
    "absolute left-0 w-full flex items-center justify-center cursor-pointer transition-colors",
    isSelected ? "text-primary font-medium" : "text-muted-foreground"
  );
};

export const getWheelItemLabelStyles = (labelClassName?: string) => {
  return cn("select-none text-center truncate px-2", labelClassName);
};
