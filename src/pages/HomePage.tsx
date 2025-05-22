
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Button from "../components/Button";
import UserHeader from "../components/UserHeader";
import DaySelector from "../components/DaySelector";
import TrainingCard from "../components/TrainingCard";
import MacrosCard from "../components/MacrosCard";

interface WorkoutSummary {
  id: number;
  name: string;
  duration: string;
  calories: number;
  date: string;
  exercises: string[];
}

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hasCompletedWorkout, setHasCompletedWorkout] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutSummary | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [datesWithWorkouts, setDatesWithWorkouts] = useState<Date[]>([]);
  
  // Datos de ejemplo - En una implementación real vendrían de Supabase
  const username = user?.user_metadata?.name || user?.email?.split('@')[0] || "Usuario";
  const userProgress = 75;
  
  const macros = {
    calories: { current: 1450, target: 2000, unit: "kcal" },
    protein: { current: 90, target: 120 },
    carbs: { current: 130, target: 200 },
    fats: { current: 35, target: 65 }
  };

  // Carga las fechas con entrenamientos al inicio
  useEffect(() => {
    const fetchWorkoutDates = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('workout_logs')
          .select('workout_date')
          .eq('user_id', user.id)
          .order('workout_date', { ascending: false })
          .limit(50);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const dates = data.map(item => new Date(item.workout_date));
          setDatesWithWorkouts(dates);
        }
      } catch (error) {
        console.error("Error al cargar fechas de entrenamientos:", error);
      }
    };
    
    fetchWorkoutDates();
  }, [user]);

  useEffect(() => {
    const fetchDailyWorkout = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Format date as YYYY-MM-DD
        const dateString = selectedDate.toISOString().split('T')[0];
        
        // Get workout logs for the selected date
        const { data: workoutLogs, error } = await supabase
          .from('workout_logs')
          .select(`
            id,
            routine_name_snapshot,
            duration_completed_minutes,
            calories_burned_estimated,
            workout_date,
            workout_log_exercise_details(exercise_name_snapshot)
          `)
          .eq('user_id', user.id)
          .like('workout_date', `${dateString}%`)
          .order('workout_date', { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        if (workoutLogs && workoutLogs.length > 0) {
          const workout = workoutLogs[0];
          
          // Extract unique exercise names
          const exerciseNames = Array.from(
            new Set(
              workout.workout_log_exercise_details
                .map((detail: any) => detail.exercise_name_snapshot)
            )
          ).slice(0, 3); // Limit to 3 exercises
          
          setWorkoutSummary({
            id: workout.id,
            name: workout.routine_name_snapshot || "Entrenamiento",
            duration: `${workout.duration_completed_minutes || 0} min`,
            calories: workout.calories_burned_estimated || 0,
            date: workout.workout_date,
            exercises: exerciseNames
          });
          setHasCompletedWorkout(true);
        } else {
          setWorkoutSummary(undefined);
          setHasCompletedWorkout(false);
        }
      } catch (error) {
        console.error("Error al cargar el entrenamiento:", error);
        setHasCompletedWorkout(false);
        setWorkoutSummary(undefined);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDailyWorkout();
  }, [user, selectedDate]);

  // Load workout and nutrition data for the selected date
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleStartWorkout = () => {
    navigate("/workout");
  };

  const handleViewWorkoutDetails = (workoutId?: number) => {
    if (workoutId) {
      navigate(`/workout/summary/${workoutId}`);
    } else {
      toast({
        title: "Detalles del entrenamiento",
        description: "No se pudo encontrar el entrenamiento.",
      });
    }
  };

  const handleAddFood = () => {
    toast({
      title: "Añadir comida",
      description: "Redirigiendo a la página de nutrición...",
    });
    navigate("/nutrition");
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* User header and profile */}
      <UserHeader 
        username={username} 
        progress={userProgress}
      />
      
      {/* Day selector */}
      <DaySelector 
        onSelectDate={handleDateSelect}
        datesWithRecords={datesWithWorkouts}
      />

      {/* Training card */}
      <TrainingCard
        loading={loading}
        completed={hasCompletedWorkout}
        workout={workoutSummary}
        onStartWorkout={handleStartWorkout}
        onViewDetails={() => handleViewWorkoutDetails(workoutSummary?.id)}
      />
      
      {/* Macros card */}
      <MacrosCard macros={macros} />
      
      {/* Botón flotante para añadir comida */}
      <div className="fixed right-4 bottom-20 z-30">
        <Button
          variant="primary"
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={handleAddFood}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
