
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
  exerciseName: string;
  notes: string;
  onSave: (notes: string) => void;
}

export const ExerciseNotesDialog: React.FC<ExerciseNotesDialogProps> = ({
  isOpen,
  onClose,
  exerciseName,
  notes,
  onSave
}) => {
  const [localNotes, setLocalNotes] = useState(notes);

  const handleSave = () => {
    onSave(localNotes);
    onClose();
  };

  const handleClose = () => {
    setLocalNotes(notes); // Reset to original notes
    onClose();
  };

  // Update local notes when notes prop changes
  React.useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-background border border-white/10 max-w-sm mx-auto rounded-xl">
        <DialogHeader className="flex flex-row items-center justify-between pb-2">
          <DialogTitle className="text-lg font-medium">
            Agregar nota del ejercicio
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 hover:bg-secondary/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">{exerciseName}</p>
            <Textarea
              placeholder="Escribe tus notas sobre este ejercicio..."
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              className="min-h-[100px] resize-none rounded-lg border-white/10 bg-secondary/20 focus:border-primary/50"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={handleClose} className="rounded-lg">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="rounded-lg">
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
