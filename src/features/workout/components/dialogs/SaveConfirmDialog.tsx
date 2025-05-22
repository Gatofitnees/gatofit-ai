
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SaveConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isLoading: boolean;
  isEditing?: boolean;
}

const SaveConfirmDialog: React.FC<SaveConfirmDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading,
  isEditing = false
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-card border border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>{isEditing ? '¿Guardar cambios?' : '¿Guardar rutina?'}</AlertDialogTitle>
          <AlertDialogDescription>
            {isEditing 
              ? 'Los cambios realizados se guardarán en la rutina existente.'
              : '¿Deseas guardar esta rutina para usarla en futuros entrenamientos?'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="bg-secondary text-foreground"
            disabled={isLoading}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-primary"
            onClick={(e) => {
              e.preventDefault();
              onSave();
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                {isEditing ? 'Guardando...' : 'Guardando...'}
              </>
            ) : (
              isEditing ? 'Guardar cambios' : 'Guardar'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SaveConfirmDialog;
