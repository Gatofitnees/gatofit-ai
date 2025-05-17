
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Timer, CheckCircle } from "lucide-react";
import Button from "@/components/Button";
import WorkoutExerciseCard from "@/components/workout/WorkoutExerciseCard";
import { useWorkoutSession } from "@/hooks/workout/useWorkoutSession";

const WorkoutSessionPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    routine,
    exercises,
    isLoading,
    activeExerciseIndex,
    remainingSeconds,
    workoutStarted,
    workoutCompleted,
    startWorkout,
    completeWorkout,
    handleSetComplete,
    handleRepsChange,
    handleWeightChange
  } = useWorkoutSession(id);
  
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
            <Button 
              variant="primary" 
              fullWidth
              onClick={() => navigate("/workout")}
            >
              Volver a mis rutinas
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {exercises.map((exercise, exerciseIndex) => (
              <WorkoutExerciseCard 
                key={exercise.id}
                exercise={exercise}
                isActive={exerciseIndex === activeExerciseIndex}
                onSetComplete={(setIndex) => handleSetComplete(exerciseIndex, setIndex)}
                onRepsChange={(setIndex, value) => handleRepsChange(exerciseIndex, setIndex, value)}
                onWeightChange={(setIndex, value) => handleWeightChange(exerciseIndex, setIndex, value)}
              />
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
