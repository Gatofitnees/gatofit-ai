
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, GripVertical, Save, Trash2, Plus } from "lucide-react";
import Button from "@/components/Button";
import { Card, CardBody } from "@/components/Card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToastHelper } from "@/hooks/useToastHelper";

interface Exercise {
  id: number;
  exercise_id: number;
  routine_id: number;
  exercise_order: number;
  sets: number;
  reps_min: number;
  reps_max: number;
  rest_between_sets_seconds: number;
  notes?: string;
  exercise: {
    id: number;
    name: string;
    muscle_group_main?: string;
  }
}

interface LocationState {
  routineId: number;
  routineName: string;
}

const ConfigureRoutineExercisesPage: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToastHelper();
  
  // Get the state from location or fallback to params
  const routineId = location.state?.routineId || Number(params.id);
  const routineName = location.state?.routineName || "";
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch routine exercises
  useEffect(() => {
    const fetchRoutineExercises = async () => {
      try {
        setIsLoading(true);
        
        const { data: routineData, error: routineError } = await supabase
          .from('routines')
          .select('name')
          .eq('id', routineId)
          .single();
          
        // Fetch routine exercises with their exercise details
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
          .eq('routine_id', routineId)
          .order('exercise_order', { ascending: true });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setExercises(data);
        } else {
          toast.showInfo(
            "Sin ejercicios",
            "Esta rutina no tiene ejercicios. Añade algunos."
          );
        }
      } catch (error) {
        console.error("Error fetching routine exercises:", error);
        toast.showError(
          "Error",
          "No se pudieron cargar los ejercicios de la rutina"
        );
      } finally {
        setIsLoading(false);
      }
    };
    
    if (routineId) {
      fetchRoutineExercises();
    } else {
      toast.showError(
        "Error",
        "No se pudo identificar la rutina"
      );
      navigate("/workout");
    }
  }, [routineId, navigate, toast]);

  const handleUpdateExercise = (index: number, field: string, value: string | number) => {
    setExercises(prev => 
      prev.map((ex, i) => 
        i === index 
          ? { ...ex, [field]: value } 
          : ex
      )
    );
  };

  const handleRemoveExercise = async (exerciseId: number, index: number) => {
    try {
      const { error } = await supabase
        .from('routine_exercises')
        .delete()
        .eq('id', exerciseId);
        
      if (error) throw error;
      
      setExercises(prev => prev.filter((_, i) => i !== index));
      
      toast.showSuccess(
        "Ejercicio eliminado",
        "El ejercicio fue eliminado de la rutina"
      );
    } catch (error) {
      console.error("Error removing exercise:", error);
      toast.showError(
        "Error",
        "No se pudo eliminar el ejercicio"
      );
    }
  };

  const handleSaveRoutine = async () => {
    try {
      setIsSaving(true);
      
      // Check for any invalid values
      const invalidExercise = exercises.find(ex => 
        ex.sets < 1 || 
        ex.reps_min < 1 || 
        ex.reps_max < ex.reps_min || 
        ex.rest_between_sets_seconds < 0
      );
      
      if (invalidExercise) {
        toast.showError(
          "Valores inválidos",
          "Por favor verifica que los valores sean correctos"
        );
        return;
      }
      
      // Update all exercises
      for (const exercise of exercises) {
        const { error } = await supabase
          .from('routine_exercises')
          .update({
            sets: exercise.sets,
            reps_min: exercise.reps_min,
            reps_max: exercise.reps_max,
            rest_between_sets_seconds: exercise.rest_between_sets_seconds,
            notes: exercise.notes
          })
          .eq('id', exercise.id);
          
        if (error) throw error;
      }
      
      // Update exercise count in the routine table
      await supabase
        .from('routines')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', routineId);
      
      toast.showSuccess(
        "Rutina guardada",
        "La configuración de la rutina ha sido guardada"
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
      setIsSaving(false);
    }
  };

  const handleAddMoreExercises = () => {
    navigate("/workout/select-exercises", { 
      state: { 
        routineId,
        routineName
      }
    });
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
            <div>
              <h1 className="text-xl font-bold">Configurar Rutina</h1>
              <p className="text-sm text-muted-foreground">{routineName}</p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Save className="h-4 w-4" />}
            onClick={handleSaveRoutine}
            disabled={isSaving || exercises.length === 0}
          >
            Guardar
          </Button>
        </div>
      </div>

      {/* Exercise List */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <p>Cargando ejercicios...</p>
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay ejercicios en esta rutina</p>
            <p className="text-sm mt-2">Añade ejercicios usando el botón de abajo</p>
            <Button
              variant="primary"
              className="mt-4"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleAddMoreExercises}
            >
              Añadir Ejercicios
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <Card key={exercise.id} className="animate-fade-in">
                <CardBody>
                  <div className="flex items-center mb-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <GripVertical className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{exercise.exercise.name}</h3>
                      <span className="text-xs text-muted-foreground">
                        {exercise.exercise.muscle_group_main}
                      </span>
                    </div>
                    <button 
                      className="p-2 rounded-full hover:bg-destructive/10 text-destructive"
                      onClick={() => handleRemoveExercise(exercise.id, index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Series</label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={exercise.sets}
                        onChange={(e) => handleUpdateExercise(index, 'sets', parseInt(e.target.value) || 1)}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Reps Min</label>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={exercise.reps_min}
                        onChange={(e) => handleUpdateExercise(index, 'reps_min', parseInt(e.target.value) || 1)}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Reps Max</label>
                      <Input
                        type="number"
                        min={exercise.reps_min}
                        max="50"
                        value={exercise.reps_max}
                        onChange={(e) => handleUpdateExercise(index, 'reps_max', parseInt(e.target.value) || exercise.reps_min)}
                        className="h-9"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Descanso (segundos)</label>
                    <select
                      value={exercise.rest_between_sets_seconds}
                      onChange={(e) => handleUpdateExercise(index, 'rest_between_sets_seconds', parseInt(e.target.value))}
                      className="w-full h-9 rounded-xl px-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="30">30s</option>
                      <option value="45">45s</option>
                      <option value="60">60s</option>
                      <option value="90">90s</option>
                      <option value="120">2min</option>
                      <option value="180">3min</option>
                    </select>
                  </div>
                  
                  <div className="mt-2">
                    <label className="block text-xs text-muted-foreground mb-1">Notas (opcional)</label>
                    <textarea
                      placeholder="Añadir notas para este ejercicio..."
                      value={exercise.notes || ''}
                      onChange={(e) => handleUpdateExercise(index, 'notes', e.target.value)}
                      className="w-full rounded-xl p-2 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none resize-none h-16 text-sm"
                    />
                  </div>
                </CardBody>
              </Card>
            ))}
            
            <div className="pt-4 pb-20 flex justify-center">
              <Button
                variant="secondary"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={handleAddMoreExercises}
              >
                Añadir Más Ejercicios
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigureRoutineExercisesPage;
