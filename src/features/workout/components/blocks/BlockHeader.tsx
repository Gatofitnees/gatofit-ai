import React from "react";
import { Button } from "@/components/ui/button";
import { MoreVertical, Plus } from "lucide-react";
import { WorkoutBlock, getBlockTypeName } from "../../types/blocks";

interface BlockHeaderProps {
  block: WorkoutBlock;
  exerciseCount: number;
  onAddExercises: (blockId: string) => void;
  onReorderClick?: () => void;
}

export const BlockHeader: React.FC<BlockHeaderProps> = ({
  block,
  exerciseCount,
  onAddExercises,
  onReorderClick,
}) => {
  return (
    <div className="flex items-center justify-between p-3 border-b border-border/50">
      <div className="flex items-center space-x-3">
        <div>
          <h3 className="font-medium text-sm">
            {getBlockTypeName(block.type)}
          </h3>
          <p className="text-xs text-muted-foreground">
            {exerciseCount} ejercicio{exerciseCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {exerciseCount > 0 && onReorderClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onReorderClick();
            }}
          >
            Ordenar
          </Button>
        )}
        <Button
          variant="outline" 
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            onAddExercises(block.id);
          }}
        >
          <Plus className="h-3 w-3 mr-1" />
          Ejercicios
        </Button>
      </div>
    </div>
  );
};