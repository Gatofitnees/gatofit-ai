
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Exercise {
  id: number;
  name: string;
  muscle_group_main: string;
  equipment_required?: string;
  difficulty_level?: string;
  video_url?: string;
  description?: string;
}

const preloadedExercises: Exercise[] = [
  {
    id: 1001,
    name: "Aperturas con mancuernas en banco inclinado",
    muscle_group_main: "Pecho",
    equipment_required: "Mancuernas",
    difficulty_level: "Intermedio",
    description: "Este ejercicio trabaja principalmente los músculos pectorales superiores. Se realiza acostado en un banco inclinado sosteniendo mancuernas en cada mano.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/aperturas-con-mancuernas-en-banco-inclinado.mp4",
  },
  {
    id: 1002,
    name: "Aperturas con mancuernas",
    muscle_group_main: "Pecho",
    equipment_required: "Mancuernas",
    difficulty_level: "Intermedio",
    description: "Este ejercicio trabaja los músculos pectorales de forma aislada. Se realiza acostado en un banco plano sosteniendo mancuernas en cada mano.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/aperturas-con-mancuernas.mp4",
  },
  {
    id: 1003,
    name: "Aperturas en maquina",
    muscle_group_main: "Pecho",
    equipment_required: "Maquina",
    difficulty_level: "Principiante",
    description: "Este ejercicio aísla los músculos pectorales utilizando una máquina especializada que proporciona resistencia constante a lo largo del movimiento.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/aperturas-en-maquina.mp4",
  },
  {
    id: 1004,
    name: "Aperturas en polea",
    muscle_group_main: "Pecho",
    equipment_required: "Polea",
    difficulty_level: "Intermedio",
    description: "Este ejercicio trabaja los músculos pectorales utilizando poleas, lo que proporciona tensión constante durante todo el movimiento.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/aperturas-en-polea-alta.mp4",
  }
];

export const useExercises = () => {
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { data, error } = await supabase
          .from('exercises')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          setExercises(data);
        } else {
          // If no data returned from DB, use preloaded exercises
          setExercises(preloadedExercises);
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
        // Fallback to preloaded exercises if fetch fails
        setExercises(preloadedExercises);
        toast({
          title: "Error",
          description: "No se pudieron cargar los ejercicios",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [toast]);

  // Extract unique values for filter options
  const muscleGroups = Array.from(new Set(exercises.map(e => e.muscle_group_main).filter(Boolean))) as string[];
  const equipmentTypes = Array.from(new Set(exercises.map(e => e.equipment_required).filter(Boolean))) as string[];

  return {
    exercises,
    loading,
    muscleGroups,
    equipmentTypes
  };
};
