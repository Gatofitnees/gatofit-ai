
import { useState } from "react";

export function useExerciseUIState() {
  const [showStatsDialog, setShowStatsDialog] = useState<number | null>(null);
  const [isReorderMode, setIsReorderMode] = useState<boolean>(false);

  const handleReorderDrag = (result: any) => {
    // This will be handled by the parent component that manages the exercises array
    return result;
  };

  const handleToggleReorderMode = () => {
    setIsReorderMode(!isReorderMode);
  };

  return {
    showStatsDialog,
    isReorderMode,
    setShowStatsDialog,
    handleReorderDrag,
    handleToggleReorderMode
  };
}
