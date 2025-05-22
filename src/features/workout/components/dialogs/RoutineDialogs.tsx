
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
  isEditing?: boolean;
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
  isSubmitting,
  isEditing = false
}) => {
  return (
    <>
      <NoExercisesDialog 
        isOpen={showNoExercisesDialog}
        onClose={() => setShowNoExercisesDialog(false)}
      />
      
      <SaveConfirmDialog 
        isOpen={showSaveConfirmDialog}
        onClose={() => setShowSaveConfirmDialog(false)}
        onSave={handleSaveRoutine}
        isLoading={isSubmitting}
        isEditing={isEditing}
      />
      
      <DiscardChangesDialog 
        isOpen={showDiscardChangesDialog}
        onClose={() => setShowDiscardChangesDialog(false)}
        onConfirm={handleDiscardChanges}
      />
    </>
  );
};

export default RoutineDialogs;
