
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Save, GripVertical, PlusCircle, MinusCircle } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/Card";
import Button from "@/components/Button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface Exercise {
  id: string;
  name: string;
  muscle_group_main: string;
  equipment_required?: string;
  difficulty_level?: string;
  video_url?: string;
}

interface RoutineFormData {
  name: string;
  type: string;
  description?: string;
}

interface ConfiguredExercise extends Exercise {
  sets: number;
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
  notes?: string;
  is_time_based: boolean;
  duration_seconds?: number;
}

const ConfigureRoutineExercisesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedExercises = [], routineFormData = {} } = location.state || {};

  const [exercises, setExercises] = useState<ConfiguredExercise[]>(
    selectedExercises.map((ex: Exercise) => ({
      ...ex,
      sets: 3,
      reps_min: 8,
      reps_max: 12,
      rest_seconds: 60,
      notes: "",
      is_time_based: false,
    }))
  );
  
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, data: Partial<ConfiguredExercise>) => {
    setExercises(
      exercises.map((ex, i) => (i === index ? { ...ex, ...data } : ex))
    );
  };

  const handleSaveRoutine = async () => {
    setIsSaving(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Debes iniciar sesión para guardar rutinas");
        return;
      }

      // Insert routine into the database
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .insert({
          name: routineFormData.name,
          description: routineFormData.description,
          user_id: user.id,
          estimated_duration_minutes: calculateTotalDuration(),
          is_predefined: false
        })
        .select()
        .single();

      if (routineError) {
        throw routineError;
      }

      // Insert exercise details
      const routineExercises = exercises.map((ex, index) => ({
        routine_id: routineData.id,
        exercise_id: ex.id,
        exercise_order: index + 1,
        sets: ex.sets,
        reps_min: ex.is_time_based ? null : ex.reps_min,
        reps_max: ex.is_time_based ? null : ex.reps_max,
        duration_seconds: ex.is_time_based ? ex.duration_seconds : null,
        rest_between_sets_seconds: ex.rest_seconds,
        notes: ex.notes
      }));

      const { error: exercisesError } = await supabase
        .from('routine_exercises')
        .insert(routineExercises);

      if (exercisesError) {
        throw exercisesError;
      }

      toast.success("Rutina guardada con éxito");
      // Close dialog and navigate to workout page
      setShowConfirmDialog(false);
      navigate("/workout");
    } catch (error: any) {
      console.error('Error saving routine:', error);
      toast.error(`Error al guardar la rutina: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const calculateTotalDuration = () => {
    // Estimate total duration based on sets, reps and rest times
    let totalSeconds = 0;
    
    exercises.forEach(ex => {
      // Average seconds per set (rough estimate)
      const secondsPerSet = ex.is_time_based 
        ? (ex.duration_seconds || 30) 
        : ((ex.reps_min + ex.reps_max) / 2) * 3; // 3 seconds per rep average
      
      // Total time for all sets including rest
      totalSeconds += (ex.sets * secondsPerSet) + ((ex.sets - 1) * ex.rest_seconds);
    });
    
    // Convert to minutes and round up
    return Math.ceil(totalSeconds / 60);
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background p-4 border-b border-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-3 p-1 rounded-full hover:bg-secondary/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold">Configurar Ejercicios</h1>
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Save className="h-4 w-4" />}
            onClick={() => setShowConfirmDialog(true)}
          >
            Guardar
          </Button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          {routineFormData.name || "Nueva Rutina"}
        </div>
      </div>

      {/* Exercise configuration list */}
      <div className="p-4">
        {exercises.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No hay ejercicios seleccionados</p>
            <Button 
              variant="secondary"
              onClick={() => navigate("/workout/select-exercises", { state: { routineFormData } })}
            >
              Añadir Ejercicios
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <Card key={`${exercise.id}-${index}`} className="hover:shadow-neu-hover transition-all">
                <CardBody>
                  <div className="flex items-start mb-2">
                    <div className="w-6 flex-shrink-0 mr-2 text-muted-foreground">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{exercise.name}</h3>
                      <span className="text-xs text-muted-foreground">{exercise.muscle_group_main}</span>
                      
                      <div className="space-y-4 mt-4">
                        {/* Series */}
                        <div>
                          <label className="text-xs text-muted-foreground">Series</label>
                          <div className="flex items-center mt-1">
                            <button 
                              className="p-1 rounded-lg bg-secondary/50 hover:bg-secondary"
                              onClick={() => updateExercise(index, { sets: Math.max(1, exercise.sets - 1) })}
                            >
                              <MinusCircle className="h-4 w-4" />
                            </button>
                            <span className="mx-4 font-medium w-8 text-center">{exercise.sets}</span>
                            <button 
                              className="p-1 rounded-lg bg-secondary/50 hover:bg-secondary"
                              onClick={() => updateExercise(index, { sets: exercise.sets + 1 })}
                            >
                              <PlusCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Toggle between Reps and Time */}
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-muted-foreground">
                            {exercise.is_time_based ? "Basado en Tiempo" : "Basado en Repeticiones"}
                          </label>
                          <Switch 
                            checked={exercise.is_time_based}
                            onCheckedChange={(checked) => updateExercise(index, { 
                              is_time_based: checked,
                              // Initialize duration if switching to time-based
                              duration_seconds: checked ? 30 : undefined
                            })}
                          />
                        </div>
                        
                        {/* Repetitions or Duration */}
                        {exercise.is_time_based ? (
                          <div>
                            <label className="text-xs text-muted-foreground">Duración (segundos)</label>
                            <div className="flex items-center mt-1">
                              <button 
                                className="p-1 rounded-lg bg-secondary/50 hover:bg-secondary"
                                onClick={() => updateExercise(index, { 
                                  duration_seconds: Math.max(5, (exercise.duration_seconds || 30) - 5) 
                                })}
                              >
                                <MinusCircle className="h-4 w-4" />
                              </button>
                              <span className="mx-4 font-medium w-8 text-center">
                                {exercise.duration_seconds || 30}
                              </span>
                              <button 
                                className="p-1 rounded-lg bg-secondary/50 hover:bg-secondary"
                                onClick={() => updateExercise(index, { 
                                  duration_seconds: (exercise.duration_seconds || 30) + 5 
                                })}
                              >
                                <PlusCircle className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="text-xs text-muted-foreground">Repeticiones (min-max)</label>
                            <div className="flex items-center justify-between mt-1">
                              <div className="flex items-center">
                                <button 
                                  className="p-1 rounded-lg bg-secondary/50 hover:bg-secondary"
                                  onClick={() => updateExercise(index, { 
                                    reps_min: Math.max(1, exercise.reps_min - 1) 
                                  })}
                                >
                                  <MinusCircle className="h-4 w-4" />
                                </button>
                                <span className="mx-2 font-medium w-6 text-center">{exercise.reps_min}</span>
                                <button 
                                  className="p-1 rounded-lg bg-secondary/50 hover:bg-secondary"
                                  onClick={() => updateExercise(index, { 
                                    reps_min: Math.min(exercise.reps_max, exercise.reps_min + 1) 
                                  })}
                                >
                                  <PlusCircle className="h-4 w-4" />
                                </button>
                              </div>
                              <span className="mx-2 text-muted-foreground">-</span>
                              <div className="flex items-center">
                                <button 
                                  className="p-1 rounded-lg bg-secondary/50 hover:bg-secondary"
                                  onClick={() => updateExercise(index, { 
                                    reps_max: Math.max(exercise.reps_min, exercise.reps_max - 1) 
                                  })}
                                >
                                  <MinusCircle className="h-4 w-4" />
                                </button>
                                <span className="mx-2 font-medium w-6 text-center">{exercise.reps_max}</span>
                                <button 
                                  className="p-1 rounded-lg bg-secondary/50 hover:bg-secondary"
                                  onClick={() => updateExercise(index, { reps_max: exercise.reps_max + 1 })}
                                >
                                  <PlusCircle className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Rest time */}
                        <div>
                          <label className="text-xs text-muted-foreground">Descanso (segundos)</label>
                          <div className="flex items-center mt-1">
                            <button 
                              className="p-1 rounded-lg bg-secondary/50 hover:bg-secondary"
                              onClick={() => updateExercise(index, { 
                                rest_seconds: Math.max(0, exercise.rest_seconds - 15) 
                              })}
                            >
                              <MinusCircle className="h-4 w-4" />
                            </button>
                            <span className="mx-4 font-medium w-10 text-center">
                              {exercise.rest_seconds}
                            </span>
                            <button 
                              className="p-1 rounded-lg bg-secondary/50 hover:bg-secondary"
                              onClick={() => updateExercise(index, { rest_seconds: exercise.rest_seconds + 15 })}
                            >
                              <PlusCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Notes */}
                        <div>
                          <label className="text-xs text-muted-foreground">Notas (opcional)</label>
                          <Textarea 
                            value={exercise.notes || ""}
                            onChange={(e) => updateExercise(index, { notes: e.target.value })}
                            placeholder="Añade instrucciones o notas para este ejercicio..."
                            className="mt-1 bg-secondary/30 border-none resize-none"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                    <button 
                      className="ml-2 p-1 rounded-lg text-destructive hover:bg-secondary/50"
                      onClick={() => handleRemoveExercise(index)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </CardBody>
              </Card>
            ))}

            <Button
              variant="secondary"
              fullWidth
              className="mt-4"
              onClick={() => navigate("/workout/select-exercises", { 
                state: { 
                  routineFormData,
                  previouslySelected: exercises
                } 
              })}
            >
              Añadir Más Ejercicios
            </Button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-background/95 border-none shadow-neu-dialog backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-center">Guardar Rutina</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>¿Deseas guardar la rutina <strong>{routineFormData.name}</strong> con {exercises.length} ejercicios?</p>
            <p className="text-sm text-muted-foreground mt-2">
              Estimación de duración: ~{calculateTotalDuration()} minutos
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="secondary" 
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSaveRoutine} 
              disabled={isSaving}
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConfigureRoutineExercisesPage;
