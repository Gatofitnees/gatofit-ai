
import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import Button from "@/components/Button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { RoutineExercise } from "../types";

interface ReorderSheetProps {
  open: boolean;
  exercises: RoutineExercise[];
  onOpenChange: (open: boolean) => void;
  onMoveExercise: (fromIndex: number, toIndex: number) => void;
  onRemoveExercise: (index: number) => void;
  onSave: () => void;
}

const ReorderSheet: React.FC<ReorderSheetProps> = ({
  open,
  exercises,
  onOpenChange,
  onMoveExercise,
  onRemoveExercise,
  onSave
}) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    
    // Move exercise
    onMoveExercise(dragIndex, index);
    setDragIndex(index);
  };
  
  const handleDragEnd = () => {
    setDragIndex(null);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="px-0 sm:max-w-md w-full">
        <SheetHeader className="text-left px-4">
          <SheetTitle>Reordenar ejercicios</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <div className="space-y-2">
            {exercises.map((exercise, index) => (
              <div 
                key={`reorder-${exercise.id}-${index}`} 
                className={`flex items-center px-4 py-3 bg-secondary/40 rounded-md cursor-move ${dragIndex === index ? 'scale-105 shadow-lg' : ''}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                style={{ transition: 'transform 0.15s ease-in-out' }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2 p-1 min-w-0"
                  onClick={(e) => {
                    e.preventDefault();
                    onRemoveExercise(index);
                  }}
                  type="button"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{exercise.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
        <SheetFooter className="px-4">
          <Button variant="primary" onClick={onSave} type="button">Guardar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ReorderSheet;
