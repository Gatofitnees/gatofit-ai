
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { preloadedExercises } from "@/data/preloadedExercises";

interface Exercise {
  id: number;
  name: string;
  muscle_group_main: string;
  equipment_required?: string;
  difficulty_level?: string;
  video_url?: string;
  description?: string;
}

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

  // Extract unique values for filter options, handling combined equipment types
  const muscleGroups = Array.from(new Set(exercises.map(e => e.muscle_group_main).filter(Boolean))) as string[];
  
  // Procesar equipos para separar aquellos que contienen múltiples valores
  const processedEquipmentTypes = exercises
    .flatMap(e => {
      if (!e.equipment_required) return [];
      
      // Si contiene espacios, dividir en múltiples valores
      if (e.equipment_required.includes(" ")) {
        return e.equipment_required.split(" ");
      }
      
      return [e.equipment_required];
    })
    .filter(Boolean);
  
  const equipmentTypes = Array.from(new Set(processedEquipmentTypes)) as string[];

  return {
    exercises,
    loading,
    muscleGroups,
    equipmentTypes
  };
};
