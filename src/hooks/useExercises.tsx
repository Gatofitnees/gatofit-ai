
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { preloadedExercises } from "@/data/preloadedExercises";
import { additionalExercises } from "@/data/additionalExercises";
import { Exercise } from "@/data/exercises/exerciseTypes";

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
          // Combine both preloaded and additional exercises
          const allExercises = [...preloadedExercises, ...additionalExercises];
          setExercises(allExercises);
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
        // Fallback to preloaded exercises if fetch fails
        const allExercises = [...preloadedExercises, ...additionalExercises];
        setExercises(allExercises);
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

  // Extract unique values for filter options, properly handling multiple muscle groups and equipment types
  const muscleGroups = Array.from(
    new Set(
      exercises.flatMap(e => {
        if (!e.muscle_group_main) return [];
        // Split multiple muscle groups if they exist
        if (e.muscle_group_main.includes(" ")) {
          return e.muscle_group_main.split(" ");
        }
        return [e.muscle_group_main];
      })
    )
  ) as string[];
  
  // Process equipment types to separate those that contain multiple values
  const processedEquipmentTypes = exercises
    .flatMap(e => {
      if (!e.equipment_required) return [];
      
      // Split by space to handle multiple equipment types
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
