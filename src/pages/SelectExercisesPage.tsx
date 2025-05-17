
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Filter, Plus } from "lucide-react";
import { Card, CardBody } from "@/components/Card";
import Button from "@/components/Button";
import ExerciseListItem from "@/components/workout/ExerciseListItem";
import ExerciseFilterSheet from "@/components/workout/ExerciseFilterSheet";
import ExerciseSearchBar from "@/components/workout/ExerciseSearchBar";
import { useExercises, Exercise } from "@/hooks/workout/useExercises";
import { useToastHelper } from "@/hooks/useToastHelper";

interface LocationState {
  routineId: number;
  routineName: string;
}

const SelectExercisesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToastHelper();
  const state = location.state as LocationState;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);
  const [muscleFilters, setMuscleFilters] = useState<string[]>([]);
  const [equipmentFilters, setEquipmentFilters] = useState<string[]>([]);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const { exercises, isLoading } = useExercises();
  
  // Ensure we have the routineId passed from previous screen
  useEffect(() => {
    console.log("Location state:", location.state);
    if (!state?.routineId) {
      toast.showError(
        "Error",
        "No se pudo identificar la rutina"
      );
      navigate("/workout");
    }
  }, [state, navigate, toast, location.state]);

  // Extract unique muscle groups and equipment types for filters
  const muscleGroups = [...new Set(exercises.map(ex => ex.muscle_group_main).filter(Boolean))];
  const equipmentTypes = [...new Set(exercises.map(ex => ex.equipment_required).filter(Boolean))];

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
      
      // Navigate back to create routine page with selected exercises
      navigate(`/workout/create`, { 
        state: { 
          routineId: state.routineId,
          routineName: state.routineName,
          selectedExercises: selectedExercisesObjects
        } 
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

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background p-4 border-b border-muted/20">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => navigate("/workout/create", { 
              state: { 
                routineId: state?.routineId,
                routineName: state?.routineName
              } 
            })}
            className="mr-3 p-1 rounded-full hover:bg-secondary/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Seleccionar Ejercicios</h1>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-2">
          <ExerciseSearchBar 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <Button 
            variant="secondary"
            size="sm"
            leftIcon={<Filter className="h-4 w-4" />}
            onClick={() => setIsFilterSheetOpen(true)}
          >
            Filtrar
          </Button>
        </div>
      </div>

      {/* Exercise List */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">
            {filteredExercises.length} ejercicios encontrados
          </span>
          <Button 
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={handleCreateExercise}
          >
            Crear Ejercicio
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <p>Cargando ejercicios...</p>
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No se encontraron ejercicios</p>
            <p className="text-sm mt-2">Intenta con otra búsqueda o añade uno nuevo</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExercises.map(exercise => (
              <Card key={exercise.id} className="hover:scale-[1.01] transition-transform duration-300">
                <CardBody>
                  <ExerciseListItem
                    exercise={exercise}
                    isSelected={selectedExercises.includes(exercise.id)}
                    onToggleSelect={handleExerciseSelect}
                    onViewDetails={handleExerciseDetails}
                  />
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Selected Exercises Floating Button */}
      {selectedExercises.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-4 flex justify-center">
          <Button
            variant="primary"
            className="shadow-neu-float px-6"
            onClick={handleAddExercises}
          >
            Añadir {selectedExercises.length} ejercicios
          </Button>
        </div>
      )}

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
