
import React from "react";
import Button from "@/components/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface SaveRoutineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routineName: string;
  exerciseCount: number;
  estimatedDuration: number;
  onConfirm: () => void;
  isSaving: boolean;
}

const SaveRoutineDialog: React.FC<SaveRoutineDialogProps> = ({
  open,
  onOpenChange,
  routineName,
  exerciseCount,
  estimatedDuration,
  onConfirm,
  isSaving
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background/95 border-none shadow-neu-dialog backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-center">Guardar Rutina</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>¿Deseas guardar la rutina <strong>{routineName}</strong> con {exerciseCount} ejercicios?</p>
          <p className="text-sm text-muted-foreground mt-2">
            Estimación de duración: ~{estimatedDuration} minutos
          </p>
        </div>
        <DialogFooter>
          <Button 
            variant="secondary" 
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={onConfirm} 
            disabled={isSaving}
          >
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveRoutineDialog;
