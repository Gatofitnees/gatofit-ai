
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoutines } from "@/hooks/useRoutines";
import { initPredefinedRoutines } from "@/services/predefinedRoutinesService";

const WorkoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { routines, loading, refetch } = useRoutines();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Initialize predefined routines and refresh on navigation
  useEffect(() => {
    const loadPredefinedRoutines = async () => {
      try {
        await initPredefinedRoutines();
        console.log("Predefined routines initialized");
      } catch (error) {
        console.error("Error loading predefined routines:", error);
      }
    };
    
    loadPredefinedRoutines();
    refetch();
  }, [refetch]);
  
  // Filter routines based on search term
  const filteredRoutines = routines.filter(routine => 
    routine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartWorkout = (routineId: number) => {
    navigate(`/workout/routine/${routineId}`);
    toast({
      title: "¡Rutina seleccionada!",
      description: "Prepárate para comenzar tu entrenamiento"
    });
  };
  
  const handleCreateRoutine = () => {
    navigate("/workout/create");
  };
  
  const handleRoutineClick = (routineId: number) => {
    navigate(`/workout/routine/${routineId}`);
  };
  
  const getRoutineTypeLabel = (type: string | undefined) => {
    if (!type) return "-";
    
    const types: Record<string, string> = {
      strength: "Fuerza",
      cardio: "Cardio",
      flexibility: "Flexibilidad",
      mixed: "Mixto",
      custom: "Personalizado"
    };
    
    return types[type] || type;
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Mis Rutinas</h1>
        <Button 
          onClick={handleCreateRoutine}
          size="sm"
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Nueva Rutina
        </Button>
      </div>
      
      {/* Search */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Buscar rutinas..."
          className="w-full p-2 pl-9 rounded-xl border border-gray-200 bg-secondary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Routines list */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredRoutines.length > 0 ? (
          filteredRoutines.map((routine) => (
            <div 
              key={routine.id}
              className="bg-white rounded-xl shadow-neu-button p-4 hover:shadow-neu-button-hover transition-all cursor-pointer"
              onClick={() => handleRoutineClick(routine.id)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-base">{routine.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getRoutineTypeLabel(routine.type)} • {formatDate(routine.created_at)}
                  </p>
                </div>
                {routine.is_predefined && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    Predefinida
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span>{routine.exercise_count || 0} ejercicios</span>
                  <span className="mx-1">•</span>
                  <span>{routine.estimated_duration_minutes || 0} min</span>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartWorkout(routine.id);
                  }}
                >
                  Iniciar
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 border border-dashed border-gray-300 rounded-xl">
            <p className="text-muted-foreground mb-4">No se encontraron rutinas</p>
            <Button 
              onClick={handleCreateRoutine}
              variant="default"
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="h-4 w-4 mr-1" />
              Crear mi primera rutina
            </Button>
          </div>
        )}
      </div>
      
      {/* Floating Add Button */}
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
