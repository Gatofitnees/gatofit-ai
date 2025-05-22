
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Plus, Dumbbell } from "lucide-react";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/Card";
import Button from "@/components/Button";
import { supabase } from "@/integrations/supabase/client";
import { useExercises } from "@/hooks/useExercises";
import { useToast } from "@/components/ui/use-toast";
import ExerciseHistoryDialog from "@/components/exercise/ExerciseHistoryDialog";
import { toast as sonnerToast } from "sonner";

interface Exercise {
  id: number | string;
  name: string;
  description?: string;
  muscle_group_main: string;
  equipment_required?: string;
  difficulty_level?: string;
  video_url?: string;
  created_by_user_id?: string;
}

const ExerciseDetailsPage: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { exercises, loading: exercisesLoading } = useExercises();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  // Obtener la ruta de retorno de la URL
  const getReturnPath = () => {
    const searchParams = new URLSearchParams(location.search);
    const returnTo = searchParams.get('returnTo');
    return returnTo || '/workout';
  };

  useEffect(() => {
    const fetchExerciseDetails = async () => {
      try {
        setLoading(true);
        
        if (!id) return;
        
        // Try to find exercise in our list by matching either string or number ID
        const numericId = parseInt(id);
        const foundExercise = exercises.find(ex => 
          ex.id === numericId || ex.id.toString() === id
        );
        
        if (foundExercise) {
          setExercise(foundExercise);
        } else {
          toast({
            title: "Error",
            description: "No se pudo encontrar el ejercicio",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching exercise details:", error);
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar el ejercicio",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (exercises.length > 0) {
      fetchExerciseDetails();
    }
  }, [id, exercises, toast]);

  const handleAddToRoutine = () => {
    // Verificar si venimos de una rutina en creación
    const searchParams = new URLSearchParams(location.search);
    const returnTo = searchParams.get('returnTo');
    
    if (returnTo && returnTo.includes('/workout/create')) {
      // Añadir el ejercicio a la rutina en creación
      if (exercise) {
        // Preparar el ejercicio para agregarlo a la rutina
        const exerciseToAdd = {
          ...exercise,
          sets: [{ reps_min: 8, reps_max: 12, rest_seconds: 60 }]
        };
        
        // Mostrar notificación
        sonnerToast.success("Ejercicio añadido a la rutina");
        
        // Navegar de vuelta a la pantalla de creación de rutina con el ejercicio
        navigate('/workout/create', { 
          state: { selectedExercises: [exerciseToAdd] } 
        });
      }
    } else if (returnTo && returnTo.includes('/workout/active/')) {
      // Añadir el ejercicio al entrenamiento activo
      if (exercise) {
        // Preparar el ejercicio para agregarlo al entrenamiento activo
        const exerciseToAdd = {
          ...exercise,
          sets: [{ 
            set_number: 1, 
            weight: null, 
            reps: null, 
            notes: "", 
            previous_weight: null, 
            previous_reps: null 
          }]
        };
        
        // Mostrar notificación
        sonnerToast.success("Ejercicio añadido al entrenamiento");
        
        // Navegar de vuelta a la pantalla de entrenamiento activo con el ejercicio
        navigate(getReturnPath(), { 
          state: { selectedExercises: [exerciseToAdd] } 
        });
      }
    } else {
      // Si no venimos de una rutina, simplemente volvemos
      navigate(-1);
    }
  };

  const handleEditExercise = () => {
    navigate(`/workout/edit-exercise/${id}`);
  };

  if (exercisesLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Cargando...</div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-lg font-medium mb-2">Ejercicio no encontrado</h2>
        <Button variant="primary" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background p-4">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-3 p-1 rounded-full hover:bg-secondary/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Detalles del Ejercicio</h1>
        </div>
      </div>

      <div className="p-4">
        {/* Video/Image Section */}
        <div className="relative aspect-video bg-secondary rounded-xl overflow-hidden mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            {exercise.video_url ? (
              <video 
                src={exercise.video_url} 
                className="w-full h-full object-cover"
                autoPlay 
                loop 
                muted 
                controls 
              />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Dumbbell className="h-12 w-12 text-muted-foreground" />
                <span className="text-sm text-muted-foreground mt-2">
                  Sin video disponible
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Exercise Info */}
        <Card className="mb-5">
          <CardHeader title={exercise.name} />
          <CardBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-background/40 p-3 rounded-lg">
                  <span className="text-xs text-muted-foreground block mb-1">Grupo Muscular</span>
                  <span className="font-medium">{exercise.muscle_group_main}</span>
                </div>
                <div className="bg-background/40 p-3 rounded-lg">
                  <span className="text-xs text-muted-foreground block mb-1">Equipamiento</span>
                  <span className="font-medium">{exercise.equipment_required || "Ninguno"}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Descripción</h3>
                <p className="text-sm text-muted-foreground">
                  {exercise.description || "No hay descripción disponible para este ejercicio."}
                </p>
              </div>
            </div>
          </CardBody>
          <CardFooter>
            <ExerciseHistoryDialog 
              exerciseId={Number(exercise.id)} 
              exerciseName={exercise.name} 
            />
          </CardFooter>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-3">
          <Button 
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={handleAddToRoutine}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Añadir a Rutina
          </Button>
          
          {/* Edit button only for user-created exercises */}
          {exercise.created_by_user_id && (
            <Button 
              variant="outline"
              onClick={handleEditExercise}
            >
              Editar Ejercicio
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailsPage;
