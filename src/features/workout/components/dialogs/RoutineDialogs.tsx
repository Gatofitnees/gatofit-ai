
import React from "react";
import { NoExercisesDialog, SaveConfirmDialog } from "@/features/workout/components/ConfirmationDialogs";

interface RoutineDialogsProps {
  showNoExercisesDialog: boolean;
  setShowNoExercisesDialog: (show: boolean) => void;
  showSaveConfirmDialog: boolean;
  setShowSaveConfirmDialog: (show: boolean) => void;
  handleSaveRoutine: () => void;
  isSubmitting: boolean;
}

const RoutineDialogs: React.FC<RoutineDialogsProps> = ({
  showNoExercisesDialog,
  setShowNoExercisesDialog,
  showSaveConfirmDialog,
  setShowSaveConfirmDialog,
  handleSaveRoutine,
  isSubmitting
}) => {
  return (
    <>
      <NoExercisesDialog 
        open={showNoExercisesDialog} 
        onOpenChange={setShowNoExercisesDialog}
        onConfirm={() => {
          setShowNoExercisesDialog(false);
          setShowSaveConfirmDialog(true);
        }} 
      />

      <SaveConfirmDialog 
        open={showSaveConfirmDialog} 
        onOpenChange={setShowSaveConfirmDialog}
        onConfirm={handleSaveRoutine}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default RoutineDialogs;
