
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToastHelper } from "@/hooks/useToastHelper";
import { supabase } from "@/integrations/supabase/client";
import { Exercise } from "@/hooks/workout/useExercises";
import RoutineForm, { RoutineFormData } from "@/components/workout/RoutineForm";
import CreateRoutineHeader from "@/components/workout/CreateRoutineHeader";
import RoutineExercisesList from "@/components/workout/RoutineExercisesList";

interface LocationState {
  selectedExercises?: Exercise[];
  routineId?: number;
  routineName?: string;
}

const CreateRoutinePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToastHelper();
  const state = location.state as LocationState || {};
  
  const [routineFormData, setRoutineFormData] = useState<RoutineFormData>({
    name: state.routineName || "",
    type: "",
    description: "",
  });
  
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>(state.selectedExercises || []);
  const [routineId, setRoutineId] = useState<number | undefined>(state.routineId);
  const [isLoading, setIsLoading] = useState(false);
  const [exerciseConfigs, setExerciseConfigs] = useState<{
    [exerciseId: number]: {
      sets: number;
      repsMin: number;
      repsMax: number;
      restSeconds: number;
    }
  }>({});

  // Initialize exercise configurations with default values
  useEffect(() => {
    if (selectedExercises.length > 0) {
      const configs = selectedExercises.reduce((acc, exercise) => {
        if (!exerciseConfigs[exercise.id]) {
          acc[exercise.id] = {
            sets: 3,
            repsMin: 8, 
            repsMax: 12,
            restSeconds: 60
          };
        } else {
          acc[exercise.id] = exerciseConfigs[exercise.id];
        }
        return acc;
      }, {} as {[exerciseId: number]: any});
      
      setExerciseConfigs(configs);
    }
  }, [selectedExercises]);

  const handleSelectExercises = async () => {
    // Return early if routine name is empty
    if (!routineFormData.name.trim()) {
      toast.showError(
        "Nombre requerido",
        "Por favor añade un nombre para tu rutina"
      );
      return;
    }

    try {
      setIsLoading(true);
      let routineIdToUse = routineId;
      
      if (!routineIdToUse) {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session) {
          toast.showError(
            "Error de autenticación",
            "Debes iniciar sesión para crear rutinas"
          );
          return;
        }
        
        // Create a routine in the database
        const { data, error } = await supabase.from('routines').insert({
          name: routineFormData.name,
          type: routineFormData.type || "Mixto",
          description: routineFormData.description,
          user_id: session.session.user.id,
          is_predefined: false
        }).select().single();
        
        if (error) throw error;
        
        console.log("Routine created:", data);
        routineIdToUse = data.id;
        setRoutineId(data.id);
      }
      
      // Navigate to exercise selection with the routine id
      console.log("Navigating to select-exercises with:", {
        routineId: routineIdToUse,
        routineName: routineFormData.name
      });
      
      // Make sure we're navigating with the correct state
      navigate("/workout/select-exercises", { 
        state: { 
          routineId: routineIdToUse,
          routineName: routineFormData.name
        },
        replace: false
      });
      
    } catch (error) {
      console.error("Error creating routine:", error);
      toast.showError(
        "Error",
        "No se pudo crear la rutina"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateExerciseConfig = (exerciseId: number, field: string, value: number) => {
    setExerciseConfigs(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value
      }
    }));
  };

  const handleSaveRoutine = async () => {
    try {
      setIsLoading(true);

      if (!routineId || selectedExercises.length === 0) {
        toast.showError(
          "Datos incompletos",
          "Asegúrate de tener un nombre de rutina y al menos un ejercicio"
        );
        return;
      }

      // Prepare exercise data to save
      const exercisesToSave = selectedExercises.map((exercise, index) => {
        const config = exerciseConfigs[exercise.id] || {
          sets: 3,
          repsMin: 8,
          repsMax: 12,
          restSeconds: 60
        };
        
        return {
          routine_id: routineId,
          exercise_id: exercise.id,
          exercise_order: index + 1,
          sets: config.sets,
          reps_min: config.repsMin,
          reps_max: config.repsMax,
          rest_between_sets_seconds: config.restSeconds
        };
      });

      // Delete any existing routine exercises if editing an existing routine
      if (routineId) {
        const { error: deleteError } = await supabase
          .from('routine_exercises')
          .delete()
          .eq('routine_id', routineId);
          
        if (deleteError) throw deleteError;
      }

      // Save all exercises
      const { error } = await supabase
        .from('routine_exercises')
        .insert(exercisesToSave);
        
      if (error) throw error;
      
      toast.showSuccess(
        "Rutina guardada",
        "Tu rutina ha sido guardada exitosamente"
      );
      
      // Navigate back to workout page
      navigate("/workout");
      
    } catch (error) {
      console.error("Error saving routine:", error);
      toast.showError(
        "Error", 
        "No se pudo guardar la rutina"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewExerciseDetails = (id: number) => {
    navigate(`/workout/exercise-details/${id}`);
  };

  const handleFormChange = (data: RoutineFormData) => {
    setRoutineFormData(data);
  };

  const pageTitle = routineId ? 'Editar Rutina' : 'Crear Rutina';

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto">
      <CreateRoutineHeader
        title={routineId ? 'Editar Rutina' : 'Crear Rutina'}
        onSave={handleSaveRoutine}
        hasExercises={selectedExercises.length > 0}
        isLoading={isLoading}
      />

      <div className="p-4">
        <RoutineForm 
          initialData={routineFormData} 
          onFormChange={handleFormChange}
          isDisabled={isLoading}
        />

        <RoutineExercisesList
          exercises={selectedExercises}
          exerciseConfigs={exerciseConfigs}
          onAddExercises={handleSelectExercises}
          onConfigChange={handleUpdateExerciseConfig}
          onViewDetails={handleViewExerciseDetails}
        />
      </div>
    </div>
  );
};

export default CreateRoutinePage;
