
import React from "react";
import { NoExercisesDialog, SaveConfirmDialog } from "../ConfirmationDialogs";
import ExitConfirmDialog from "./ExitConfirmDialog";

interface RoutineDialogsProps {
  showNoExercisesDialog: boolean;
  setShowNoExercisesDialog: (show: boolean) => void;
  showSaveConfirmDialog: boolean;
  setShowSaveConfirmDialog: (show: boolean) => void;
  showExitConfirmDialog: boolean;
  setShowExitConfirmDialog: (show: boolean) => void;
  handleSaveRoutine: () => void;
  confirmExit: () => void;
  cancelExit: () => void;
  isSubmitting: boolean;
}

const RoutineDialogs: React.FC<RoutineDialogsProps> = ({
  showNoExercisesDialog,
  setShowNoExercisesDialog,
  showSaveConfirmDialog,
  setShowSaveConfirmDialog,
  showExitConfirmDialog,
  setShowExitConfirmDialog,
  handleSaveRoutine,
  confirmExit,
  cancelExit,
  isSubmitting
}) => {
  return (
    <>
      <NoExercisesDialog
        open={showNoExercisesDialog}
        onOpenChange={setShowNoExercisesDialog}
        onConfirm={handleSaveRoutine}
      />
      
      <SaveConfirmDialog
        open={showSaveConfirmDialog}
        onOpenChange={setShowSaveConfirmDialog}
        onConfirm={handleSaveRoutine}
        isSubmitting={isSubmitting}
      />
      
      <ExitConfirmDialog
        open={showExitConfirmDialog}
        onOpenChange={setShowExitConfirmDialog}
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />
    </>
  );
};

export default RoutineDialogs;
