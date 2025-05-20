
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

interface ExitConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const ExitConfirmDialog: React.FC<ExitConfirmDialogProps> = ({ 
  open, 
  onOpenChange, 
  onConfirm,
  onCancel
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-xl bg-background border border-secondary shadow-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-primary">¿Salir sin guardar?</AlertDialogTitle>
          <AlertDialogDescription>
            Tienes cambios sin guardar. Si sales ahora, perderás todo el progreso realizado en esta rutina.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel 
            className="rounded-xl border border-primary/20 bg-background text-primary hover:bg-primary/5"
            onClick={onCancel}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={onConfirm}
          >
            Salir sin guardar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ExitConfirmDialog;
