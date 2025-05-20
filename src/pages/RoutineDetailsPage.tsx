
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Timer, Clock, Play, Info } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/Card";
import Button from "@/components/Button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RoutineData, RoutineExercise } from "@/features/workout/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const RoutineDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [routine, setRoutine] = useState<RoutineData | null>(null);
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutineDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        
        // Fetch routine data
        const { data: routineData, error: routineError } = await supabase
          .from('routines')
          .select('*')
          .eq('id', id)
          .single();
        
        if (routineError) throw routineError;
        
        // Fetch routine exercises
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('routine_exercises')
          .select(`
            *,
            exercise:exercise_id (
              id, name, muscle_group_main, equipment_required
            )
          `)
          .eq('routine_id', id)
          .order('exercise_order', { ascending: true });
        
        if (exercisesError) throw exercisesError;
        
        // Transform exercise data to match RoutineExercise type
        const formattedExercises: RoutineExercise[] = exercisesData.map(item => {
          return {
            id: item.exercise.id.toString(),
            name: item.exercise.name,
            muscle_group_main: item.exercise.muscle_group_main,
            equipment_required: item.exercise.equipment_required,
            sets: [
              {
                reps_min: item.reps_min,
                reps_max: item.reps_max,
                rest_seconds: item.rest_between_sets_seconds
              }
            ]
          };
        });
        
        setRoutine(routineData);
        setExercises(formattedExercises);
      } catch (error) {
        console.error('Error fetching routine details:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la rutina",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoutineDetails();
  }, [id, toast]);

  const handleStartWorkout = () => {
    // In a future implementation, this would navigate to a workout session page
    toast({
      title: "¡Entrenamiento iniciado!",
      description: "Funcionalidad en desarrollo"
    });
  };

  const handleBack = () => {
    navigate("/workout");
  };

  return (
    <div className="min-h-screen pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background p-4 border-b border-muted/20">
        <div className="flex items-center mb-2">
          <button 
            onClick={handleBack}
            className="mr-3 p-1 rounded-full hover:bg-secondary/50"
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">
            {loading ? <Skeleton className="h-7 w-48" /> : routine?.name}
          </h1>
        </div>
      </div>

      {/* Routine Details */}
      {loading ? (
        <div className="p-4 space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Routine Info Card */}
          <Card className="bg-secondary/40">
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-primary mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duración</p>
                    <p className="font-medium">{routine?.estimated_duration_minutes} min</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Info className="h-5 w-5 text-primary mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium">{routine?.type || "General"}</p>
                  </div>
                </div>
              </div>
              {routine?.description && (
                <div className="mt-4 pt-4 border-t border-muted/20">
                  <p className="text-sm text-muted-foreground">{routine.description}</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Exercises List */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Ejercicios</h2>
            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <Card key={`${exercise.id}-${index}`} className="bg-secondary/20">
                  <CardBody>
                    <div className="flex items-center mb-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <span className="font-medium text-primary">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{exercise.name}</h4>
                        <span className="text-xs text-muted-foreground">
                          {exercise.muscle_group_main}
                          {exercise.equipment_required && ` • ${exercise.equipment_required}`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-background/40 rounded-lg p-3">
                      <Table className="w-full border-collapse">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-1/4 text-center py-1 px-2 text-xs font-medium">Serie</TableHead>
                            <TableHead className="w-2/4 text-center py-1 px-2 text-xs font-medium">Repeticiones</TableHead>
                            <TableHead className="w-1/4 text-center py-1 px-2 text-xs font-medium">Descanso</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {exercise.sets.map((set, setIndex) => (
                            <TableRow key={setIndex}>
                              <TableCell className="text-center py-2 px-2">{setIndex + 1}</TableCell>
                              <TableCell className="text-center py-2 px-2">
                                {set.reps_min === set.reps_max ? 
                                  set.reps_min : 
                                  `${set.reps_min}-${set.reps_max}`
                                }
                              </TableCell>
                              <TableCell className="text-center py-2 px-2">
                                {set.rest_seconds >= 60 
                                  ? `${Math.floor(set.rest_seconds / 60)} min` 
                                  : `${set.rest_seconds} seg`
                                }
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>

          {/* Start Workout Button */}
          <div className="fixed bottom-20 left-0 right-0 p-4 flex justify-center">
            <Button
              variant="primary"
              className="shadow-neu-float px-6 bg-blue-500 hover:bg-blue-600"
              leftIcon={<Play className="h-4 w-4" />}
              onClick={handleStartWorkout}
            >
              Iniciar entrenamiento
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineDetailsPage;
