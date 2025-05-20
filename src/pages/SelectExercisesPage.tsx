import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import Button from "@/components/Button";
import { useExercises } from "@/hooks/useExercises";
import ExerciseSearch from "@/components/exercise/ExerciseSearch";
import ExerciseFilters from "@/components/exercise/ExerciseFilters";
import ExerciseList from "@/components/exercise/ExerciseList";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Define state types for sessionStorage
interface SelectExercisesState {
  selectedExercises: number[];
  searchTerm: string;
  muscleFilters: string[];
  equipmentFilters: string[];
  fromDetailsPage?: boolean;
}

const SESSION_STORAGE_KEY = "selectExercisesState";
const ROUTINE_SESSION_KEY = "currentRoutineData";

const SelectExercisesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { exercises, loading, muscleGroups, equipmentTypes } = useExercises();
  
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  
  // Initialize state from session storage or with defaults
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);
  const [muscleFilters, setMuscleFilters] = useState<string[]>([]);
  const [equipmentFilters, setEquipmentFilters] = useState<string[]>([]);
  
  // Check if we're coming back from exercise details page
  const fromDetails = location.state?.fromDetails || false;
  
  // Load state from sessionStorage on component mount
  useEffect(() => {
    const savedState = sessionStorage.getItem(SESSION_STORAGE_KEY);
    
    if (savedState) {
      const parsedState = JSON.parse(savedState) as SelectExercisesState;
      
      // If we're coming from details page, keep the selected exercises
      // Otherwise reset them (but keep other filters)
      if (fromDetails) {
        setSelectedExercises(parsedState.selectedExercises || []);
      } else {
        setSelectedExercises([]);
      }
      
      setSearchTerm(parsedState.searchTerm || "");
      setMuscleFilters(parsedState.muscleFilters || []);
      setEquipmentFilters(parsedState.equipmentFilters || []);
    }
  }, [fromDetails]);
  
  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    const stateToSave: SelectExercisesState = {
      selectedExercises,
      searchTerm,
      muscleFilters,
      equipmentFilters,
      fromDetailsPage: false
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [selectedExercises, searchTerm, muscleFilters, equipmentFilters]);

  // Filter exercises based on search term and selected filters
  const filteredExercises = exercises.filter(exercise => {
    // Search term filter (name or muscle group)
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (exercise.muscle_group_main?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    // Muscle filter - check if any of the selected muscle filters match any of the muscles in the exercise
    let matchesMuscle = true;
    if (muscleFilters.length > 0) {
      const exerciseMuscles = exercise.muscle_group_main ? exercise.muscle_group_main.split(" ").map(m => m.trim()) : [];
      matchesMuscle = muscleFilters.some(filter => 
        exerciseMuscles.some(muscle => muscle === filter)
      );
    }
    
    // Equipment filter - check if any of the selected equipment types match any of the equipment in the exercise
    let matchesEquipment = true;
    if (equipmentFilters.length > 0) {
      const exerciseEquipment = exercise.equipment_required ? exercise.equipment_required.split(" ").map(e => e.trim()) : [];
      matchesEquipment = equipmentFilters.some(filter => 
        exerciseEquipment.some(equipment => equipment === filter)
      );
    }
    
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
    // Mark in session storage that we're going to details page so we keep selections
    const stateToSave = {
      selectedExercises,
      searchTerm,
      muscleFilters,
      equipmentFilters,
      fromDetailsPage: true
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
    
    // Navigate to the exercise details page
    navigate(`/workout/exercise-details/${id}`, { 
      state: { fromSelectExercises: true } 
    });
  };

  const handleAddExercises = () => {
    setShowSaveConfirmation(true);
  };

  const confirmAddExercises = () => {
    // Get the selected exercise objects
    const selectedExerciseObjects = exercises.filter(exercise => 
      selectedExercises.includes(exercise.id)
    );
    
    // Load existing routine data if any
    const routineData = sessionStorage.getItem(ROUTINE_SESSION_KEY);
    let routineName = "";
    let routineType = "";
    
    if (routineData) {
      const parsedData = JSON.parse(routineData);
      routineName = parsedData.routineName || "";
      routineType = parsedData.routineType || "";
    }
    
    // Clear selection state but keep filter preferences
    const resetState = {
      selectedExercises: [],
      searchTerm,
      muscleFilters,
      equipmentFilters
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(resetState));
    
    // Navigate back to create routine with the selected exercises
    navigate("/workout/create", { 
      state: { selectedExercises: selectedExerciseObjects } 
    });
    
    // Show success toast
    toast({
      title: "Ejercicios añadidos",
      description: `${selectedExerciseObjects.length} ejercicios añadidos a la rutina`,
      variant: "success"
    });
  };

  const handleCreateExercise = () => {
    navigate("/workout/create-exercise");
  };
  
  // Reset filters and selections when navigating back
  const handleNavigateBack = () => {
    // Check if we have routine data to go back to
    const routineData = sessionStorage.getItem(ROUTINE_SESSION_KEY);
    
    // If we have routine data, go back to create routine page
    if (routineData) {
      navigate("/workout/create");
    } else {
      // Otherwise go to workout page
      navigate("/workout");
    }
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background p-4 border-b border-muted/20">
        <div className="flex items-center mb-4">
          <button 
            onClick={handleNavigateBack}
            className="mr-3 p-1 rounded-full hover:bg-secondary/50"
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Seleccionar Ejercicios</h1>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-2">
          <ExerciseSearch 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
          <ExerciseFilters 
            muscleGroups={muscleGroups}
            equipmentTypes={equipmentTypes}
            muscleFilters={muscleFilters}
            equipmentFilters={equipmentFilters}
            onMuscleFilterToggle={handleMuscleFilterToggle}
            onEquipmentFilterToggle={handleEquipmentFilterToggle}
          />
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
            type="button"
          >
            Crear Ejercicio
          </Button>
        </div>

        <ExerciseList 
          exercises={filteredExercises}
          selectedExercises={selectedExercises}
          onSelectExercise={handleExerciseSelect}
          onViewDetails={handleExerciseDetails}
          loading={loading}
        />
      </div>

      {/* Selected Exercises Floating Button */}
      {selectedExercises.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-4 flex justify-center">
          <Button
            variant="primary"
            className="shadow-neu-float px-6 bg-blue-500 hover:bg-blue-600"
            onClick={handleAddExercises}
            type="button"
          >
            Añadir {selectedExercises.length} ejercicios
          </Button>
        </div>
      )}
      
      {/* Confirmation Dialog */}
      <Dialog open={showSaveConfirmation} onOpenChange={setShowSaveConfirmation}>
        <DialogContent className="rounded-xl sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirmar selección</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Estás seguro de que quieres añadir los {selectedExercises.length} ejercicios seleccionados a tu rutina?
          </p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowSaveConfirmation(false)}
              className="rounded-lg"
            >
              Cancelar
            </Button>
            <Button 
              variant="primary"
              onClick={confirmAddExercises}
              className="rounded-lg"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SelectExercisesPage;
