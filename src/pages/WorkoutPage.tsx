
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import WorkoutHeader from "@/components/workout/WorkoutHeader";
import WorkoutSearchFilter from "@/components/workout/WorkoutSearchFilter";
import WorkoutList from "@/components/workout/WorkoutList";
import { useRoutines } from "@/hooks/useRoutines";
import { initPredefinedRoutines } from "@/features/workout/services/predefinedRoutinesService";
import { useNavigate, useLocation } from "react-router-dom";

const WorkoutPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { routines, loading, refetch } = useRoutines();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Inicializar rutinas predefinidas cuando la página se carga
  useEffect(() => {
    const loadPredefinedRoutines = async () => {
      try {
        await initPredefinedRoutines();
        // Recargar rutinas para incluir las predefinidas
        refetch();
      } catch (error) {
        console.error("Error loading predefined routines:", error);
      }
    };
    
    loadPredefinedRoutines();
  }, [refetch]);
  
  // Refrescar rutinas cuando volvemos a esta página
  useEffect(() => {
    // Esta función se ejecutará cada vez que el usuario navegue a esta página
    refetch();
    console.log("Refrescando rutinas en WorkoutPage");
  }, [location.pathname, refetch]);
  
  // Filtrar rutinas basadas en el término de búsqueda
  const filteredRoutines = routines.filter(routine => 
    routine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartWorkout = (routineId: number) => {
    // En una futura implementación, esto navegaría a una página de sesión de entrenamiento
    toast({
      title: "¡Rutina iniciada!",
      description: "Funcionalidad en desarrollo"
    });
  };
  
  const handleCreateRoutine = () => {
    navigate("/workout/create");
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <WorkoutHeader title="Mis Rutinas" />
      
      {/* Search and Filter */}
      <WorkoutSearchFilter 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      {/* Routines List */}
      <WorkoutList 
        routines={filteredRoutines}
        loading={loading}
        onStartWorkout={handleStartWorkout}
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
