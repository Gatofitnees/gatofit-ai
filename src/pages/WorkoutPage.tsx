
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TabMenu from "../components/TabMenu";
import { useToastHelper } from "@/hooks/useToastHelper";
import SearchAndFilterBar from "@/components/workout/SearchAndFilterBar";
import RoutinesList from "@/components/workout/RoutinesList";
import CreateRoutineForm from "@/components/workout/CreateRoutineForm";
import { useRoutines } from "@/hooks/workout/useRoutines";

const WorkoutPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("routines");
  const [searchTerm, setSearchTerm] = useState("");
  const { routines, fetchRoutines, isLoading } = useRoutines();
  const navigate = useNavigate();
  
  // Fetch user routines when the active tab changes to "routines"
  useEffect(() => {
    if (activeTab === "routines") {
      fetchRoutines();
    }
  }, [activeTab, fetchRoutines]);

  const handleStartRoutine = (routineId: string) => {
    console.log("Starting routine with ID:", routineId);
    // Navigate to start the workout
    navigate(`/workout/start/${routineId}`);
  };

  // Filter routines based on search term
  const filteredRoutines = searchTerm 
    ? routines.filter(routine => 
        routine.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        routine.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : routines;

  console.log("Current activeTab:", activeTab);

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">Entrenamiento</h1>
      
      <TabMenu 
        tabs={[
          { id: "routines", label: "Mis Rutinas" },
          { id: "create", label: "Crear Rutina" }
        ]}
        defaultTab="routines"
        onChange={(tab) => {
          console.log("Changed tab to:", tab);
          setActiveTab(tab);
        }}
        className="mb-6"
      />
      
      {activeTab === "routines" ? (
        <>
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
        </>
      ) : (
        <CreateRoutineForm />
      )}
    </div>
  );
};

export default WorkoutPage;
