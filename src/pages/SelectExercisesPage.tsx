import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useExercises } from "@/hooks/workout/useExercises";
import { useToastHelper } from "@/hooks/useToastHelper";
import ExerciseFilterSheet from "@/components/workout/ExerciseFilterSheet";
import ExerciseSelectionHeader from "@/components/workout/ExerciseSelectionHeader";
import ExerciseListStats from "@/components/workout/ExerciseListStats";
import ExercisesList from "@/components/workout/ExercisesList";
import ExercisesFloatingButton from "@/components/workout/ExercisesFloatingButton";

interface LocationState {
  routineId?: number;
  routineName?: string;
}

const SelectExercisesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToastHelper();
  const state = location.state as LocationState || {};
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);
  const [muscleFilters, setMuscleFilters] = useState<string[]>([]);
  const [equipmentFilters, setEquipmentFilters] = useState<string[]>([]);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const { exercises, isLoading } = useExercises();
  
  // Ensure we have the routineId passed from previous screen
  useEffect(() => {
    console.log("Location state in SelectExercisesPage:", location.state);
    if (!state?.routineId) {
      toast.showError(
        "Error",
        "No se pudo identificar la rutina"
      );
      navigate("/workout");
    }
  }, []);

  // Extract unique muscle groups and equipment types for filters
  const muscleGroups = [...new Set(exercises.map(ex => ex.muscle_group_main).filter(Boolean))];
  const equipmentTypes = [...new Set(exercises.map(ex => ex.equipment_required).filter(Boolean))];

  // Filter exercises based on search term and filters
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (exercise.muscle_group_main && exercise.muscle_group_main.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesMuscle = muscleFilters.length === 0 || 
                         (exercise.muscle_group_main && muscleFilters.includes(exercise.muscle_group_main));
    
    const matchesEquipment = equipmentFilters.length === 0 || 
                           (exercise.equipment_required && equipmentFilters.includes(exercise.equipment_required));
    
    return matchesSearch && matchesMuscle && matchesEquipment;
  });

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
    navigate(`/workout/exercise-details/${id}`);
  };

  const handleAddExercises = () => {
    try {
      if (selectedExercises.length === 0) {
        toast.showError(
          "Sin ejercicios",
          "Selecciona al menos un ejercicio"
        );
        return;
      }
      
      // Get the full exercise objects for the selected IDs
      const selectedExercisesObjects = exercises.filter(ex => 
        selectedExercises.includes(ex.id)
      );
      
      console.log("Navigating back to create routine with:", {
        routineId: state.routineId,
        routineName: state.routineName,
        selectedExercises: selectedExercisesObjects
      });
      
      // Navigate back to create routine page with selected exercises
      navigate(`/workout/create`, { 
        state: { 
          routineId: state.routineId,
          routineName: state.routineName,
          selectedExercises: selectedExercisesObjects
        },
        replace: false
      });
      
    } catch (error) {
      console.error("Error adding exercises:", error);
      toast.showError(
        "Error", 
        "No se pudieron añadir los ejercicios"
      );
    }
  };

  const handleCreateExercise = () => {
    navigate("/workout/create-exercise", { 
      state: { 
        returnTo: "select-exercises",
        routineId: state?.routineId,
        routineName: state?.routineName
      }
    });
  };

  const handleBackNavigation = () => {
    navigate("/workout/create", { 
      state: { 
        routineId: state?.routineId,
        routineName: state?.routineName
      } 
    });
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto">
      {/* Header Component */}
      <ExerciseSelectionHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onBackClick={handleBackNavigation}
        onFilterClick={() => setIsFilterSheetOpen(true)}
        routineId={state?.routineId}
        routineName={state?.routineName}
      />

      {/* Exercise List */}
      <div className="p-4">
        {/* Stats and Create Button */}
        <ExerciseListStats
          exerciseCount={filteredExercises.length}
          onCreateExercise={handleCreateExercise}
        />

        {/* Exercises List */}
        <ExercisesList
          exercises={filteredExercises}
          selectedExercises={selectedExercises}
          onToggleSelect={handleExerciseSelect}
          onViewDetails={handleExerciseDetails}
          isLoading={isLoading}
        />
      </div>

      {/* Floating Action Button */}
      <ExercisesFloatingButton
        selectedCount={selectedExercises.length}
        onAddExercises={handleAddExercises}
      />

      {/* Filter Sheet */}
      <ExerciseFilterSheet
        open={isFilterSheetOpen}
        onOpenChange={setIsFilterSheetOpen}
        muscleGroups={muscleGroups}
        equipmentTypes={equipmentTypes}
        muscleFilters={muscleFilters}
        equipmentFilters={equipmentFilters}
        onMuscleFilterToggle={handleMuscleFilterToggle}
        onEquipmentFilterToggle={handleEquipmentFilterToggle}
      />
    </div>
  );
};

export default SelectExercisesPage;
