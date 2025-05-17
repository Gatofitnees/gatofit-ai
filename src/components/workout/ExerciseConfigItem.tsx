
import React from "react";
import { Exercise } from "@/hooks/workout/useExercises";
import ExerciseListItem from "@/components/workout/ExerciseListItem";
import { Card, CardBody } from "@/components/Card";

interface ExerciseConfigItemProps {
  exercise: Exercise;
  config: {
    sets: number;
    repsMin: number;
    repsMax: number;
    restSeconds: number;
  };
  onConfigChange: (exerciseId: number, field: string, value: number) => void;
  onViewDetails: (id: number) => void;
}

const ExerciseConfigItem: React.FC<ExerciseConfigItemProps> = ({
  exercise,
  config,
  onConfigChange,
  onViewDetails
}) => {
  return (
    <Card className="hover:scale-[1.01] transition-transform duration-300">
      <CardBody>
        <div className="mb-2">
          <ExerciseListItem
            exercise={exercise}
            isSelected={false}
            onToggleSelect={() => {}}
            onViewDetails={onViewDetails}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Series</label>
            <input
              type="number"
              min="1"
              value={config.sets}
              onChange={(e) => onConfigChange(
                exercise.id, 
                'sets', 
                parseInt(e.target.value) || 1
              )}
              className="w-full h-8 rounded-lg px-3 bg-secondary border-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1">Descanso (seg)</label>
            <input
              type="number"
              min="5"
              step="5"
              value={config.restSeconds}
              onChange={(e) => onConfigChange(
                exercise.id, 
                'restSeconds', 
                parseInt(e.target.value) || 60
              )}
              className="w-full h-8 rounded-lg px-3 bg-secondary border-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1">Reps. Min</label>
            <input
              type="number"
              min="1"
              value={config.repsMin}
              onChange={(e) => onConfigChange(
                exercise.id, 
                'repsMin', 
                parseInt(e.target.value) || 1
              )}
              className="w-full h-8 rounded-lg px-3 bg-secondary border-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1">Reps. Max</label>
            <input
              type="number"
              min="1"
              value={config.repsMax}
              onChange={(e) => onConfigChange(
                exercise.id, 
                'repsMax', 
                parseInt(e.target.value) || 1
              )}
              className="w-full h-8 rounded-lg px-3 bg-secondary border-none text-sm"
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ExerciseConfigItem;
