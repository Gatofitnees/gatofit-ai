
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WorkoutExercise } from "../types/workout";
import { useWorkoutNavigation } from "./useWorkoutNavigation";
import { useSaveWorkout } from "./useSaveWorkout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useActiveWorkout = (routineId?: number) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [routine, setRoutine] = useState<any | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStatsDialog, setShowStatsDialog] = useState<number | null>(null);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [workoutStartTime] = useState(new Date());
  
  // Hooks
  const { showDiscardDialog: navigationShowDiscardDialog, handleBack, confirmDiscardChanges, cancelDiscardChanges } = useWorkoutNavigation();
  const { isSaving, handleSaveWorkout } = useSaveWorkout(routine, workoutStartTime, exercises);
  
  // Fetch routine data
  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        setLoading(true);
        if (!routineId) {
          setLoading(false);
          return;
        }
        
        // Fetch routine details
        const { data: routineData, error: routineError } = await supabase
          .from('routines')
          .select('*')
          .eq('id', routineId)
          .single();
          
        if (routineError) {
          throw routineError;
        }
        
        if (!routineData) {
          setLoading(false);
          return;
        }
        
        setRoutine(routineData);
        
        // Fetch exercises for this routine
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('routine_exercises')
          .select(`
            id,
            exercise_order,
            reps_min,
            reps_max,
            rest_between_sets_seconds,
            notes,
            exercises (
              id,
              name,
              muscle_group_main,
              equipment_required
            )
          `)
          .eq('routine_id', routineId)
          .order('exercise_order', { ascending: true });
          
        if (exercisesError) {
          throw exercisesError;
        }
        
        // Transform data to the structure we need
        const transformedExercises = exercisesData.map((exercise: any) => {
          // Get previous workout data for this exercise (to show best/last performance)
          // This is just a placeholder - real implementation would fetch from DB
          
          // Create workout sets for this exercise
          const defaultReps = { min: exercise.reps_min || 8, max: exercise.reps_max || 12 };
          const defaultRest = exercise.rest_between_sets_seconds || 60;
          
          return {
            id: exercise.exercises.id,
            name: exercise.exercises.name,
            muscle_group_main: exercise.exercises.muscle_group_main,
            equipment_required: exercise.exercises.equipment_required,
            notes: exercise.notes || "",
            sets: [
              {
                set_number: 1,
                weight: null,
                reps: null,
                notes: "",
                previous_weight: 60,
                previous_reps: 10
              }
            ]
          };
        });
        
        setExercises(transformedExercises);
      } catch (error) {
        console.error("Error loading routine:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la rutina. Inténtalo de nuevo.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoutine();
  }, [routineId, toast]);
  
  // Form handlers
  const handleInputChange = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
    const newValue = value === '' ? null : Number(value);
    
    setExercises(prevState => {
      const updatedExercises = [...prevState];
      const updatedSets = [...updatedExercises[exerciseIndex].sets];
      
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        [field]: newValue
      };
      
      updatedExercises[exerciseIndex] = {
        ...updatedExercises[exerciseIndex],
        sets: updatedSets
      };
      
      return updatedExercises;
    });
  };
  
  const handleExerciseNotesChange = (exerciseIndex: number, notes: string) => {
    setExercises(prevState => {
      const updatedExercises = [...prevState];
      updatedExercises[exerciseIndex] = {
        ...updatedExercises[exerciseIndex],
        notes
      };
      return updatedExercises;
    });
  };
  
  const handleAddSet = (exerciseIndex: number) => {
    setExercises(prevState => {
      const updatedExercises = [...prevState];
      const currentSets = updatedExercises[exerciseIndex].sets;
      const newSetNumber = currentSets.length + 1;
      
      // Copy the previous set's weight if available
      const prevSet = currentSets[currentSets.length - 1];
      const prevWeight = prevSet && prevSet.weight !== null ? prevSet.weight : null;
      
      updatedExercises[exerciseIndex].sets = [
        ...currentSets,
        {
          set_number: newSetNumber,
          weight: prevWeight,
          reps: null,
          notes: "",
          previous_weight: null,
          previous_reps: null
        }
      ];
      
      return updatedExercises;
    });
  };
  
  const handleReorderDrag = (result: any) => {
    if (!result.destination) return;
    
    const reorderedExercises = Array.from(exercises);
    const [removed] = reorderedExercises.splice(result.source.index, 1);
    reorderedExercises.splice(result.destination.index, 0, removed);
    
    setExercises(reorderedExercises);
  };
  
  const handleToggleReorderMode = () => {
    setIsReorderMode(!isReorderMode);
  };
  
  const handleViewExerciseDetails = (exerciseId: number) => {
    navigate(`/workout/exercise-details/${exerciseId}?returnTo=/workout/active/${routineId}`);
  };
  
  return {
    // State
    routine,
    exercises,
    loading,
    isSaving,
    showStatsDialog,
    showDiscardDialog: navigationShowDiscardDialog,
    isReorderMode,
    
    // Handlers
    handleInputChange,
    handleExerciseNotesChange,
    handleAddSet,
    handleBack,
    handleSaveWorkout,
    handleReorderDrag,
    handleViewExerciseDetails,
    handleAddExercise: () => {}, // Este se reemplaza en el componente
    confirmDiscardChanges,
    cancelDiscardChanges,
    setShowStatsDialog,
    handleToggleReorderMode
  };
};
