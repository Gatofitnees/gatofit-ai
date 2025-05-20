
import React from "react";
import { NoExercisesDialog, SaveConfirmDialog } from "@/features/workout/components/ConfirmationDialogs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface RoutineDialogsProps {
  showNoExercisesDialog: boolean;
  setShowNoExercisesDialog: (show: boolean) => void;
  showSaveConfirmDialog: boolean;
  setShowSaveConfirmDialog: (show: boolean) => void;
  showExitConfirmDialog: boolean;
  setShowExitConfirmDialog: (show: boolean) => void;
  handleSaveRoutine: () => void;
  handleConfirmExit: () => void;
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
  handleConfirmExit,
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

      {/* Diálogo de confirmación de salida */}
      <AlertDialog open={showExitConfirmDialog} onOpenChange={setShowExitConfirmDialog}>
        <AlertDialogContent className="rounded-xl bg-background border-secondary/30">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Salir sin guardar cambios?</AlertDialogTitle>
            <AlertDialogDescription>
              Perderás todo el progreso de la rutina que estás creando.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExit} className="rounded-xl bg-primary">Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RoutineDialogs;
