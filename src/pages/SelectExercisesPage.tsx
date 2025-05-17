
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Check, ChevronDown, Filter, Info, Search, X, Plus, Dumbbell } from "lucide-react";
import { Card, CardBody } from "@/components/Card";
import Button from "@/components/Button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToastHelper } from "@/hooks/useToastHelper";

interface Exercise {
  id: number;
  name: string;
  muscle_group_main?: string;
  equipment_required?: string;
  difficulty_level?: string;
  video_url?: string;
}

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
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Ensure we have the routineId passed from previous screen
  useEffect(() => {
    if (!state?.routineId) {
      toast.showError(
        "Error",
        "No se pudo identificar la rutina"
      );
      navigate("/workout");
    }
  }, [state, navigate, toast]);
  
  // Fetch exercises from Supabase
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching exercises...");
        const { data, error } = await supabase
          .from('exercises')
          .select('*');
          
        if (error) {
          console.error("Error fetching exercises:", error);
          throw error;
        }
        
        console.log("Exercises data:", data);
        setExercises(data || []);
      } catch (error) {
        console.error("Error fetching exercises:", error);
        toast.showError(
          "Error", 
          "No se pudieron cargar los ejercicios"
        );
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExercises();
  }, [toast]);

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

  const handleAddExercises = async () => {
    try {
      if (selectedExercises.length === 0) {
        toast.showError(
          "Sin ejercicios",
          "Selecciona al menos un ejercicio"
        );
        return;
      }
      
      setIsLoading(true);
      
      // Add selected exercises to the routine
      const exercisesToAdd = selectedExercises.map((exerciseId, index) => ({
        routine_id: state.routineId,
        exercise_id: exerciseId,
        exercise_order: index + 1,
        sets: 3,  // Default values
        reps_min: 8,
        reps_max: 12,
        rest_between_sets_seconds: 60
      }));
      
      const { error } = await supabase
        .from('routine_exercises')
        .insert(exercisesToAdd);
        
      if (error) throw error;
      
      toast.showSuccess(
        "Ejercicios añadidos",
        `${selectedExercises.length} ejercicios añadidos a la rutina`
      );
      
      // Navigate to configure exercises page
      navigate(`/workout/configure/${state.routineId}`, { 
        state: { 
          routineId: state.routineId,
          routineName: state.routineName
        } 
      });
    } catch (error) {
      console.error("Error adding exercises:", error);
      toast.showError(
        "Error", 
        "No se pudieron añadir los ejercicios"
      );
    } finally {
      setIsLoading(false);
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
            onClick={() => navigate(-1)}
            className="mr-3 p-1 rounded-full hover:bg-secondary/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Seleccionar Ejercicios</h1>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar ejercicios..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 rounded-xl pl-10 pr-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button"
            />
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="secondary"
                size="sm"
                leftIcon={<Filter className="h-4 w-4" />}
              >
                Filtrar
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background/95 backdrop-blur-md border-l border-white/5 w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Filtrar Ejercicios</SheetTitle>
              </SheetHeader>
              
              <div className="py-4">
                <h3 className="text-sm font-medium mb-2">Grupos Musculares</h3>
                <div className="grid grid-cols-2 gap-2">
                  {muscleGroups.map(muscle => (
                    <div key={muscle} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`muscle-${muscle}`} 
                        checked={muscleFilters.includes(muscle)}
                        onCheckedChange={() => handleMuscleFilterToggle(muscle)}
                      />
                      <label 
                        htmlFor={`muscle-${muscle}`}
                        className="text-sm cursor-pointer"
                      >
                        {muscle}
                      </label>
                    </div>
                  ))}
                </div>

                <h3 className="text-sm font-medium mb-2 mt-6">Equipamiento</h3>
                <div className="grid grid-cols-2 gap-2">
                  {equipmentTypes.map(equipment => (
                    <div key={equipment} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`equipment-${equipment}`}
                        checked={equipmentFilters.includes(equipment)}
                        onCheckedChange={() => handleEquipmentFilterToggle(equipment)}
                      />
                      <label 
                        htmlFor={`equipment-${equipment}`}
                        className="text-sm cursor-pointer"
                      >
                        {equipment}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="primary" fullWidth>
                    Aplicar Filtros
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
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
                  <div className="flex items-center">
                    <Checkbox
                      id={`select-${exercise.id}`}
                      checked={selectedExercises.includes(exercise.id)}
                      onCheckedChange={() => handleExerciseSelect(exercise.id)}
                      className="mr-3 h-5 w-5 rounded-full bg-background"
                    />
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{exercise.name}</h3>
                      <span className="text-xs text-muted-foreground">{exercise.muscle_group_main}</span>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="min-w-0 p-1"
                      onClick={() => handleExerciseDetails(exercise.id)}
                    >
                      <Info className="h-4 w-4 text-primary" />
                    </Button>
                  </div>
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
            disabled={isLoading}
          >
            Añadir {selectedExercises.length} ejercicios
          </Button>
        </div>
      )}
    </div>
  );
};

export default SelectExercisesPage;
