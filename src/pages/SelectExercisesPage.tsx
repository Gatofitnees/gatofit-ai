
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/features/workout/exercise-selection/components/Header";
import ExerciseList from "@/features/workout/exercise-selection/components/ExerciseList";
import FilterSheet from "@/features/workout/exercise-selection/components/FilterSheet";
import CreateExerciseButton from "@/features/workout/exercise-selection/components/CreateExerciseButton";
import FloatingActionButton from "@/features/workout/exercise-selection/components/FloatingActionButton";
import { useExercises } from "@/features/workout/exercise-selection/hooks/useExercises";
import { useExerciseSelection } from "@/features/workout/exercise-selection/hooks/useExerciseSelection";
import { RoutineFormData } from "@/features/workout/exercise-selection/types";
import { toast } from "@/hooks/use-toast";

const SelectExercisesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const routineFormData = location.state?.routineFormData as RoutineFormData;
  
  // Check if we have the required data
  useEffect(() => {
    if (!routineFormData || !routineFormData.name) {
      toast.error("Información de rutina incompleta");
      navigate('/workout');
      return;
    }
  }, [routineFormData, navigate]);

  const { exercises, loading } = useExercises();
  
  const {
    searchTerm,
    setSearchTerm,
    selectedExercises,
    filteredExercises,
    muscleFilters,
    equipmentFilters,
    muscleGroups,
    equipmentTypes,
    isFilterSheetOpen,
    setIsFilterSheetOpen,
    handleExerciseSelect,
    handleMuscleFilterToggle,
    handleEquipmentFilterToggle
  } = useExerciseSelection(exercises);

  const handleExerciseDetails = (id: number) => {
    navigate(`/workout/exercise-details/${id}`);
  };

  const handleAddExercises = () => {
    if (selectedExercises.length === 0) {
      toast.error("Por favor, selecciona al menos un ejercicio");
      return;
    }

    // Get the selected exercises data
    const selectedExercisesData = exercises.filter(ex => selectedExercises.includes(ex.id));
    
    // Navigate to configure routine exercises with the selected exercises and form data
    navigate('/workout/configure-routine-exercises', { 
      state: { 
        selectedExercises: selectedExercisesData,
        routineFormData
      } 
    });
  };

  const handleCreateExercise = () => {
    navigate("/workout/create-exercise");
  };

  // If there's no valid state data, show nothing while redirecting
  if (!routineFormData) {
    return null;
  }

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto">
      {/* Header */}
      <Header
        onBack={() => navigate(-1)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenFilters={() => setIsFilterSheetOpen(true)}
      />

      {/* Exercise List */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">
            {filteredExercises.length} ejercicios encontrados
          </span>
          <CreateExerciseButton onClick={handleCreateExercise} />
        </div>

        <ExerciseList
          exercises={filteredExercises}
          selectedExercises={selectedExercises}
          loading={loading}
          onExerciseSelect={handleExerciseSelect}
          onExerciseDetails={handleExerciseDetails}
        />
      </div>

      {/* Filter Sheet */}
      <FilterSheet
        isOpen={isFilterSheetOpen}
        onOpenChange={setIsFilterSheetOpen}
        muscleFilters={muscleFilters}
        equipmentFilters={equipmentFilters}
        onMuscleFilterToggle={handleMuscleFilterToggle}
        onEquipmentFilterToggle={handleEquipmentFilterToggle}
        muscleGroups={muscleGroups}
        equipmentTypes={equipmentTypes}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        selectedCount={selectedExercises.length}
        onClick={handleAddExercises}
      />
    </div>
  );
};

export default SelectExercisesPage;
