
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import ConfigHeader from "@/features/workout/exercise-configuration/components/ConfigHeader";
import ExerciseConfigCard from "@/features/workout/exercise-configuration/components/ExerciseConfigCard";
import SaveRoutineDialog from "@/features/workout/exercise-configuration/components/SaveRoutineDialog";
import { useExerciseConfiguration } from "@/features/workout/exercise-configuration/hooks/useExerciseConfiguration";
import { Exercise } from "@/features/workout/exercise-selection/types";
import { ConfiguredExercise } from "@/features/workout/exercise-configuration/types";

const ConfigureRoutineExercisesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedExercises = [], routineFormData = {} } = location.state || {};

  // Convert selected exercises to ConfiguredExercise format
  const initialConfiguredExercises: ConfiguredExercise[] = selectedExercises.map((ex: Exercise) => ({
    ...ex,
    sets: 3,
    reps_min: 8,
    reps_max: 12,
    rest_seconds: 60,
    notes: "",
    is_time_based: false,
  }));

  // Use the configuration hook
  const {
    exercises,
    updateExercise,
    handleRemoveExercise,
    isSaving,
    showConfirmDialog,
    setShowConfirmDialog,
    saveRoutine,
    calculateTotalDuration
  } = useExerciseConfiguration(initialConfiguredExercises, routineFormData);

  const handleSave = async () => {
    const success = await saveRoutine();
    if (success) {
      setShowConfirmDialog(false);
      navigate("/workout");
    }
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto">
      {/* Header */}
      <ConfigHeader 
        title="Configurar Ejercicios"
        subtitle={routineFormData.name || "Nueva Rutina"}
        onBack={() => navigate(-1)}
        onSave={() => setShowConfirmDialog(true)}
      />

      {/* Exercise configuration list */}
      <div className="p-4">
        {exercises.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No hay ejercicios seleccionados</p>
            <Button 
              variant="secondary"
              onClick={() => navigate("/workout/select-exercises", { state: { routineFormData } })}
            >
              Añadir Ejercicios
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <ExerciseConfigCard
                key={`${exercise.id}-${index}`}
                exercise={exercise}
                index={index}
                onUpdate={updateExercise}
                onRemove={handleRemoveExercise}
              />
            ))}

            <Button
              variant="secondary"
              fullWidth
              className="mt-4"
              onClick={() => navigate("/workout/select-exercises", { 
                state: { 
                  routineFormData,
                  previouslySelected: exercises
                } 
              })}
            >
              Añadir Más Ejercicios
            </Button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <SaveRoutineDialog 
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        routineName={routineFormData.name || "Nueva Rutina"}
        exerciseCount={exercises.length}
        estimatedDuration={calculateTotalDuration()}
        onConfirm={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
};

export default ConfigureRoutineExercisesPage;
