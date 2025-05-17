
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutRoutine } from '../components/RoutineCard';

export const useRoutines = () => {
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [loading, setLoading] = useState(false);
  
  const fetchRoutines = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user found');
        setLoading(false);
        return;
      }
      
      // Fetch routines from the database
      const { data, error } = await supabase
        .from('routines')
        .select('id, name, description, estimated_duration_minutes, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching routines:', error);
        return;
      }
      
      if (data) {
        // For each routine, count the exercises
        const routinesWithExerciseCount = await Promise.all(data.map(async (routine) => {
          const { count, error } = await supabase
            .from('routine_exercises')
            .select('*', { count: 'exact', head: true })
            .eq('routine_id', routine.id);
            
          return {
            id: routine.id,
            name: routine.name,
            type: "Custom", // We'll update this when we add routine types
            duration: `${routine.estimated_duration_minutes || 0} min`,
            exercises: count || 0
          };
        }));
        
        setRoutines(routinesWithExerciseCount);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data as fallback
  const getMockRoutines = (): WorkoutRoutine[] => [
    {
      id: "1",
      name: "Full Body Force",
      type: "Fuerza",
      duration: "45 min",
      exercises: 8
    },
    {
      id: "2",
      name: "HIIT Quemagrasa",
      type: "Cardio",
      duration: "30 min",
      exercises: 12
    },
    {
      id: "3",
      name: "Día de Pierna",
      type: "Fuerza",
      duration: "50 min",
      exercises: 7
    },
    {
      id: "4",
      name: "Core Express",
      type: "Fuerza",
      duration: "20 min",
      exercises: 6
    }
  ];

  return {
    routines: routines.length > 0 ? routines : getMockRoutines(),
    loading,
    fetchRoutines
  };
};
