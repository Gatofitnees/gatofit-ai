
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
  
  // Para edición, siempre empezamos cargando. Para creación, nunca cargamos inicialmente.
  const [isDataLoaded, setIsDataLoaded] = useState(!isEditing);
  
  const {
    // State
    routineName,
    routineType,
    routineExercises,
    workoutBlocks,
    validationErrors,
    isSubmitting,
    showNoExercisesDialog,
    showSaveConfirmDialog,
    showDiscardChangesDialog,
    showExerciseOptionsSheet,
    showReorderSheet,
    showBlockTypeSelector,
    currentExerciseIndex,
    hasBlocks,
    
    // State setters
    setRoutineName,
    setRoutineType,
    setShowNoExercisesDialog,
    setShowSaveConfirmDialog,
    setShowDiscardChangesDialog,
    setShowExerciseOptionsSheet,
    setShowReorderSheet,
    setShowBlockTypeSelector,
    
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
    
    // Block handlers
    handleAddBlock,
    handleBlockTypeSelect,
    handleAddExercisesToBlock,
    handleReorderBlock,
    getUnblockedExercises,
    
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
        } catch (error) {
          console.error("Error loading routine data:", error);
        } finally {
          // Marcar como cargado cuando termina la carga (exitosa o con error)
          setIsDataLoaded(true);
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
  
  // Mostrar loading skeleton hasta que los datos estén completamente cargados
  if (!isDataLoaded) {
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
        workoutBlocks={workoutBlocks}
        hasBlocks={hasBlocks}
        validationErrors={validationErrors}
        showBlockTypeSelector={showBlockTypeSelector}
        onNameChange={setRoutineName}
        onTypeChange={setRoutineType}
        handleAddSet={handleAddSet}
        handleSetUpdate={handleSetUpdate}
        handleExerciseOptions={handleExerciseOptions}
        handleReorderClick={handleReorderClick}
        handleSelectExercises={handleSelectExercises}
        handleAddBlock={handleAddBlock}
        handleBlockTypeSelect={handleBlockTypeSelect}
        handleAddExercisesToBlock={handleAddExercisesToBlock}
        handleReorderBlock={handleReorderBlock}
        setShowBlockTypeSelector={setShowBlockTypeSelector}
        getUnblockedExercises={getUnblockedExercises}
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
