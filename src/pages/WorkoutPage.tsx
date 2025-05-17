
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import TabMenu from "../components/TabMenu";
import RoutinesList from "@/features/workout/routine-management/components/RoutinesList";
import RoutineForm from "@/features/workout/routine-management/components/RoutineForm";
import SearchBar from "@/features/workout/routine-management/components/SearchBar";
import { useRoutines } from "@/features/workout/routine-management/hooks/useRoutines";

const WorkoutPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("routines");
  const navigate = useNavigate();
  
  // Form state
  const [routineName, setRoutineName] = useState("");
  const [routineType, setRoutineType] = useState("");
  const [routineDescription, setRoutineDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get routines
  const { routines, loading, fetchRoutines } = useRoutines();
  
  // Fetch routines when tab is "routines"
  useEffect(() => {
    if (activeTab === "routines") {
      fetchRoutines();
    }
  }, [activeTab, fetchRoutines]);
  
  // Filter routines based on search term
  const filteredRoutines = routines.filter(routine => 
    routine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectExercises = () => {
    // Validate form fields
    if (!routineName.trim()) {
      toast.error("Por favor, ingresa un nombre para la rutina");
      return;
    }
    
    // Navigate to select exercises with the form data
    navigate("/workout/select-exercises", {
      state: {
        routineFormData: {
          name: routineName,
          type: routineType,
          description: routineDescription
        }
      }
    });
  };

  const handleStartRoutine = (routineId: string | number) => {
    // Will be implemented in the future
    console.log("Starting routine:", routineId);
    toast.show("Esta funcionalidad estará disponible próximamente");
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">Entrenamiento</h1>
      
      <TabMenu 
        tabs={[
          { id: "routines", label: "Mis Rutinas" },
          { id: "create", label: "Crear Rutina" }
        ]}
        defaultTab="routines"
        onChange={setActiveTab}
        className="mb-6"
      />
      
      {activeTab === "routines" ? (
        <>
          <SearchBar 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onFilterClick={() => toast.show("Filtros estará disponible próximamente")}
          />

          <RoutinesList 
            routines={filteredRoutines}
            loading={loading}
            onStartRoutine={handleStartRoutine}
            onCreateRoutine={() => setActiveTab("create")}
          />
        </>
      ) : (
        <RoutineForm 
          routineName={routineName}
          routineType={routineType}
          routineDescription={routineDescription}
          onRoutineNameChange={setRoutineName}
          onRoutineTypeChange={setRoutineType}
          onRoutineDescriptionChange={setRoutineDescription}
          onAddExercises={handleSelectExercises}
        />
      )}
    </div>
  );
};

export default WorkoutPage;
