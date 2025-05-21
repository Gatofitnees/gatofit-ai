
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRoutineDetail } from "@/features/workout/hooks/useRoutineDetail";
import RoutineHeader from "@/features/workout/components/routine-detail/RoutineHeader";
import RoutineInfo from "@/features/workout/components/routine-detail/RoutineInfo";
import ExercisesList from "@/features/workout/components/routine-detail/ExercisesList";
import LoadingSkeleton from "@/features/workout/components/routine-detail/LoadingSkeleton";
import RoutineNotFound from "@/features/workout/components/routine-detail/RoutineNotFound";

const RoutineDetailPage: React.FC = () => {
  const { routineId } = useParams<{ routineId: string }>();
  const navigate = useNavigate();
  
  const { 
    routine, 
    exerciseDetails, 
    loading, 
    startingWorkout, 
    handleStartWorkout 
  } = useRoutineDetail(routineId);
  
  const handleBack = () => {
    navigate("/workout");
  };

  if (loading) {
    return <LoadingSkeleton onBack={handleBack} />;
  }
  
  if (!routine) {
    return <RoutineNotFound onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <RoutineHeader title={routine.name} onBack={handleBack} />
      
      {/* Routine Info */}
      <RoutineInfo 
        estimatedDuration={routine.estimated_duration_minutes} 
        description={routine.description}
        onStartWorkout={handleStartWorkout}
        isStarting={startingWorkout}
      />
      
      {/* Exercises List */}
      <h2 className="font-semibold mb-4">Ejercicios</h2>
      <ExercisesList exercises={exerciseDetails} />
    </div>
  );
};

export default RoutineDetailPage;
