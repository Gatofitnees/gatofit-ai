import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardBody, CardHeader } from "@/components/Card";
import Button from "@/components/Button";
import { supabase } from "@/integrations/supabase/client";
import { RoutineExercise } from "@/features/workout/types";

interface RoutineData {
  id: number;
  name: string;
  type: string; // Ensuring this is defined in the interface
  description: string | null;
  estimated_duration_minutes: number | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_predefined: boolean;
  exercises: RoutineExercise[];
}

const RoutineDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [routine, setRoutine] = useState<RoutineData | null>(null);
  
  useEffect(() => {
    const fetchRoutineDetails = async () => {
      try {
        if (!id) return;
        
        // Fetch routine details
        const { data: routineData, error: routineError } = await supabase
          .from('routines')
          .select('*')
          .eq('id', parseInt(id))
          .single();
          
        if (routineError) throw routineError;
        
        // Fetch routine exercises
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('routine_exercises')
          .select(`
            *,
            exercise:exercise_id (
              id,
              name,
              muscle_group_main,
              equipment_required
            )
          `)
          .eq('routine_id', parseInt(id))
          .order('exercise_order', { ascending: true });
          
        if (exercisesError) throw exercisesError;
        
        // Process and format the exercise data
        const formattedExercises: RoutineExercise[] = exercisesData.map(item => {
          return {
            id: item.exercise.id.toString(),
            name: item.exercise.name,
            muscle_group_main: item.exercise.muscle_group_main,
            equipment_required: item.exercise.equipment_required,
            sets: [{
              reps_min: item.reps_min || 0,
              reps_max: item.reps_max || 0,
              rest_seconds: item.rest_between_sets_seconds || 60
            }]
          };
        });
        
        // Add the type property to routineData if it doesn't exist
        const routineWithType: RoutineData = {
          ...routineData,
          type: routineData.type || "strength", // Default type if missing from DB
          exercises: formattedExercises
        };
        
        setRoutine(routineWithType);
      } catch (error) {
        console.error("Error fetching routine details:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar los detalles de la rutina",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoutineDetails();
  }, [id, toast]);
  
  const handleStartWorkout = () => {
    // In a future implementation, this would start a workout session
    toast({
      title: "¡Rutina iniciada!",
      description: "Funcionalidad en desarrollo",
      variant: "success"
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 p-2 rounded-full hover:bg-secondary/50"
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Cargando rutina...</h1>
        </div>
        
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }
  
  if (!routine) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 p-2 rounded-full hover:bg-secondary/50"
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Rutina no encontrada</h1>
        </div>
        
        <Card>
          <CardBody>
            <p className="text-center py-8 text-muted-foreground">
              No se encontró la rutina o no tienes permisos para verla.
            </p>
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate("/workout")}
            >
              Volver a mis rutinas
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 p-2 rounded-full hover:bg-secondary/50"
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">{routine?.name}</h1>
      </div>
      
      <Card className="mb-4">
        <CardHeader 
          title="Información"
          subtitle={
            // Converting the JSX element to a string by using a renderer function
            // This pattern allows us to keep the JSX structure while satisfying TypeScript
            () => (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="px-2 py-0.5 rounded-full bg-secondary">
                  {routine?.type === "strength" ? "Fuerza" :
                   routine?.type === "cardio" ? "Cardio" :
                   routine?.type === "flexibility" ? "Flexibilidad" :
                   routine?.type === "mixed" ? "Mixto" : "Personalizado"}
                </span>
                {routine?.estimated_duration_minutes && (
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {routine.estimated_duration_minutes} min
                  </div>
                )}
                <span>{routine?.exercises.length} ejercicios</span>
              </div>
            )
          }
        />
        <CardBody>
          {routine?.description && (
            <p className="text-sm mb-4">{routine.description}</p>
          )}
          <Button
            variant="primary"
            leftIcon={<Play className="h-4 w-4" />}
            fullWidth
            onClick={handleStartWorkout}
          >
            Iniciar Entrenamiento
          </Button>
        </CardBody>
      </Card>
      
      <Card>
        <CardHeader title="Ejercicios" />
        <CardBody>
          <div className="space-y-4">
            {routine?.exercises.map((exercise, index) => (
              <div key={`${exercise.id}-${index}`} className="border-b border-secondary/30 pb-4 last:border-0">
                <h3 className="font-medium">{exercise.name}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground">
                    {exercise.muscle_group_main}
                  </span>
                  {exercise.equipment_required && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground">
                      {exercise.equipment_required}
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-2">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex justify-between text-sm">
                      <span>Serie {setIndex + 1}</span>
                      <div className="flex items-center gap-4">
                        <span>{set.reps_min}-{set.reps_max} reps</span>
                        <span>{set.rest_seconds}s descanso</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default RoutineDetailsPage;
