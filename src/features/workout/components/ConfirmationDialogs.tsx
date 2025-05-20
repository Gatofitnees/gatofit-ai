
import React from "react";
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

interface NoExercisesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const NoExercisesDialog: React.FC<NoExercisesDialogProps> = ({ open, onOpenChange, onConfirm }) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-xl bg-background border-secondary/30">
        <AlertDialogHeader>
          <AlertDialogTitle>¿Continuar sin ejercicios?</AlertDialogTitle>
          <AlertDialogDescription>
            Todavía no has añadido ejercicios. ¿Quieres guardar de todos modos?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="rounded-xl bg-primary">Guardar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface SaveConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export const SaveConfirmDialog: React.FC<SaveConfirmDialogProps> = ({ 
  open, 
  onOpenChange, 
  onConfirm,
  isSubmitting
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-xl bg-background border-secondary/30">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar guardado</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Está seguro que desea guardar esta rutina?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            disabled={isSubmitting}
            className="rounded-xl bg-primary"
          >
            {isSubmitting ? "Guardando..." : "Confirmar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
