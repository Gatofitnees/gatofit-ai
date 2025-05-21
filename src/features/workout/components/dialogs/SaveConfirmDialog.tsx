
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
          <AlertDialogTitle className="text-xl font-semibold text-center">Confirmar guardado</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-center">
            ¿Está seguro que desea guardar esta rutina?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Prevenir el comportamiento por defecto
              onConfirm(); // Llamar a la función onConfirm
            }}
            disabled={isSubmitting}
            className="w-full rounded-xl bg-blue-500 text-white hover:bg-blue-600 py-3"
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
          <AlertDialogCancel className="w-full rounded-xl bg-gray-800 text-white hover:bg-gray-700 py-3">
            Cancelar
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SaveConfirmDialog;
