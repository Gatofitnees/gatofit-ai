
import React from "react";
import { useNavigate } from "react-router-dom";
import { useExercises } from "@/hooks/useExercises";
import ExerciseList from "@/components/exercise/ExerciseList";
import { useExerciseSelection } from "@/features/workout/hooks/useExerciseSelection";
import { useFilteredExercises } from "@/features/workout/hooks/useFilteredExercises";
import ExerciseSelectionHeader from "@/features/workout/components/ExerciseSelectionHeader";
import ExerciseSelectionActions from "@/features/workout/components/ExerciseSelectionActions";

const SelectExercisesPage: React.FC = () => {
  const navigate = useNavigate();
  const { exercises, loading, muscleGroups, equipmentTypes } = useExercises();
  
  const {
    searchTerm,
    setSearchTerm,
    selectedExercises,
    setSelectedExercises,
    muscleFilters,
    setMuscleFilters,
    equipmentFilters,
    setEquipmentFilters,
    resetSessionStorage
  } = useExerciseSelection();
  
  const filteredExercises = useFilteredExercises(
    exercises, 
    searchTerm, 
    muscleFilters, 
    equipmentFilters
  );

  const handleExerciseSelect = (id: number) => {
    if (selectedExercises.includes(id)) {
      setSelectedExercises(selectedExercises.filter(exId => exId !== id));
    } else {
      setSelectedExercises([...selectedExercises, id]);
    }
  };

  const handleMuscleFilterToggle = (muscle: string) => {
    if (muscleFilters.includes(muscle)) {
      setMuscleFilters(muscleFilters.filter(m => m !== muscle));
    } else {
      setMuscleFilters([...muscleFilters, muscle]);
    }
  };

  const handleEquipmentFilterToggle = (equipment: string) => {
    if (equipmentFilters.includes(equipment)) {
      setEquipmentFilters(equipmentFilters.filter(e => e !== equipment));
    } else {
      setEquipmentFilters([...equipmentFilters, equipment]);
    }
  };

  const handleExerciseDetails = (id: number) => {
    // Navigate to the exercise details page
    navigate(`/workout/exercise-details/${id}`);
  };

  const handleAddExercises = () => {
    // Get the selected exercise objects
    const selectedExerciseObjects = exercises.filter(exercise => 
      selectedExercises.includes(exercise.id)
    );
    
    // Clear all state from session storage before navigating
    resetSessionStorage();
    
    // Navigate back to create routine with the selected exercises
    navigate("/workout/create", { 
      state: { selectedExercises: selectedExerciseObjects } 
    });
  };

  const handleCreateExercise = () => {
    navigate("/workout/create-exercise");
  };

  // Reset filters and selections when navigating back
  const handleNavigateBack = () => {
    resetSessionStorage();
    navigate("/workout/create");
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto">
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

      {/* Exercise List and Actions */}
      <div className="p-4">
        <ExerciseSelectionActions
          filteredExercisesCount={filteredExercises.length}
          onCreateExercise={handleCreateExercise}
          selectedCount={selectedExercises.length}
          onAddExercises={handleAddExercises}
        />

        <ExerciseList 
          exercises={filteredExercises}
          selectedExercises={selectedExercises}
          onSelectExercise={handleExerciseSelect}
          onViewDetails={handleExerciseDetails}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default SelectExercisesPage;
