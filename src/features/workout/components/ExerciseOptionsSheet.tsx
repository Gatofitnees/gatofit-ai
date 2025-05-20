
import React from "react";
import { Grip, Plus, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Button from "@/components/Button";

interface ExerciseOptionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReorderClick: () => void;
  onReplaceExercise: () => void;
  onRemoveExercise: () => void;
}

const ExerciseOptionsSheet: React.FC<ExerciseOptionsSheetProps> = ({
  open,
  onOpenChange,
  onReorderClick,
  onReplaceExercise,
  onRemoveExercise
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="px-0">
        <SheetHeader className="text-left px-4">
          <SheetTitle>Opciones de ejercicio</SheetTitle>
        </SheetHeader>
        <div className="space-y-2 mt-4">
          <Button
            variant="secondary"
            fullWidth
            className="justify-start rounded-none px-4"
            onClick={onReorderClick}
          >
            <Grip className="mr-2 h-5 w-5" /> Reordenar
          </Button>
          <Button
            variant="secondary"
            fullWidth
            className="justify-start rounded-none px-4"
            onClick={onReplaceExercise}
          >
            <Plus className="mr-2 h-5 w-5" /> Reemplazar ejercicio
          </Button>
          <Button
            variant="outline"
            fullWidth
            className="justify-start rounded-none px-4 text-red-500"
            onClick={onRemoveExercise}
          >
            <Trash2 className="mr-2 h-5 w-5" /> Eliminar ejercicio
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ExerciseOptionsSheet;
