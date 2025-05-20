
import React from "react";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/Card";
import Button from "@/components/Button";
import { RoutineExercise } from "../types";
import RoutineForm from "./RoutineForm";
import ExerciseList from "./ExerciseList";

interface RoutineFormContainerProps {
  routineName: string;
  routineType: string;
  routineExercises: RoutineExercise[];
  validationErrors: {
    name: boolean;
    type: boolean;
  };
  onNameChange: (name: string) => void;
  onTypeChange: (type: string) => void;
  handleAddSet: (index: number) => void;
  handleSetUpdate: (exerciseIndex: number, setIndex: number, field: string, value: number) => void;
  handleExerciseOptions: (index: number) => void;
  handleReorderClick: () => void;
  handleSelectExercises: (e: React.MouseEvent) => void; // Update function signature to match
}

const RoutineFormContainer: React.FC<RoutineFormContainerProps> = ({
  routineName,
  routineType,
  routineExercises,
  validationErrors,
  onNameChange,
  onTypeChange,
  handleAddSet,
  handleSetUpdate,
  handleExerciseOptions,
  handleReorderClick,
  handleSelectExercises,
}) => {
  return (
    <div className="animate-fade-in">
      <Card>
        <CardHeader title="Crear Nueva Rutina" />
        <CardBody>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <RoutineForm
              routineName={routineName}
              routineType={routineType}
              validationErrors={validationErrors}
              onNameChange={onNameChange}
              onTypeChange={onTypeChange}
            />
            
            <ExerciseList
              exercises={routineExercises}
              onAddSet={handleAddSet}
              onSetUpdate={handleSetUpdate}
              onExerciseOptions={handleExerciseOptions}
              onReorderClick={handleReorderClick}
            />
            
            <div className="pt-2">
              <Button 
                variant={routineExercises.length > 0 ? "secondary" : "primary"}
                fullWidth 
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={handleSelectExercises}
                type="button"
              >
                {routineExercises.length > 0 ? 'Añadir más ejercicios' : 'Añadir Ejercicios'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default RoutineFormContainer;
