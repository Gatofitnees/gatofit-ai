
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, LineChart, Dumbbell } from "lucide-react";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/Card";
import Button from "@/components/Button";
import { supabase } from "@/integrations/supabase/client";

interface Exercise {
  id: string;
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
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExerciseDetails = async () => {
      try {
        setLoading(true);
        
        if (!id) return;
        
        // In a real app, we'd use the actual ID from params
        // For now using mockdata - in production this would query Supabase
        const mockExercises = [
          {
            id: "1001",
            name: "Aperturas con mancuernas en banco inclinado",
            description: "Este ejercicio trabaja principalmente los músculos pectorales superiores. Se realiza acostado en un banco inclinado sosteniendo mancuernas en cada mano.",
            muscle_group_main: "Pecho",
            equipment_required: "Mancuernas",
            difficulty_level: "Intermedio",
            video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/aperturas-con-mancuernas-en-banco-inclinado.mp4",
            created_by_user_id: null
          },
          {
            id: "1002",
            name: "Aperturas con mancuernas",
            description: "Este ejercicio trabaja los músculos pectorales de forma aislada. Se realiza acostado en un banco plano sosteniendo mancuernas en cada mano.",
            muscle_group_main: "Pecho",
            equipment_required: "Mancuernas",
            difficulty_level: "Intermedio",
            video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/aperturas-con-mancuernas.mp4",
            created_by_user_id: null
          },
          {
            id: "1003",
            name: "Aperturas en maquina",
            description: "Este ejercicio aísla los músculos pectorales utilizando una máquina especializada que proporciona resistencia constante a lo largo del movimiento.",
            muscle_group_main: "Pecho",
            equipment_required: "Maquina",
            difficulty_level: "Principiante",
            video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/aperturas-en-maquina.mp4",
            created_by_user_id: null
          },
          {
            id: "1004",
            name: "Aperturas en polea",
            description: "Este ejercicio trabaja los músculos pectorales utilizando poleas, lo que proporciona tensión constante durante todo el movimiento.",
            muscle_group_main: "Pecho",
            equipment_required: "Polea",
            difficulty_level: "Intermedio",
            video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/aperturas-en-polea-alta.mp4",
            created_by_user_id: null
          }
        ];
        
        const foundExercise = mockExercises.find(ex => ex.id === id);
        
        if (foundExercise) {
          setExercise(foundExercise);
        }
      } catch (error) {
        console.error("Error fetching exercise details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExerciseDetails();
  }, [id]);

  const handleAddToRoutine = () => {
    // Add to routine and navigate back
    navigate(-1);
  };

  const handleEditExercise = () => {
    navigate(`/workout/edit-exercise/${id}`);
  };

  const showHistoryGraph = () => {
    // In a real app, this would open a modal with exercise history
    console.log("Show exercise history");
  };

  if (loading) {
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
            <Button 
              variant="outline"
              leftIcon={<LineChart className="h-4 w-4" />}
              className="mr-2"
              onClick={showHistoryGraph}
              fullWidth
            >
              Ver Historial
            </Button>
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
