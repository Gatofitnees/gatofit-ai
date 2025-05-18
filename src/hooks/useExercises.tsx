
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
}

const preloadedExercises: Exercise[] = [
  {
    id: 1001,
    name: "Aperturas con mancuernas en banco inclinado",
    muscle_group_main: "Pecho",
    equipment_required: "Mancuernas",
    video_url: "https://storage.cloud.google.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/aperturas-con-mancuernas-en-banco-inclinado.mp4",
  },
  {
    id: 1002,
    name: "Aperturas con mancuernas",
    muscle_group_main: "Pecho",
    equipment_required: "Mancuernas",
    video_url: "https://storage.cloud.google.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/aperturas-con-mancuernas.mp4",
  },
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
