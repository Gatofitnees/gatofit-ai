
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";

interface WorkoutRoutine {
  id: number;
  name: string;
  description?: string;
  type?: string;
  estimated_duration_minutes?: number;
}

interface WorkoutSet {
  set_number: number;
  weight: number | null;
  reps: number | null;
  notes: string;
  previous_weight: number | null;
  previous_reps: number | null;
}

interface WorkoutExercise {
  id: number;
  name: string;
  sets: WorkoutSet[];
  muscle_group_main?: string;
  equipment_required?: string;
  notes: string;
}

export const useActiveWorkout = (routineId?: number) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [routine, setRoutine] = useState<WorkoutRoutine | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState<number | null>(null);
  const [isReorderMode, setIsReorderMode] = useState(false);
  
  // Cargar la rutina y sus ejercicios
  useEffect(() => {
    const loadRoutine = async () => {
      if (!routineId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Obtener la rutina
        const { data: routineData, error: routineError } = await supabase
          .from('routines')
          .select('*')
          .eq('id', routineId)
          .single();
        
        if (routineError) throw routineError;
        
        if (!routineData) {
          toast({
            title: "Error",
            description: "No se encontró la rutina",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        setRoutine(routineData);
        
        // Obtener los ejercicios de la rutina
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('routine_exercises')
          .select(`
            id,
            exercise_id,
            exercise_order,
            exercises (
              id,
              name,
              muscle_group_main,
              equipment_required
            )
          `)
          .eq('routine_id', routineId)
          .order('exercise_order');
          
        if (exercisesError) throw exercisesError;
        
        if (!exercisesData || exercisesData.length === 0) {
          toast({
            title: "Rutina vacía",
            description: "Esta rutina no tiene ejercicios",
            variant: "default"
          });
          setExercises([]);
          setLoading(false);
          return;
        }
        
        // Preparar los ejercicios con sus sets
        const formattedExercises: WorkoutExercise[] = exercisesData.map(item => {
          // Obtener los datos del ejercicio anidado
          const exercise = item.exercises;
          
          // Crear sets por defecto para cada ejercicio
          const defaultSets = Array(3).fill(0).map((_, idx) => ({
            set_number: idx + 1,
            weight: null,
            reps: null,
            notes: "",
            previous_weight: null,
            previous_reps: null
          }));
          
          return {
            id: exercise.id,
            name: exercise.name,
            muscle_group_main: exercise.muscle_group_main,
            equipment_required: exercise.equipment_required,
            sets: defaultSets,
            notes: ""
          };
        });
        
        setExercises(formattedExercises);
      } catch (error: any) {
        console.error("Error loading routine:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la rutina: " + error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadRoutine();
  }, [routineId, toast]);

  // Manejar ejercicios añadidos desde la pantalla de selección
  useEffect(() => {
    if (location.state && location.state.selectedExercises) {
      const newExercises = location.state.selectedExercises;
      
      // Añadir los nuevos ejercicios a la lista existente
      setExercises((currentExercises) => {
        // Crear una lista de IDs existentes para evitar duplicados
        const existingIds = new Set(currentExercises.map(ex => ex.id));
        
        // Filtrar solo los ejercicios nuevos
        const uniqueNewExercises = newExercises.filter((ex: any) => !existingIds.has(ex.id));
        
        // Añadir los nuevos ejercicios al final
        return [...currentExercises, ...uniqueNewExercises];
      });
      
      // Limpiar el estado para evitar duplicaciones
      if (window.history.state) {
        const newState = { ...window.history.state };
        if (newState.usr && newState.usr.selectedExercises) {
          delete newState.usr.selectedExercises;
          window.history.replaceState(newState, '');
        }
      }
    }
  }, [location.state]);

  const handleInputChange = useCallback((exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
    // Solo permitir valores numéricos o vacíos
    if (value !== '' && isNaN(Number(value))) {
      return;
    }
    
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value === '' ? null : Number(value);
    setExercises(updatedExercises);
  }, [exercises]);
  
  const handleExerciseNotesChange = useCallback((exerciseIndex: number, notes: string) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].notes = notes;
    setExercises(updatedExercises);
  }, [exercises]);
  
  const handleAddSet = useCallback((exerciseIndex: number) => {
    const updatedExercises = [...exercises];
    const currentSets = updatedExercises[exerciseIndex].sets;
    const nextSetNumber = currentSets.length + 1;
    
    updatedExercises[exerciseIndex].sets.push({
      set_number: nextSetNumber,
      weight: currentSets[currentSets.length - 1].weight,
      reps: currentSets[currentSets.length - 1].reps,
      notes: "",
      previous_weight: null,
      previous_reps: null
    });
    
    setExercises(updatedExercises);
  }, [exercises]);
  
  const handleBack = useCallback(() => {
    // Confirmación si hay cambios pendientes
    navigate('/workout');
  }, [navigate]);
  
  const handleSaveWorkout = useCallback(async () => {
    if (!routine) return;
    
    try {
      setIsSaving(true);
      sonnerToast.loading("Guardando entrenamiento...");
      
      // Simular guardado (implementar lógica real aquí)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mostrar confirmación
      sonnerToast.success("Entrenamiento guardado correctamente");
      
      // Redirigir a la página de resumen
      navigate('/workout');
    } catch (error: any) {
      console.error("Error saving workout:", error);
      sonnerToast.dismiss();
      toast({
        title: "Error",
        description: "No se pudo guardar el entrenamiento: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [routine, navigate, toast]);
  
  const handleReorderDrag = useCallback((result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(exercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setExercises(items);
  }, [exercises]);
  
  const handleViewExerciseDetails = useCallback((exerciseId: number) => {
    navigate(`/workout/exercise-details/${exerciseId}?returnTo=${encodeURIComponent(`/workout/active/${routineId}`)}`);
  }, [navigate, routineId]);

  const handleAddExercise = useCallback(() => {
    navigate(`/workout/select-exercises?returnTo=${encodeURIComponent(`/workout/active/${routineId}`)}`);
  }, [navigate, routineId]);
  
  const handleToggleReorderMode = useCallback(() => {
    setIsReorderMode(prev => !prev);
  }, []);
  
  return {
    routine,
    exercises,
    loading,
    isSaving,
    showStatsDialog,
    isReorderMode,
    handleInputChange,
    handleExerciseNotesChange,
    handleAddSet,
    handleBack,
    handleSaveWorkout,
    handleReorderDrag,
    handleViewExerciseDetails,
    handleAddExercise,
    setShowStatsDialog,
    handleToggleReorderMode
  };
};
