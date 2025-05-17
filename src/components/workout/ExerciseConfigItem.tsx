
import React from "react";
import { Exercise } from "@/hooks/workout/useExercises";
import ExerciseListItem from "@/components/workout/ExerciseListItem";
import { Card, CardBody } from "@/components/Card";
import ConfigInput from "@/components/workout/ConfigInput";

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
  // Helper function to create onChange handlers for each config field
  const createChangeHandler = (field: string) => (value: number) => {
    onConfigChange(exercise.id, field, value);
  };

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
          <ConfigInput
            label="Series"
            value={config.sets}
            min={1}
            onChange={createChangeHandler('sets')}
          />
          
          <ConfigInput
            label="Descanso (seg)"
            value={config.restSeconds}
            min={5}
            step={5}
            onChange={createChangeHandler('restSeconds')}
          />
          
          <ConfigInput
            label="Reps. Min"
            value={config.repsMin}
            min={1}
            onChange={createChangeHandler('repsMin')}
          />
          
          <ConfigInput
            label="Reps. Max"
            value={config.repsMax}
            min={1}
            onChange={createChangeHandler('repsMax')}
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default ExerciseConfigItem;
