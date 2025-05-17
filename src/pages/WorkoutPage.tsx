
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TabMenu from "../components/TabMenu";
import { useToastHelper } from "@/hooks/useToastHelper";
import SearchAndFilterBar from "@/components/workout/SearchAndFilterBar";
import RoutinesList from "@/components/workout/RoutinesList";
import { useRoutines } from "@/hooks/workout/useRoutines";
import Button from "@/components/Button";
import { Plus } from "lucide-react";

const WorkoutPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { routines, fetchRoutines, isLoading } = useRoutines();
  const navigate = useNavigate();
  
  // Fetch user routines when the component mounts
  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  const handleStartRoutine = (routineId: string) => {
    console.log("Starting routine with ID:", routineId);
    // Navigate to start the workout
    navigate(`/workout/start/${routineId}`);
  };

  const handleCreateRoutine = () => {
    navigate("/workout/create");
  };

  // Filter routines based on search term
  const filteredRoutines = searchTerm 
    ? routines.filter(routine => 
        routine.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        routine.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : routines;

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">Entrenamiento</h1>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Mis Rutinas</h2>
        <Button 
          variant="primary"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={handleCreateRoutine}
        >
          Crear Rutina
        </Button>
      </div>
      
      <SearchAndFilterBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {isLoading ? (
        <div className="text-center py-8">
          <p>Cargando rutinas...</p>
        </div>
      ) : (
        <RoutinesList 
          routines={filteredRoutines} 
          onStartRoutine={handleStartRoutine} 
        />
      )}
    </div>
  );
};

export default WorkoutPage;
