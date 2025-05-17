
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TabMenu from "../components/TabMenu";
import { useToastHelper } from "@/hooks/useToastHelper";
import { supabase } from "@/integrations/supabase/client";
import SearchAndFilterBar from "@/components/workout/SearchAndFilterBar";
import RoutinesList from "@/components/workout/RoutinesList";
import CreateRoutineForm from "@/components/workout/CreateRoutineForm";
import { useRoutines } from "@/hooks/workout/useRoutines";

const WorkoutPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("routines");
  const [searchTerm, setSearchTerm] = useState("");
  const { routines, fetchRoutines, isLoading } = useRoutines();
  const navigate = useNavigate();
  const toast = useToastHelper();
  
  // Fetch user routines when the active tab changes to "routines"
  useEffect(() => {
    if (activeTab === "routines") {
      fetchRoutines();
    }
  }, [activeTab]);

  const handleStartRoutine = (routineId: string) => {
    // Navigate to start the workout
    navigate(`/workout/start/${routineId}`);
  };

  const handleSelectExercises = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.showError(
          "Error de autenticación",
          "Debes iniciar sesión para crear rutinas"
        );
        return;
      }
      
      // Create a temporary routine in the database
      const { data, error } = await supabase.from('routines').insert({
        name: "Nueva Rutina", // Temporary name
        type: "Mixto",
        description: "",
        user_id: session.session.user.id,
        is_predefined: false
      }).select().single();
      
      if (error) throw error;
      
      // Navigate to exercise selection with the routine id
      navigate("/workout/select-exercises", { 
        state: { 
          routineId: data.id,
          routineName: "Nueva Rutina"
        }
      });
    } catch (error) {
      console.error("Error creating routine:", error);
      toast.showError(
        "Error",
        "No se pudo crear la rutina"
      );
    }
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
        <CreateRoutineForm onSelectExercises={handleSelectExercises} />
      )}
    </div>
  );
};

export default WorkoutPage;
