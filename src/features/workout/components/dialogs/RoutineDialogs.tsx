
import React from "react";
import NoExercisesDialog from "./NoExercisesDialog";
import SaveConfirmDialog from "./SaveConfirmDialog";
import DiscardChangesDialog from "./DiscardChangesDialog";

interface RoutineDialogsProps {
  showNoExercisesDialog: boolean;
  setShowNoExercisesDialog: (show: boolean) => void;
  showSaveConfirmDialog: boolean;
  setShowSaveConfirmDialog: (show: boolean) => void;
  showDiscardChangesDialog: boolean;
  setShowDiscardChangesDialog: (show: boolean) => void;
  handleSaveRoutine: () => void;
  handleDiscardChanges: () => void;
  isSubmitting: boolean;
}

const RoutineDialogs: React.FC<RoutineDialogsProps> = ({
  showNoExercisesDialog,
  setShowNoExercisesDialog,
  showSaveConfirmDialog,
  setShowSaveConfirmDialog,
  showDiscardChangesDialog,
  setShowDiscardChangesDialog,
  handleSaveRoutine,
  handleDiscardChanges,
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

      <DiscardChangesDialog
        open={showDiscardChangesDialog}
        onOpenChange={setShowDiscardChangesDialog}
        onConfirm={handleDiscardChanges}
      />
    </>
  );
};

export default RoutineDialogs;
