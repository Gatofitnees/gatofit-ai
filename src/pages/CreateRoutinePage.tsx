
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RoutinePageHeader from "@/features/workout/components/RoutinePageHeader";
import RoutineFormContainer from "@/features/workout/components/RoutineFormContainer";
import RoutineDialogs from "@/features/workout/components/dialogs/RoutineDialogs";
import RoutineSheets from "@/features/workout/components/sheets/RoutineSheets";
import { useCreateRoutine } from "@/features/workout/hooks/useCreateRoutine";
import { useToast } from "@/hooks/use-toast";
import { LoadingSkeleton } from "@/features/workout/components/active-workout/LoadingSkeleton";

const CreateRoutinePage: React.FC = () => {
  const { toast } = useToast();
  const { routineId } = useParams<{ routineId?: string }>();
  const isEditing = !!routineId;
  
  // Estado local para controlar la carga inicial
  const [isInitialLoading, setIsInitialLoading] = useState(isEditing);
  
  const {
    // State
    routineName,
    routineType,
    routineExercises,
    validationErrors,
    isSubmitting,
    showNoExercisesDialog,
    showSaveConfirmDialog,
    showDiscardChangesDialog,
    showExerciseOptionsSheet,
    showReorderSheet,
    currentExerciseIndex,
    
    // State setters
    setRoutineName,
    setRoutineType,
    setShowNoExercisesDialog,
    setShowSaveConfirmDialog,
    setShowDiscardChangesDialog,
    setShowExerciseOptionsSheet,
    setShowReorderSheet,
    
    // Handlers
    handleAddSet,
    handleSetUpdate,
    handleRemoveExercise,
    handleMoveExercise,
    handleSelectExercises,
    handleExerciseOptions,
    handleReorderClick,
    handleReorderSave,
    handleSaveRoutineStart,
    handleSaveRoutine,
    handleDiscardChanges,
    handleBackClick,
    
    // Loading/Editing state
    loadRoutineData,
    isLoading
  } = useCreateRoutine([], isEditing ? parseInt(routineId) : undefined);
  
  // Cargar datos de la rutina si estamos en modo edición
  useEffect(() => {
    const loadData = async () => {
      if (isEditing && routineId) {
        try {
          await loadRoutineData(parseInt(routineId));
        } finally {
          // Asegurar que el loading se desactive después de cargar los datos
          setIsInitialLoading(false);
        }
      }
    };
    
    loadData();
  }, [isEditing, routineId, loadRoutineData]);
  
  // Add a beforeUnload event handler to warn about unsaved changes
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (routineName || routineType || routineExercises.length > 0) {
        const message = "¿Está seguro que desea salir? Los cambios no guardados se perderán.";
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [routineName, routineType, routineExercises]);
  
  // Mostrar loader si está cargando datos para edición o en estado inicial de carga
  if ((isEditing && isLoading) || isInitialLoading) {
    return <LoadingSkeleton onBack={handleBackClick} />;
  }
  
  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <RoutinePageHeader 
        onSaveClick={handleSaveRoutineStart}
        onBackClick={handleBackClick}
        isSubmitting={isSubmitting} 
        isEditing={isEditing}
      />
      
      <RoutineFormContainer
        routineName={routineName}
        routineType={routineType}
        routineExercises={routineExercises}
        validationErrors={validationErrors}
        onNameChange={setRoutineName}
        onTypeChange={setRoutineType}
        handleAddSet={handleAddSet}
        handleSetUpdate={handleSetUpdate}
        handleExerciseOptions={handleExerciseOptions}
        handleReorderClick={handleReorderClick}
        handleSelectExercises={handleSelectExercises}
        isEditing={isEditing}
      />

      {/* Dialog Components */}
      <RoutineDialogs
        showNoExercisesDialog={showNoExercisesDialog}
        setShowNoExercisesDialog={setShowNoExercisesDialog}
        showSaveConfirmDialog={showSaveConfirmDialog}
        setShowSaveConfirmDialog={setShowSaveConfirmDialog}
        showDiscardChangesDialog={showDiscardChangesDialog}
        setShowDiscardChangesDialog={setShowDiscardChangesDialog}
        handleSaveRoutine={handleSaveRoutine}
        handleDiscardChanges={handleDiscardChanges}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
      />

      {/* Sheet Components */}
      <RoutineSheets
        showExerciseOptionsSheet={showExerciseOptionsSheet}
        setShowExerciseOptionsSheet={setShowExerciseOptionsSheet}
        showReorderSheet={showReorderSheet}
        setShowReorderSheet={setShowReorderSheet}
        currentExerciseIndex={currentExerciseIndex}
        handleRemoveExercise={handleRemoveExercise}
        handleMoveExercise={handleMoveExercise}
        routineExercises={routineExercises}
        navigateToSelectExercises={handleSelectExercises}
        handleReorderSave={handleReorderSave}
      />
    </div>
  );
};

export default CreateRoutinePage;
