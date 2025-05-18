import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

interface Exercise {
  id: number; // Changed from string to number to match Supabase data
  name: string;
  muscle_group_main: string;
  equipment_required?: string;
  difficulty_level?: string;
  video_url?: string;
}

const SelectExercisesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);
  const [muscleFilters, setMuscleFilters] = useState<string[]>([]);
  const [equipmentFilters, setEquipmentFilters] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { data, error } = await supabase
          .from('exercises')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setExercises(data);
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
        // Fallback to mock data if fetch fails
        setExercises([
          {
            id: 1, // Changed from "1" to 1 to match the new type
            name: "Press de Banca",
            muscle_group_main: "Pecho",
            equipment_required: "Barra",
            difficulty_level: "Intermedio",
            video_url: "/exercises/bench-press.mp4"
          },
          {
            id: 2, // Changed from "2" to 2
            name: "Sentadilla",
            muscle_group_main: "Piernas",
            equipment_required: "Peso Corporal",
            difficulty_level: "Principiante",
            video_url: "/exercises/squat.mp4"
          },
          {
            id: 3, // Changed from "3" to 3
            name: "Pull-up",
            muscle_group_main: "Espalda",
            equipment_required: "Barra de dominadas",
            difficulty_level: "Avanzado",
            video_url: "/exercises/pull-up.mp4"
          },
          {
            id: 4, // Changed from "4" to 4
            name: "Plancha",
            muscle_group_main: "Core",
            equipment_required: "Peso Corporal",
            difficulty_level: "Principiante",
            video_url: "/exercises/plank.mp4"
          },
          {
            id: 5, // Changed from "5" to 5
            name: "Extensión de Tríceps",
            muscle_group_main: "Tríceps",
            equipment_required: "Mancuernas",
            difficulty_level: "Principiante",
            video_url: "/exercises/triceps.mp4"
          },
          {
            id: 6, // Changed from "6" to 6
            name: "Curl de Bíceps",
            muscle_group_main: "Bíceps",
            equipment_required: "Mancuernas",
            difficulty_level: "Principiante",
            video_url: "/exercises/biceps-curl.mp4"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  // Extract unique values for filter options
  const muscleGroups = Array.from(new Set(exercises.map(e => e.muscle_group_main).filter(Boolean))) as string[];
  const equipmentTypes = Array.from(new Set(exercises.map(e => e.equipment_required).filter(Boolean))) as string[];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (exercise.muscle_group_main?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesMuscle = muscleFilters.length === 0 || 
                          (exercise.muscle_group_main && muscleFilters.includes(exercise.muscle_group_main));
    
    const matchesEquipment = equipmentFilters.length === 0 || 
                            (exercise.equipment_required && equipmentFilters.includes(exercise.equipment_required));
    
    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  const handleExerciseSelect = (id: number) => { // Updated parameter type from string to number
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

  const handleExerciseDetails = (id: number) => { // Updated parameter type from string to number
    navigate(`/workout/exercise-details/${id}`);
  };

  const handleAddExercises = () => {
    // Get the selected exercise objects
    const selectedExerciseObjects = exercises.filter(exercise => 
      selectedExercises.includes(exercise.id)
    );
    
    // Navigate back to create routine with the selected exercises
    navigate("/workout/create", { 
      state: { selectedExercises: selectedExerciseObjects } 
    });
  };

  const handleCreateExercise = () => {
    navigate("/workout/create-exercise");
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background p-4 border-b border-muted/20">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => navigate("/workout/create")}
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
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
          >
            Añadir {selectedExercises.length} ejercicios
          </Button>
        </div>
      )}
    </div>
  );
};

export default SelectExercisesPage;
