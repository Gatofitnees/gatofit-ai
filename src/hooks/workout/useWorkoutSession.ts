
import { useState, useEffect } from "react";
import { useToastHelper } from "@/hooks/useToastHelper";
import { supabase } from "@/integrations/supabase/client";

export interface ExerciseSet {
  id: number;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
}

export interface WorkoutExercise {
  id: number;
  exerciseId: number;
  name: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  order: number;
  currentSet: number;
  exerciseSets: ExerciseSet[];
}

export interface WorkoutRoutine {
  id: number;
  name: string;
  type: string;
}

export const useWorkoutSession = (routineId: string | undefined) => {
  const [routine, setRoutine] = useState<WorkoutRoutine | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [workoutLogId, setWorkoutLogId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const toast = useToastHelper();

  // Fetch routine details and exercises
  useEffect(() => {
    const fetchRoutineData = async () => {
      if (!routineId) return;
      
      try {
        setIsLoading(true);
        
        // Fetch routine details
        const { data: routineData, error: routineError } = await supabase
          .from('routines')
          .select('*')
          .eq('id', parseInt(routineId))
          .single();
        
        if (routineError) throw routineError;
        
        // Set the routine type safely
        const routineType = (routineData as any).type || "Mixto";
        
        setRoutine({
          id: routineData.id,
          name: routineData.name,
          type: routineType
        });
        
        // Fetch exercises for this routine
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('routine_exercises')
          .select(`
            id, 
            exercise_order,
            sets,
            reps_min,
            reps_max,
            rest_between_sets_seconds,
            exercises:exercise_id (id, name)
          `)
          .eq('routine_id', parseInt(routineId))
          .order('exercise_order', { ascending: true });
        
        if (exercisesError) throw exercisesError;
        
        if (exercisesData) {
          const formattedExercises: WorkoutExercise[] = exercisesData.map(ex => {
            // Create sets for each exercise
            const exerciseSets: ExerciseSet[] = [];
            for (let i = 1; i <= (ex.sets || 3); i++) {
              exerciseSets.push({
                id: i,
                setNumber: i,
                weight: null,
                reps: null, 
                completed: false
              });
            }
            
            return {
              id: ex.id,
              exerciseId: ex.exercises.id,
              name: ex.exercises.name,
              sets: ex.sets || 3,
              repsMin: ex.reps_min || 8,
              repsMax: ex.reps_max || 12,
              restSeconds: ex.rest_between_sets_seconds || 60,
              order: ex.exercise_order,
              currentSet: 1,
              exerciseSets
            };
          });
          
          setExercises(formattedExercises);
        }
      } catch (error) {
        console.error("Error fetching routine:", error);
        toast.showError(
          "Error", 
          "No se pudo cargar la rutina"
        );
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRoutineData();
  }, [routineId, toast]);
  
  // Timer effect
  useEffect(() => {
    let timer: number;
    if (isTimerRunning && remainingSeconds > 0) {
      timer = window.setTimeout(() => {
        setRemainingSeconds(prev => prev - 1);
      }, 1000);
    } else if (isTimerRunning && remainingSeconds === 0) {
      setIsTimerRunning(false);
      toast.showInfo("¡Descanso completado!", "Continúa con tu ejercicio");
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isTimerRunning, remainingSeconds, toast]);
  
  const startWorkout = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.showError("Error", "Debes iniciar sesión");
        return;
      }
      
      // Create workout log entry
      const now = new Date();
      setStartTime(now);
      
      const { data: logData, error: logError } = await supabase
        .from('workout_logs')
        .insert({
          user_id: session.session.user.id,
          routine_id: routineId ? parseInt(routineId) : null,
          routine_name_snapshot: routine?.name,
          workout_date: now.toISOString()
        })
        .select()
        .single();
      
      if (logError) throw logError;
      
      setWorkoutLogId(logData.id);
      setWorkoutStarted(true);
      toast.showSuccess("¡Entrenamiento iniciado!");
    } catch (error) {
      console.error("Error starting workout:", error);
      toast.showError("Error", "No se pudo iniciar el entrenamiento");
    }
  };
  
  const completeWorkout = async () => {
    if (!workoutLogId || !startTime) return;
    
    try {
      // Calculate duration in minutes
      const endTime = new Date();
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = Math.round(durationMs / (1000 * 60));
      
      // Update workout log with completion details
      const { error } = await supabase
        .from('workout_logs')
        .update({
          duration_completed_minutes: durationMinutes
        })
        .eq('id', workoutLogId);
      
      if (error) throw error;
      
      setWorkoutCompleted(true);
      toast.showSuccess("¡Entrenamiento completado!", "¡Excelente trabajo!");
      
    } catch (error) {
      console.error("Error completing workout:", error);
      toast.showError("Error", "No se pudo completar el entrenamiento");
    }
  };
  
  const handleSetComplete = async (exerciseIndex: number, setIndex: number) => {
    if (!workoutLogId) return;
    
    try {
      // Update the local state
      const updatedExercises = [...exercises];
      const currentExercise = updatedExercises[exerciseIndex];
      const currentSet = currentExercise.exerciseSets[setIndex];
      
      // Mark the set as completed
      currentSet.completed = true;
      
      // Log the completed set to the database
      const { error } = await supabase
        .from('workout_log_exercise_details')
        .insert({
          workout_log_id: workoutLogId,
          exercise_id: currentExercise.exerciseId,
          exercise_name_snapshot: currentExercise.name,
          set_number: currentSet.setNumber,
          reps_completed: currentSet.reps || 0,
          weight_kg_used: currentSet.weight || 0
        });
      
      if (error) throw error;
      
      // If there's another set, move to it and start the rest timer
      if (setIndex < currentExercise.exerciseSets.length - 1) {
        currentExercise.currentSet = setIndex + 2; // +2 because setIndex is 0-based and we want the next set
        setRemainingSeconds(currentExercise.restSeconds);
        setIsTimerRunning(true);
      } 
      // If this was the last set but there's another exercise
      else if (exerciseIndex < exercises.length - 1) {
        toast.showInfo("¡Ejercicio completado!", "Pasa al siguiente ejercicio");
        setActiveExerciseIndex(exerciseIndex + 1);
      } 
      // If this was the last exercise and last set
      else {
        toast.showSuccess("¡Todos los ejercicios completados!", "¡Terminaste la rutina!");
      }
      
      setExercises(updatedExercises);
    } catch (error) {
      console.error("Error logging set:", error);
      toast.showError("Error", "No se pudo registrar el set");
    }
  };
  
  const handleRepsChange = (exerciseIndex: number, setIndex: number, value: string) => {
    const reps = parseInt(value);
    if (isNaN(reps)) return;
    
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].exerciseSets[setIndex].reps = reps;
    setExercises(updatedExercises);
  };
  
  const handleWeightChange = (exerciseIndex: number, setIndex: number, value: string) => {
    const weight = parseFloat(value);
    if (isNaN(weight)) return;
    
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].exerciseSets[setIndex].weight = weight;
    setExercises(updatedExercises);
  };

  return {
    routine,
    exercises,
    isLoading,
    activeExerciseIndex,
    remainingSeconds,
    isTimerRunning,
    workoutStarted,
    workoutCompleted,
    startWorkout,
    completeWorkout,
    handleSetComplete,
    handleRepsChange,
    handleWeightChange
  };
};
