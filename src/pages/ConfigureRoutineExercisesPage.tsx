
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Check, Save, Trash, DragVertical, X } from "lucide-react";
import { Card, CardBody } from "@/components/Card";
import Button from "@/components/Button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface LocationState {
  routineId: number;
  routineName: string;
}

interface Exercise {
  id: number;
  routine_id: number;
  exercise_id: string;
  exercise_order: number;
  sets: number;
  reps_min: number;
  reps_max: number;
  rest_between_sets_seconds: number;
  notes?: string;
  exercise: {
    id: string;
    name: string;
    muscle_group_main?: string;
  };
}

const ConfigureRoutineExercisesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as LocationState;
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routineName, setRoutineName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  // Rest time options
  const restTimeOptions = [
    { value: 30, label: "30 seg" },
    { value: 45, label: "45 seg" },
    { value: 60, label: "1 min" },
    { value: 90, label: "1:30 min" },
    { value: 120, label: "2 min" },
    { value: 180, label: "3 min" }
  ];

  // Ensure we have the routineId passed from previous screen
  useEffect(() => {
    if (!state?.routineId) {
      toast.show({
        title: "Error",
        description: "No se pudo identificar la rutina",
        variant: "destructive"
      });
      navigate("/workout");
    } else {
      setRoutineName(state.routineName || "Nueva Rutina");
    }
  }, [state, navigate, toast]);
  
  // Fetch selected exercises
  useEffect(() => {
    const fetchRoutineExercises = async () => {
      if (!state?.routineId) return;
      
      try {
        setIsLoading(true);
        
        // Get the routine details
        const { data: routineData, error: routineError } = await supabase
          .from('routines')
          .select('name')
          .eq('id', state.routineId)
          .single();
          
        if (routineError) throw routineError;
        
        if (routineData) {
          setRoutineName(routineData.name);
        }
        
        // Get the routine exercises with exercise details
        const { data, error } = await supabase
          .from('routine_exercises')
          .select(`
            id,
            routine_id,
            exercise_id,
            exercise_order,
            sets,
            reps_min,
            reps_max,
            rest_between_sets_seconds,
            notes,
            exercise:exercises (
              id,
              name,
              muscle_group_main
            )
          `)
          .eq('routine_id', state.routineId)
          .order('exercise_order');
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setExercises(data);
        } else {
          // If no exercises, go back to select exercises
          toast.show({
            title: "Sin ejercicios",
            description: "Añade ejercicios a tu rutina primero",
            variant: "destructive"
          });
          navigate(`/workout/select-exercises`, { 
            state: { 
              routineId: state.routineId,
              routineName: routineName
            } 
          });
        }
      } catch (error) {
        console.error("Error fetching routine exercises:", error);
        toast.show({
          title: "Error", 
          description: "No se pudieron cargar los ejercicios de la rutina",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRoutineExercises();
  }, [state?.routineId, navigate, toast, routineName]);

  const updateExerciseParam = (exerciseId: number, param: string, value: any) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, [param]: value } : ex
    ));
  };
  
  const handleRemoveExercise = async (exerciseId: number) => {
    try {
      // Remove from database
      const { error } = await supabase
        .from('routine_exercises')
        .delete()
        .eq('id', exerciseId);
        
      if (error) throw error;
      
      // Remove from state
      setExercises(exercises.filter(ex => ex.id !== exerciseId));
      
      if (exercises.length <= 1) {
        // If last exercise is removed, go back to select exercises
        navigate(`/workout/select-exercises`, { 
          state: { 
            routineId: state.routineId,
            routineName: routineName
          } 
        });
      }
      
      toast.show({
        title: "Ejercicio eliminado",
        description: "El ejercicio se ha eliminado de la rutina",
      });
    } catch (error) {
      console.error("Error removing exercise:", error);
      toast.show({
        title: "Error", 
        description: "No se pudo eliminar el ejercicio",
        variant: "destructive"
      });
    }
  };
  
  const handleAddMoreExercises = () => {
    navigate(`/workout/select-exercises`, { 
      state: { 
        routineId: state.routineId,
        routineName: routineName
      } 
    });
  };
  
  const handleSaveRoutine = async () => {
    try {
      setIsSaving(true);
      
      // Update each exercise configuration
      const updatePromises = exercises.map(ex => 
        supabase
          .from('routine_exercises')
          .update({
            sets: ex.sets,
            reps_min: ex.reps_min,
            reps_max: ex.reps_max,
            rest_between_sets_seconds: ex.rest_between_sets_seconds,
            notes: ex.notes
          })
          .eq('id', ex.id)
      );
      
      await Promise.all(updatePromises);
      
      // Calculate estimated duration
      const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
      const avgRestTime = exercises.reduce((sum, ex) => sum + ex.rest_between_sets_seconds, 0) / exercises.length;
      const estimatedDuration = Math.round(totalSets * (45 + avgRestTime/60)); // rough estimate: 45 sec per set + rest time
      
      // Update routine with exercise count and duration
      await supabase
        .from('routines')
        .update({
          exercise_count: exercises.length,
          estimated_duration_minutes: estimatedDuration
        })
        .eq('id', state.routineId);
      
      toast.show({
        title: "Rutina guardada",
        description: "Tu rutina se ha guardado correctamente",
        variant: "default"
      });
      
      // Return to workout page
      navigate("/workout");
    } catch (error) {
      console.error("Error saving routine:", error);
      toast.show({
        title: "Error", 
        description: "No se pudo guardar la rutina",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
      setShowSaveDialog(false);
    }
  };
  
  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background p-4 border-b border-muted/20">
        <div className="flex items-center justify-between mb-4">
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
            onClick={() => setShowSaveDialog(true)}
          >
            Guardar
          </Button>
        </div>
        
        {/* Routine Name */}
        <h2 className="text-lg font-medium text-primary mb-2">{routineName}</h2>
        <p className="text-sm text-muted-foreground mb-4">Configura los detalles de cada ejercicio</p>
      </div>

      {/* Exercise Configuration List */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <p>Cargando ejercicios...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <Card key={exercise.id} className="hover:scale-[1.01] transition-transform duration-300">
                <CardBody>
                  <div className="flex items-start">
                    <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center mr-3 text-white text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{exercise.exercise.name}</h3>
                        <button 
                          onClick={() => handleRemoveExercise(exercise.id)}
                          className="text-muted-foreground hover:text-destructive p-1"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <span className="text-xs text-muted-foreground block mb-3">
                        {exercise.exercise.muscle_group_main || "General"}
                      </span>
                      
                      {/* Exercise Configuration */}
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Series</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={exercise.sets}
                            onChange={(e) => updateExerciseParam(exercise.id, "sets", parseInt(e.target.value) || 1)}
                            className="w-full h-9 rounded-lg px-3 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Repeticiones</label>
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              min="1"
                              max="50"
                              value={exercise.reps_min}
                              onChange={(e) => updateExerciseParam(exercise.id, "reps_min", parseInt(e.target.value) || 1)}
                              className="w-full h-9 rounded-lg px-3 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button text-sm"
                            />
                            <span className="text-xs">-</span>
                            <input
                              type="number"
                              min="1"
                              max="50"
                              value={exercise.reps_max}
                              onChange={(e) => updateExerciseParam(exercise.id, "reps_max", parseInt(e.target.value) || exercise.reps_min)}
                              className="w-full h-9 rounded-lg px-3 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button text-sm"
                            />
                          </div>
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-xs text-muted-foreground mb-1">Descanso</label>
                          <Select 
                            value={exercise.rest_between_sets_seconds.toString()} 
                            onValueChange={(value) => updateExerciseParam(exercise.id, "rest_between_sets_seconds", parseInt(value))}
                          >
                            <SelectTrigger className="w-full h-9 rounded-lg bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button text-sm">
                              <SelectValue placeholder="Seleccionar descanso" />
                            </SelectTrigger>
                            <SelectContent className="bg-background/95 backdrop-blur-sm border border-secondary">
                              {restTimeOptions.map(option => (
                                <SelectItem key={option.value} value={option.value.toString()}>{option.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-xs text-muted-foreground mb-1">Notas (opcional)</label>
                          <textarea
                            value={exercise.notes || ""}
                            onChange={(e) => updateExerciseParam(exercise.id, "notes", e.target.value)}
                            maxLength={100}
                            placeholder="Instrucciones especiales..."
                            className="w-full h-[60px] rounded-lg px-3 py-2 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button text-sm resize-none"
                          />
                          <div className="text-xs text-right text-muted-foreground mt-1">
                            {(exercise.notes || "").length}/100
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
            
            <Button
              variant="secondary"
              fullWidth
              className="mt-4"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleAddMoreExercises}
            >
              Añadir Más Ejercicios
            </Button>
          </div>
        )}
      </div>
      
      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-background/95 backdrop-blur-sm border border-white/5">
          <DialogHeader>
            <DialogTitle>Guardar Rutina</DialogTitle>
            <DialogDescription>
              ¿Deseas guardar la rutina "{routineName}"?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button 
              variant="secondary" 
              onClick={() => setShowSaveDialog(false)} 
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSaveRoutine}
              className="w-full sm:w-auto"
              disabled={isSaving}
              leftIcon={isSaving ? undefined : <Check className="h-4 w-4" />}
            >
              {isSaving ? "Guardando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Save Button (Fixed Bottom) */}
      <div className="fixed bottom-20 left-0 right-0 p-4 flex justify-center">
        <Button
          variant="primary"
          className="shadow-neu-float px-6"
          leftIcon={<Save className="h-4 w-4" />}
          onClick={() => setShowSaveDialog(true)}
          disabled={isLoading || isSaving}
        >
          Guardar Rutina
        </Button>
      </div>
    </div>
  );
};

export default ConfigureRoutineExercisesPage;
