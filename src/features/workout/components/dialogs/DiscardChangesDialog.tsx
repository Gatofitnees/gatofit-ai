
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

interface DiscardChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const DiscardChangesDialog: React.FC<DiscardChangesDialogProps> = ({ 
  open, 
  onOpenChange, 
  onConfirm 
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-xl border-none bg-white shadow-neu-dialog max-w-[320px] p-6">
        <AlertDialogHeader className="mb-2">
          <AlertDialogTitle className="text-lg font-bold text-center">¿Te vas a ir sin guardar los cambios?</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-muted-foreground">
            Los cambios no guardados se perderán.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col gap-2 sm:flex-row">
          <AlertDialogCancel className="rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 w-full">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className="rounded-xl bg-primary text-white hover:bg-primary/90 w-full"
          >
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DiscardChangesDialog;
