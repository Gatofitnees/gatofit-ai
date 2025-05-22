
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

interface StatsDialogProps {
  open: boolean;
  onClose: () => void;
}

export const StatsDialog: React.FC<StatsDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-background sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Estadísticas del ejercicio</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Aquí se mostrarán estadísticas de rendimiento anteriores para este ejercicio.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
