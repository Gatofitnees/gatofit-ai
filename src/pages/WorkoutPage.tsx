
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import WorkoutHeader from "@/components/workout/WorkoutHeader";
import WorkoutSearchFilter from "@/components/workout/WorkoutSearchFilter";
import WorkoutList from "@/components/workout/WorkoutList";
import { useRoutines } from "@/hooks/useRoutines";
import { initPredefinedRoutines } from "@/features/workout/services/predefinedRoutinesService";
import { syncExercisesToDatabase } from "@/features/workout/services/exerciseSyncService";
import { useNavigate } from "react-router-dom";

const WorkoutPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { routines, loading, refetch } = useRoutines();
  const [searchTerm, setSearchTerm] = useState("");
  const [initializing, setInitializing] = useState(false);
  
  // Initialize predefined routines and sync exercises
  useEffect(() => {
    const initialize = async () => {
      try {
        setInitializing(true);
        
        // First ensure all exercises exist in the database
        await syncExercisesToDatabase();
        console.log("Exercise synchronization completed");
        
        // Then initialize predefined routines
        await initPredefinedRoutines();
        console.log("Predefined routines initialized");
        
        // Refetch routines after initialization
        await refetch();
      } catch (error: any) {
        console.error("Error loading predefined data:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos predefinidos. Por favor, recargue la página e intente nuevamente.",
          variant: "destructive"
        });
      } finally {
        setInitializing(false);
      }
    };
    
    initialize();
  }, [toast, refetch]); 
  
  // Filter routines based on search term
  const filteredRoutines = routines.filter(routine => 
    routine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartWorkout = (routineId: number) => {
    // Ir directamente a la pantalla activa sin pasar por la previsualización
    navigate(`/workout/active/${routineId}`);
  };
  
  const handleCreateRoutine = () => {
    navigate("/workout/create");
  };
  
  const handleRoutineDeleted = () => {
    refetch();
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <WorkoutHeader title="Mis Rutinas" />
      
      {/* Search and Filter */}
      <WorkoutSearchFilter 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />
      
      {initializing && (
        <div className="text-center py-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Inicializando datos...</p>
        </div>
      )}

      {/* Routines List */}
      <WorkoutList 
        routines={filteredRoutines}
        loading={loading && !initializing}
        onStartWorkout={handleStartWorkout}
        onRoutineDeleted={handleRoutineDeleted}
      />
      
      {/* Create Routine Button */}
      <div className="fixed right-4 bottom-20 z-30">
        <Button
          onClick={handleCreateRoutine}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default WorkoutPage;
