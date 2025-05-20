
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Save, Plus } from "lucide-react";
import { Card, CardHeader, CardBody } from "../components/Card";
import Button from "@/components/Button";
import { useToast } from "@/hooks/use-toast";
import { RoutineExercise } from "@/features/workout/types";
import { useRoutineForm } from "@/features/workout/hooks/useRoutineForm";
import { saveRoutine } from "@/features/workout/services/routineService";
import RoutineForm from "@/features/workout/components/RoutineForm";
import ExerciseList from "@/features/workout/components/ExerciseList";
import ReorderSheet from "@/features/workout/components/ReorderSheet";
import ExerciseOptionsSheet from "@/features/workout/components/ExerciseOptionsSheet";
import { NoExercisesDialog, SaveConfirmDialog } from "@/features/workout/components/ConfirmationDialogs";

const CreateRoutinePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNoExercisesDialog, setShowNoExercisesDialog] = useState(false);
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false);
  const [showExerciseOptionsSheet, setShowExerciseOptionsSheet] = useState(false);
  const [showReorderSheet, setShowReorderSheet] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number | null>(null);
  
  // Initialize routine form with any exercises from location state
  const {
    routineName,
    setRoutineName,
    routineType,
    setRoutineType,
    routineExercises,
    setRoutineExercises,
    validationErrors,
    handleAddSet,
    handleSetUpdate,
    handleRemoveExercise,
    handleMoveExercise,
    validateForm
  } = useRoutineForm([]);

  // Load selected exercises from location state when available
  useEffect(() => {
    if (location.state && location.state.selectedExercises) {
      const exercises = location.state.selectedExercises.map((exercise: any) => ({
        ...exercise,
        sets: [{ reps_min: 8, reps_max: 12, rest_seconds: 60 }]
      }));
      setRoutineExercises(exercises);
    }
  }, [location.state, setRoutineExercises]);
  
  const handleSelectExercises = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    navigate("/workout/select-exercises");
  };

  const handleExerciseOptions = (index: number) => {
    setCurrentExerciseIndex(index);
    setShowExerciseOptionsSheet(true);
  };

  const handleReorderClick = () => {
    setShowReorderSheet(true);
  };

  const handleReorderSave = () => {
    setShowReorderSheet(false);
  };

  const handleSaveRoutineStart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    
    if (!validateForm()) {
      return;
    }
    
    if (routineExercises.length === 0) {
      setShowNoExercisesDialog(true);
      return;
    }
    
    setShowSaveConfirmDialog(true);
  };

  const handleSaveRoutine = async () => {
    setIsSubmitting(true);

    try {
      await saveRoutine(routineName, routineType, routineExercises);

      toast({
        title: "¡Rutina creada!",
        description: `La rutina ${routineName} ha sido guardada correctamente`,
      });

      navigate("/workout");
    } catch (error) {
      console.error("Error saving routine:", error);
      toast({
        title: "Error al guardar",
        description: "Ha ocurrido un error al guardar la rutina",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setShowSaveConfirmDialog(false);
    }
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Crear Rutina</h1>
        <Button 
          variant="primary" 
          size="sm"
          leftIcon={<Save className="h-4 w-4" />}
          onClick={handleSaveRoutineStart}
          disabled={isSubmitting}
          type="button"
        >
          Guardar
        </Button>
      </div>
      
      <div className="animate-fade-in">
        <Card>
          <CardHeader title="Crear Nueva Rutina" />
          <CardBody>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <RoutineForm
                routineName={routineName}
                routineType={routineType}
                validationErrors={validationErrors}
                onNameChange={setRoutineName}
                onTypeChange={setRoutineType}
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

      {/* Dialog Components */}
      <NoExercisesDialog 
        open={showNoExercisesDialog} 
        onOpenChange={setShowNoExercisesDialog}
        onConfirm={() => {
          setShowNoExercisesDialog(false);
          setShowSaveConfirmDialog(true);
        }} 
      />

      <SaveConfirmDialog 
        open={showSaveConfirmDialog} 
        onOpenChange={setShowSaveConfirmDialog}
        onConfirm={handleSaveRoutine}
        isSubmitting={isSubmitting}
      />

      {/* Sheet Components */}
      <ExerciseOptionsSheet
        open={showExerciseOptionsSheet}
        onOpenChange={setShowExerciseOptionsSheet}
        onReorderClick={() => {
          setShowExerciseOptionsSheet(false);
          setShowReorderSheet(true);
        }}
        onReplaceExercise={() => {
          setShowExerciseOptionsSheet(false);
          navigate("/workout/select-exercises");
        }}
        onRemoveExercise={() => {
          if (currentExerciseIndex !== null) {
            handleRemoveExercise(currentExerciseIndex);
            setShowExerciseOptionsSheet(false);
          }
        }}
      />

      <ReorderSheet
        open={showReorderSheet}
        exercises={routineExercises}
        onOpenChange={setShowReorderSheet}
        onMoveExercise={handleMoveExercise}
        onRemoveExercise={handleRemoveExercise}
        onSave={handleReorderSave}
      />
    </div>
  );
};

export default CreateRoutinePage;
