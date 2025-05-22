
import React, { useEffect } from "react";
import ExerciseList from "@/components/exercise/ExerciseList";
import ExerciseSelectionHeader from "@/features/workout/components/exercise-selection/ExerciseSelectionHeader";
import ExerciseListActions from "@/features/workout/components/exercise-selection/ExerciseListActions";
import SelectionFloatingButton from "@/features/workout/components/exercise-selection/SelectionFloatingButton";
import { useExerciseSelection } from "@/features/workout/hooks/useExerciseSelection";
import { useLocation } from "react-router-dom";

const SelectExercisesPage: React.FC = () => {
  const location = useLocation();
  
  const {
    filteredExercises,
    selectedExercises,
    muscleGroups,
    equipmentTypes,
    muscleFilters,
    equipmentFilters,
    searchTerm,
    loading,
    previouslySelectedIds,
    setSearchTerm,
    setPreviouslySelectedIds,
    handleExerciseSelect,
    handleMuscleFilterToggle,
    handleEquipmentFilterToggle,
    handleExerciseDetails,
    handleNavigateBack,
    handleCreateExercise,
    handleAddExercises
  } = useExerciseSelection();
  
  // Effect to set previously selected IDs from location state
  useEffect(() => {
    if (location.state && location.state.currentExercises) {
      const existingIds = location.state.currentExercises.map((ex: any) => ex.id);
      setPreviouslySelectedIds(existingIds);
      console.log("Previously selected exercise IDs set from state:", existingIds);
    }
  }, [location.state, setPreviouslySelectedIds]);

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto">
      {/* Header with Search and Filters */}
      <ExerciseSelectionHeader 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        muscleGroups={muscleGroups}
        equipmentTypes={equipmentTypes}
        muscleFilters={muscleFilters}
        equipmentFilters={equipmentFilters}
        onMuscleFilterToggle={handleMuscleFilterToggle}
        onEquipmentFilterToggle={handleEquipmentFilterToggle}
        onNavigateBack={handleNavigateBack}
      />

      {/* Exercise List with Actions */}
      <div className="p-4">
        <ExerciseListActions 
          exerciseCount={filteredExercises.length}
          onCreateExercise={handleCreateExercise}
        />

        <ExerciseList 
          exercises={filteredExercises}
          selectedExercises={selectedExercises}
          onSelectExercise={handleExerciseSelect}
          onViewDetails={handleExerciseDetails}
          loading={loading}
          previouslySelectedIds={previouslySelectedIds}
        />
      </div>

      {/* Floating Button for Selected Exercises */}
      <SelectionFloatingButton 
        selectedCount={selectedExercises.length}
        onAddExercises={handleAddExercises}
      />
    </div>
  );
};

export default SelectExercisesPage;
