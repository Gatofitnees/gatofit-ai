
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

interface ExerciseNotesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: string) => void;
  currentNotes: string;
  exerciseName: string;
}

export const ExerciseNotesDialog: React.FC<ExerciseNotesDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  currentNotes,
  exerciseName
}) => {
  const [notes, setNotes] = useState(currentNotes);

  React.useEffect(() => {
    setNotes(currentNotes);
  }, [currentNotes, isOpen]);

  const handleSave = () => {
    onSave(notes);
    onClose();
  };

  const handleClose = () => {
    setNotes(currentNotes); // Reset to original notes
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">
            Agregar nota del ejercicio
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">{exerciseName}</p>
            <Textarea
              placeholder="Escribe aquí tus notas sobre este ejercicio..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
