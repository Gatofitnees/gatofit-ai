
import React from "react";
import ExerciseList from "@/components/exercise/ExerciseList";
import ExerciseSelectionHeader from "@/features/workout/components/exercise-selection/ExerciseSelectionHeader";
import ExerciseListActions from "@/features/workout/components/exercise-selection/ExerciseListActions";
import SelectionFloatingButton from "@/features/workout/components/exercise-selection/SelectionFloatingButton";
import { useExerciseSelection } from "@/features/workout/hooks/useExerciseSelection";

const SelectExercisesPage: React.FC = () => {
  const {
    filteredExercises,
    selectedExercises,
    muscleGroups,
    equipmentTypes,
    muscleFilters,
    equipmentFilters,
    searchTerm,
    loading,
    setSearchTerm,
    handleExerciseSelect,
    handleMuscleFilterToggle,
    handleEquipmentFilterToggle,
    handleExerciseDetails,
    handleNavigateBack,
    handleCreateExercise,
    handleAddExercises
  } = useExerciseSelection();

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
