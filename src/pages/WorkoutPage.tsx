import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import WorkoutHeader from "@/components/workout/WorkoutHeader";
import WorkoutSearchFilter from "@/components/workout/WorkoutSearchFilter";
import WorkoutList from "@/components/workout/WorkoutList";
import FloatingActionMenu from "@/components/FloatingActionMenu";
import { useRoutinesWithLimits } from "@/hooks/useRoutinesWithLimits";
import { syncExercisesToDatabase } from "@/features/workout/services/exerciseSyncService";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UsageLimitsBanner } from "@/components/premium/UsageLimitsBanner";
import { PremiumModal } from "@/components/premium/PremiumModal";

const WorkoutPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    routines, 
    loading, 
    refetch,
    showPremiumModal,
    setShowPremiumModal,
    getRoutineUsageInfo,
    deleteRoutine,
    isPremium
  } = useRoutinesWithLimits();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{ types: string[], muscles: string[] }>({
    types: [],
    muscles: []
  });
  const [initializing, setInitializing] = useState(false);
  const [routinesWithMuscles, setRoutinesWithMuscles] = useState<any[]>([]);
  const [usageInfo, setUsageInfo] = useState({ current: 0, limit: 5, canCreate: true, isOverLimit: false });
  
  // Función memoizada para cargar info de uso
  const loadUsageInfo = useCallback(async () => {
    if (!isPremium) {
      const info = await getRoutineUsageInfo();
      setUsageInfo(info);
    }
  }, [isPremium, getRoutineUsageInfo]);

  // Inicializar ejercicios
  useEffect(() => {
    const initialize = async () => {
      try {
        setInitializing(true);
        await syncExercisesToDatabase();
        console.log("Exercise synchronization completed");
        await refetch();
      } catch (error: any) {
        console.error("Error loading data:", error);
      } finally {
        setInitializing(false);
      }
    };
    
    initialize();
  }, [toast, refetch]); 

  // Cargar info de uso solo al montar el componente
  useEffect(() => {
    loadUsageInfo();
  }, [loadUsageInfo]);

  // Cargar rutinas con información de músculos cuando cambian las rutinas
  useEffect(() => {
    const loadRoutinesWithMuscles = async () => {
      if (routines.length === 0) {
        setRoutinesWithMuscles([]);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('routines')
          .select(`
            *,
            routine_exercises!inner(
              exercise:exercise_id!inner(
                muscle_group_main
              )
            )
          `)
          .eq('user_id', user.id)
          .eq('is_predefined', false);

        if (error) {
          console.error("Error loading routines with muscles:", error);
          setRoutinesWithMuscles(routines);
          return;
        }

        const enrichedRoutines = routines.map(routine => {
          const dbRoutine = data?.find(r => r.id === routine.id);
          const muscles = new Set<string>();
          
          dbRoutine?.routine_exercises?.forEach(re => {
            if (re.exercise?.muscle_group_main) {
              re.exercise.muscle_group_main.split(/[,\s]+/).forEach(muscle => {
                if (muscle.trim()) {
                  muscles.add(muscle.trim().charAt(0).toUpperCase() + muscle.trim().slice(1));
                }
              });
            }
          });

          return {
            ...routine,
            muscles: Array.from(muscles)
          };
        });

        setRoutinesWithMuscles(enrichedRoutines);
      } catch (error) {
        console.error("Error enriching routines:", error);
        setRoutinesWithMuscles(routines);
      }
    };

    loadRoutinesWithMuscles();
  }, [routines]);
  
  // Filter routines based on search term and filters
  const filteredRoutines = routinesWithMuscles.filter(routine => {
    const matchesSearch = routine.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filters.types.length === 0 ||
      (routine.type && filters.types.includes(routine.type));
    const matchesMuscle = filters.muscles.length === 0 ||
      (routine.muscles && routine.muscles.some((muscle: string) => 
        filters.muscles.includes(muscle)
      ));
    
    return matchesSearch && matchesType && matchesMuscle;
  });

  const handleStartWorkout = (routineId: number) => {
    navigate(`/workout/active/${routineId}`);
  };
  
  const handleCreateRoutine = async () => {
    if (!isPremium) {
      await loadUsageInfo();
      
      if (!usageInfo.canCreate) {
        setShowPremiumModal(true);
        return;
      }
    }
    
    navigate("/workout/create");
  };

  const handleCreateProgram = () => {
    navigate("/workout/programs");
  };
  
  const handleRoutineDeleted = async () => {
    await refetch();
    if (!isPremium) {
      await loadUsageInfo();
    }
  };

  const handleFiltersChange = (newFilters: { types: string[], muscles: string[] }) => {
    setFilters(newFilters);
    console.log("Filters applied:", newFilters);
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Mis Rutinas</h1>
          {!isPremium && (
            <UsageLimitsBanner type="routines" />
          )}
        </div>
      </div>
      
      <WorkoutSearchFilter 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm}
        onFiltersChange={handleFiltersChange}
        activeFilters={filters}
      />
      
      {initializing && (
        <div className="text-center py-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Inicializando datos...</p>
        </div>
      )}

      <WorkoutList 
        routines={filteredRoutines}
        loading={loading && !initializing}
        onStartWorkout={handleStartWorkout}
        onRoutineDeleted={handleRoutineDeleted}
        onDeleteRoutine={deleteRoutine}
      />
      
      <FloatingActionMenu
        onCreateRoutine={handleCreateRoutine}
        onCreateProgram={handleCreateProgram}
      />

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        feature="routines"
        currentUsage={usageInfo.current}
        limit={usageInfo.limit}
      />
    </div>
  );
};

export default WorkoutPage;
