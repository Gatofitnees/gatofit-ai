import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, Timer, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardBody } from "@/components/Card";
import Button from "@/components/Button";
import { useToastHelper } from "@/hooks/useToastHelper";
import { supabase } from "@/integrations/supabase/client";

interface ExerciseSet {
  id: number;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
}

interface WorkoutExercise {
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

const WorkoutSessionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToastHelper();
  
  const [routine, setRoutine] = useState<{ id: number; name: string; type: string; } | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [workoutLogId, setWorkoutLogId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // Fetch routine details and exercises
  useEffect(() => {
    const fetchRoutineData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch routine details
        const { data: routineData, error: routineError } = await supabase
          .from('routines')
          .select('*')
          .eq('id', parseInt(id)) // Convert string to number here
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
          .eq('routine_id', parseInt(id)) // Convert string to number here
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
  }, [id, toast]);
  
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
          routine_id: id ? parseInt(id) : null, // Convert string to number safely
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
      
      // Navigate back to workout page after a short delay
      setTimeout(() => {
        navigate("/workout");
      }, 2000);
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
  
  if (isLoading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <p>Cargando rutina...</p>
      </div>
    );
  }
  
  if (!routine) {
    return (
      <div className="min-h-screen p-4">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => navigate("/workout")}
            className="mr-3 p-1 rounded-full hover:bg-secondary/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Rutina no encontrada</h1>
        </div>
        <p className="text-center py-12">No se pudo encontrar la rutina solicitada.</p>
        <Button 
          variant="primary" 
          fullWidth
          onClick={() => navigate("/workout")}
        >
          Volver a mis rutinas
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background p-4 border-b border-muted/20">
        <div className="flex items-center mb-2">
          <button 
            onClick={() => navigate("/workout")}
            className="mr-3 p-1 rounded-full hover:bg-secondary/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">{routine.name}</h1>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {routine.type} • {exercises.length} ejercicios
          </span>
          
          {remainingSeconds > 0 && (
            <div className="flex items-center text-sm font-medium">
              <Timer className="h-4 w-4 mr-1 text-primary animate-pulse" />
              <span className="text-primary">
                Descanso: {Math.floor(remainingSeconds / 60)}:{(remainingSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4">
        {!workoutStarted ? (
          <div className="pt-8 pb-4 text-center">
            <h2 className="text-lg font-medium mb-8">¿Listo para comenzar tu entrenamiento?</h2>
            <Button 
              variant="primary" 
              fullWidth 
              onClick={startWorkout}
              leftIcon={<Play className="h-4 w-4" />}
            >
              Iniciar Entrenamiento
            </Button>
          </div>
        ) : workoutCompleted ? (
          <div className="pt-8 pb-4 text-center">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-lg font-medium">¡Entrenamiento Completado!</h2>
            <p className="text-sm text-muted-foreground mt-2 mb-8">
              ¡Felicidades por completar tu rutina!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {exercises.map((exercise, exerciseIndex) => (
              <Card 
                key={exercise.id}
                className={exerciseIndex === activeExerciseIndex ? "border-primary" : ""}
              >
                <CardBody>
                  <div className="mb-4">
                    <h3 className="font-medium">{exerciseIndex + 1}. {exercise.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {exercise.sets} series • {exercise.repsMin}-{exercise.repsMax} repeticiones
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {exercise.exerciseSets.map((set, setIndex) => (
                      <div 
                        key={set.id} 
                        className={`flex items-center p-2 rounded-lg ${
                          exerciseIndex === activeExerciseIndex && 
                          set.setNumber === exercise.currentSet 
                            ? "bg-primary/10" 
                            : "bg-secondary/30"
                        } ${set.completed ? "opacity-50" : ""}`}
                      >
                        <span className="text-sm font-medium w-8">
                          {set.setNumber}/{exercise.sets}
                        </span>
                        
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="kg"
                            className="w-14 h-8 px-2 rounded bg-background border-none text-sm"
                            value={set.weight !== null ? set.weight : ""}
                            onChange={(e) => handleWeightChange(exerciseIndex, setIndex, e.target.value)}
                            disabled={set.completed}
                          />
                          <input
                            type="number"
                            placeholder="reps"
                            className="w-14 h-8 px-2 rounded bg-background border-none text-sm"
                            value={set.reps !== null ? set.reps : ""}
                            onChange={(e) => handleRepsChange(exerciseIndex, setIndex, e.target.value)}
                            disabled={set.completed}
                          />
                        </div>
                        
                        <Button
                          variant={set.completed ? "outline" : "primary"}
                          size="sm"
                          className="min-w-8 h-8 p-1"
                          onClick={() => handleSetComplete(exerciseIndex, setIndex)}
                          disabled={set.completed}
                        >
                          {set.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            "Hecho"
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))}
            
            <Button
              variant="primary"
              fullWidth
              onClick={completeWorkout}
              className="mt-8"
            >
              Finalizar Entrenamiento
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutSessionPage;
