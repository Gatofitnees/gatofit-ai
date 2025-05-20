
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
import { Loader2 } from "lucide-react";

interface SaveConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

const SaveConfirmDialog: React.FC<SaveConfirmDialogProps> = ({ 
  open, 
  onOpenChange, 
  onConfirm,
  isSubmitting
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-xl border-secondary bg-background/95 backdrop-blur-sm max-w-[90vw] sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold">Confirmar guardado</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            ¿Está seguro que desea guardar esta rutina?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl bg-muted text-foreground hover:bg-muted/80">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm} 
            disabled={isSubmitting}
            className="rounded-xl bg-primary text-white hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Confirmar'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SaveConfirmDialog;
