
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExercises } from "@/hooks/useExercises";
import { useRoutine } from "@/contexts/RoutineContext";
import { RoutineExercise } from "@/features/workout/types";

const SelectExercisesPage: React.FC = () => {
  const navigate = useNavigate();
  const { exercises, loading, muscleGroups, equipmentTypes } = useExercises();
  const { addExercises } = useRoutine();
  
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [muscleFilters, setMuscleFilters] = useState<string[]>([]);
  const [equipmentFilters, setEquipmentFilters] = useState<string[]>([]);
  
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

  const handleToggleExercise = (id: string) => {
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
  
  const handleAddExercises = () => {
    // Get the selected exercise objects
    const selectedExerciseObjects = exercises
      .filter(exercise => selectedExercises.includes(exercise.id.toString()))
      .map(exercise => ({
        id: exercise.id.toString(),
        name: exercise.name,
        muscle_group_main: exercise.muscle_group_main || '',
        sets: [{ reps_min: 8, reps_max: 12, rest_seconds: 60 }]
      })) as RoutineExercise[];
    
    // Add selected exercises to the routine
    addExercises(selectedExerciseObjects);
    
    // Navigate back to create routine
    navigate("/workout/create");
  };

  const handleNavigateBack = () => {
    navigate("/workout/create");
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

        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Buscar ejercicios..."
            className="w-full p-2 rounded-xl border border-gray-200 bg-secondary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Filters */}
        <div className="mt-2 flex flex-wrap gap-1">
          <p className="text-xs w-full mb-1">Filtrar por músculo:</p>
          {muscleGroups.slice(0, 5).map(muscle => (
            <button
              key={muscle}
              onClick={() => handleMuscleFilterToggle(muscle)}
              className={`text-xs px-2 py-1 rounded-full ${
                muscleFilters.includes(muscle)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {muscle}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises list */}
      <div className="p-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            {filteredExercises.length} ejercicios encontrados
          </span>
          <span className="text-sm text-blue-500 font-medium">
            {selectedExercises.length} seleccionados
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredExercises.map(exercise => (
              <div
                key={exercise.id}
                onClick={() => handleToggleExercise(exercise.id.toString())}
                className={`p-3 rounded-xl transition-all cursor-pointer ${
                  selectedExercises.includes(exercise.id.toString())
                    ? 'bg-blue-50 border border-blue-500'
                    : 'bg-white border border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{exercise.name}</p>
                    <p className="text-xs text-muted-foreground">{exercise.muscle_group_main}</p>
                  </div>
                  {selectedExercises.includes(exercise.id.toString()) && (
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Exercises Floating Button */}
      {selectedExercises.length > 0 && (
        <div className="fixed bottom-8 left-0 right-0 p-4 flex justify-center z-50">
          <Button
            className="px-6 py-6 bg-blue-500 hover:bg-blue-600 text-white shadow-lg rounded-2xl"
            onClick={handleAddExercises}
          >
            Añadir {selectedExercises.length} ejercicios
          </Button>
        </div>
      )}
    </div>
  );
};

export default SelectExercisesPage;
