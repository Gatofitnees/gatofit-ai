import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, Plus, Save, Trash2, Grip, ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardBody } from "../components/Card";
import Button from "../components/Button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ExerciseItem {
  id: string;
  name: string;
  muscle_group_main: string;
  equipment_required?: string;
}

interface RoutineExercise extends ExerciseItem {
  sets: number;
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
}

const CreateRoutinePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [routineName, setRoutineName] = useState("");
  const [routineType, setRoutineType] = useState("");
  const [routineDescription, setRoutineDescription] = useState("");
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load selected exercises from location state when available
  useEffect(() => {
    if (location.state && location.state.selectedExercises) {
      const exercises = location.state.selectedExercises.map((exercise: ExerciseItem) => ({
        ...exercise,
        sets: 3,
        reps_min: 8,
        reps_max: 12,
        rest_seconds: 60
      }));
      setRoutineExercises(exercises);
    }
  }, [location.state]);
  
  const handleSelectExercises = () => {
    navigate("/workout/select-exercises");
  };

  const handleExerciseUpdate = (index: number, field: string, value: number) => {
    const updatedExercises = [...routineExercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value
    };
    setRoutineExercises(updatedExercises);
  };

  const handleRemoveExercise = (index: number) => {
    const updatedExercises = [...routineExercises];
    updatedExercises.splice(index, 1);
    setRoutineExercises(updatedExercises);
  };

  const handleSaveRoutine = async () => {
    if (!routineName) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre para la rutina",
        variant: "destructive"
      });
      return;
    }

    if (routineExercises.length === 0) {
      toast({
        title: "Error",
        description: "Añade al menos un ejercicio a la rutina",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para guardar rutinas",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Insert routine
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .insert({
          name: routineName,
          description: routineDescription,
          user_id: user.id,
          estimated_duration_minutes: routineExercises.length * 5, // Rough estimate
        })
        .select()
        .single();

      if (routineError) {
        throw new Error(routineError.message);
      }

      // Insert routine exercises
      const routineExercisesData = routineExercises.map((exercise, index) => ({
        routine_id: routineData.id,
        exercise_id: parseInt(exercise.id),
        exercise_order: index + 1,
        sets: exercise.sets,
        reps_min: exercise.reps_min,
        reps_max: exercise.reps_max,
        rest_between_sets_seconds: exercise.rest_seconds
      }));

      const { error: exercisesError } = await supabase
        .from('routine_exercises')
        .insert(routineExercisesData);

      if (exercisesError) {
        throw new Error(exercisesError.message);
      }

      toast({
        title: "¡Rutina creada!",
        description: `La rutina ${routineName} ha sido guardada correctamente`,
      });

      navigate("/workout");
    } catch (error) {
      console.error("Error saving routine:", error);
      toast({
        title: "Error al guardar",
        description: "Ha ocurrido un error al guardar la rutina",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/workout");
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Crear Rutina</h1>
        <div className="flex gap-2">
          <Button 
            variant="primary" 
            size="sm"
            leftIcon={<Save className="h-4 w-4" />}
            onClick={handleSaveRoutine}
            disabled={isSubmitting}
          >
            Guardar
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={handleBack}
          >
            Volver
          </Button>
        </div>
      </div>
      
      <div className="animate-fade-in">
        <Card>
          <CardHeader title="Crear Nueva Rutina" />
          <CardBody>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de la Rutina</label>
                <input 
                  type="text" 
                  placeholder="Ej: Día de Pierna" 
                  className="w-full h-10 rounded-xl px-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button"
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Rutina</label>
                <Select value={routineType} onValueChange={setRoutineType}>
                  <SelectTrigger className="w-full h-10 rounded-xl px-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button">
                    <SelectValue placeholder="Seleccionar tipo" />
                    <ChevronDown className="h-4 w-4 text-primary" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm border border-secondary">
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
              
              <h3 className="text-base font-medium pt-2">Ejercicios</h3>
              
              {routineExercises.length > 0 ? (
                <div className="space-y-3">
                  {routineExercises.map((exercise, index) => (
                    <Card key={`${exercise.id}-${index}`} className="bg-secondary/40">
                      <CardBody>
                        <div className="flex items-center mb-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <Grip className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{exercise.name}</h4>
                            <span className="text-xs text-muted-foreground">{exercise.muscle_group_main}</span>
                          </div>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="ml-auto min-w-0 p-1"
                            onClick={() => handleRemoveExercise(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <div>
                            <label className="block text-xs font-medium mb-1">Series</label>
                            <input 
                              type="number" 
                              min="1"
                              max="20"
                              className="w-full h-9 rounded-lg px-3 py-1 bg-background border-none text-sm"
                              value={exercise.sets}
                              onChange={(e) => handleExerciseUpdate(index, "sets", parseInt(e.target.value))}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Repeticiones</label>
                            <div className="flex items-center">
                              <input 
                                type="number"
                                min="1"
                                max="100"
                                className="w-full h-9 rounded-lg px-3 py-1 bg-background border-none text-sm"
                                value={exercise.reps_min}
                                onChange={(e) => handleExerciseUpdate(index, "reps_min", parseInt(e.target.value))}
                              />
                              <span className="px-1">-</span>
                              <input 
                                type="number"
                                min="1"
                                max="100"
                                className="w-full h-9 rounded-lg px-3 py-1 bg-background border-none text-sm"
                                value={exercise.reps_max}
                                onChange={(e) => handleExerciseUpdate(index, "reps_max", parseInt(e.target.value))}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Descanso (s)</label>
                            <input 
                              type="number"
                              min="0"
                              max="300"
                              step="5"
                              className="w-full h-9 rounded-lg px-3 py-1 bg-background border-none text-sm"
                              value={exercise.rest_seconds}
                              onChange={(e) => handleExerciseUpdate(index, "rest_seconds", parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No hay ejercicios seleccionados
                </div>
              )}
              
              <div className="pt-2">
                <Button 
                  variant={routineExercises.length > 0 ? "secondary" : "primary"}
                  fullWidth 
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={handleSelectExercises}
                >
                  {routineExercises.length > 0 ? 'Añadir más ejercicios' : 'Añadir Ejercicios'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default CreateRoutinePage;
