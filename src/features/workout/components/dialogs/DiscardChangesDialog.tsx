
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
      <AlertDialogContent className="rounded-xl border-secondary bg-background/95 backdrop-blur-sm max-w-[90vw] sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold">¿Te vas a ir sin guardar los cambios?</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Los cambios no guardados se perderán.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl bg-muted text-foreground hover:bg-muted/80">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="rounded-xl bg-primary text-white hover:bg-primary/90"
          >
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DiscardChangesDialog;
