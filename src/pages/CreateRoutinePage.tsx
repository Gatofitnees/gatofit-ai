
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/Card";
import Button from "@/components/Button";
import { useToastHelper } from "@/hooks/useToastHelper";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import ExerciseListItem from "@/components/workout/ExerciseListItem";
import { Exercise } from "@/hooks/workout/useExercises";

interface LocationState {
  selectedExercises?: Exercise[];
  routineId?: number;
  routineName?: string;
}

const CreateRoutinePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToastHelper();
  const state = location.state as LocationState || {};
  
  const [routineName, setRoutineName] = useState(state.routineName || "");
  const [routineType, setRoutineType] = useState("");
  const [routineDescription, setRoutineDescription] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>(state.selectedExercises || []);
  const [routineId, setRoutineId] = useState<number | undefined>(state.routineId);
  const [isLoading, setIsLoading] = useState(false);
  const [exerciseConfigs, setExerciseConfigs] = useState<{
    [exerciseId: number]: {
      sets: number;
      repsMin: number;
      repsMax: number;
      restSeconds: number;
    }
  }>({});

  // Initialize exercise configurations with default values
  useEffect(() => {
    if (selectedExercises.length > 0) {
      const configs = selectedExercises.reduce((acc, exercise) => {
        if (!exerciseConfigs[exercise.id]) {
          acc[exercise.id] = {
            sets: 3,
            repsMin: 8, 
            repsMax: 12,
            restSeconds: 60
          };
        } else {
          acc[exercise.id] = exerciseConfigs[exercise.id];
        }
        return acc;
      }, {} as {[exerciseId: number]: any});
      
      setExerciseConfigs(configs);
    }
  }, [selectedExercises]);

  const handleSelectExercises = async () => {
    // Return early if routine name is empty
    if (!routineName.trim()) {
      toast.showError(
        "Nombre requerido",
        "Por favor añade un nombre para tu rutina"
      );
      return;
    }

    try {
      setIsLoading(true);
      let routineIdToUse = routineId;
      
      if (!routineIdToUse) {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session) {
          toast.showError(
            "Error de autenticación",
            "Debes iniciar sesión para crear rutinas"
          );
          return;
        }
        
        // Create a routine in the database
        const { data, error } = await supabase.from('routines').insert({
          name: routineName,
          type: routineType || "Mixto",
          description: routineDescription,
          user_id: session.session.user.id,
          is_predefined: false
        }).select().single();
        
        if (error) throw error;
        
        console.log("Routine created:", data);
        routineIdToUse = data.id;
        setRoutineId(data.id);
      }
      
      // Navigate to exercise selection with the routine id
      navigate("/workout/select-exercises", { 
        state: { 
          routineId: routineIdToUse,
          routineName: routineName
        }
      });
      
    } catch (error) {
      console.error("Error creating routine:", error);
      toast.showError(
        "Error",
        "No se pudo crear la rutina"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateExerciseConfig = (exerciseId: number, field: string, value: number) => {
    setExerciseConfigs(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value
      }
    }));
  };

  const handleSaveRoutine = async () => {
    try {
      setIsLoading(true);

      if (!routineId || selectedExercises.length === 0) {
        toast.showError(
          "Datos incompletos",
          "Asegúrate de tener un nombre de rutina y al menos un ejercicio"
        );
        return;
      }

      // Prepare exercise data to save
      const exercisesToSave = selectedExercises.map((exercise, index) => {
        const config = exerciseConfigs[exercise.id] || {
          sets: 3,
          repsMin: 8,
          repsMax: 12,
          restSeconds: 60
        };
        
        return {
          routine_id: routineId,
          exercise_id: exercise.id,
          exercise_order: index + 1,
          sets: config.sets,
          reps_min: config.repsMin,
          reps_max: config.repsMax,
          rest_between_sets_seconds: config.restSeconds
        };
      });

      // Delete any existing routine exercises if editing an existing routine
      if (routineId) {
        const { error: deleteError } = await supabase
          .from('routine_exercises')
          .delete()
          .eq('routine_id', routineId);
          
        if (deleteError) throw deleteError;
      }

      // Save all exercises
      const { error } = await supabase
        .from('routine_exercises')
        .insert(exercisesToSave);
        
      if (error) throw error;
      
      toast.showSuccess(
        "Rutina guardada",
        "Tu rutina ha sido guardada exitosamente"
      );
      
      // Navigate back to workout page
      navigate("/workout");
      
    } catch (error) {
      console.error("Error saving routine:", error);
      toast.showError(
        "Error", 
        "No se pudo guardar la rutina"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewExerciseDetails = (id: number) => {
    navigate(`/workout/exercise-details/${id}`);
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background p-4 border-b border-muted/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button 
              onClick={() => navigate("/workout")}
              className="mr-3 p-1 rounded-full hover:bg-secondary/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold">{routineId ? 'Editar Rutina' : 'Crear Rutina'}</h1>
          </div>
          {selectedExercises.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Save className="h-4 w-4" />}
              onClick={handleSaveRoutine}
              disabled={isLoading}
            >
              Guardar
            </Button>
          )}
        </div>
      </div>

      <div className="p-4">
        <Card className="mb-6">
          <CardBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de la Rutina</label>
                <Input
                  type="text" 
                  placeholder="Ej: Día de Pierna" 
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Rutina</label>
                <Select value={routineType} onValueChange={setRoutineType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="strength">Fuerza</SelectItem>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="flexibility">Flexibilidad</SelectItem>
                      <SelectItem value="mixed">Mixto</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
                <textarea 
                  rows={3}
                  placeholder="Describe brevemente esta rutina..." 
                  className="w-full rounded-xl p-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button resize-none"
                  value={routineDescription}
                  onChange={(e) => setRoutineDescription(e.target.value)}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Ejercicios</h2>
          <Button 
            variant="primary" 
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={handleSelectExercises}
          >
            Añadir Ejercicios
          </Button>
        </div>

        {selectedExercises.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay ejercicios añadidos</p>
            <p className="text-sm mt-2">Añade ejercicios a tu rutina</p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedExercises.map((exercise) => (
              <Card key={exercise.id} className="hover:scale-[1.01] transition-transform duration-300">
                <CardBody>
                  <div className="mb-2">
                    <ExerciseListItem
                      exercise={exercise}
                      isSelected={false}
                      onToggleSelect={() => {}}
                      onViewDetails={handleViewExerciseDetails}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Series</label>
                      <input
                        type="number"
                        min="1"
                        value={exerciseConfigs[exercise.id]?.sets || 3}
                        onChange={(e) => handleUpdateExerciseConfig(
                          exercise.id, 
                          'sets', 
                          parseInt(e.target.value) || 1
                        )}
                        className="w-full h-8 rounded-lg px-3 bg-secondary border-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Descanso (seg)</label>
                      <input
                        type="number"
                        min="5"
                        step="5"
                        value={exerciseConfigs[exercise.id]?.restSeconds || 60}
                        onChange={(e) => handleUpdateExerciseConfig(
                          exercise.id, 
                          'restSeconds', 
                          parseInt(e.target.value) || 60
                        )}
                        className="w-full h-8 rounded-lg px-3 bg-secondary border-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Reps. Min</label>
                      <input
                        type="number"
                        min="1"
                        value={exerciseConfigs[exercise.id]?.repsMin || 8}
                        onChange={(e) => handleUpdateExerciseConfig(
                          exercise.id, 
                          'repsMin', 
                          parseInt(e.target.value) || 1
                        )}
                        className="w-full h-8 rounded-lg px-3 bg-secondary border-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Reps. Max</label>
                      <input
                        type="number"
                        min="1"
                        value={exerciseConfigs[exercise.id]?.repsMax || 12}
                        onChange={(e) => handleUpdateExerciseConfig(
                          exercise.id, 
                          'repsMax', 
                          parseInt(e.target.value) || 1
                        )}
                        className="w-full h-8 rounded-lg px-3 bg-secondary border-none text-sm"
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRoutinePage;
