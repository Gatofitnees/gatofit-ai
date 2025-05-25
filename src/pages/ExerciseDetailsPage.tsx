import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useExerciseHistory } from "@/hooks/useExerciseHistory";
import ExerciseHistoryDialog from "@/components/exercise/ExerciseHistoryDialog";

// Mock exercise data - in a real app this would come from a database
const getExerciseById = (id: string) => {
  // This is a placeholder - replace with actual data fetching
  return {
    id: parseInt(id),
    name: "Press de Banca",
    muscle_group_main: "Pecho",
    equipment_required: "Barra",
    description: "El press de banca es un ejercicio fundamental para desarrollar la fuerza y masa muscular del pecho, hombros y tríceps.",
    video_url: null,
    difficulty_level: "intermediate"
  };
};

const ExerciseDetailsPage: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const {
    showHistoryDialog,
    setShowHistoryDialog,
    exerciseHistory,
    loading: historyLoading
  } = useExerciseHistory(exerciseId ? parseInt(exerciseId) : null);

  if (!exerciseId) {
    return <div>Exercise not found</div>;
  }

  const exercise = getExerciseById(exerciseId);

  const handleBack = () => {
    // Check if we came from create routine page
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/workout');
    }
  };

  const handleStartWorkout = () => {
    navigate(`/workout/active/new?exercise=${exerciseId}`);
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="p-0 h-auto"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Atrás
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHistoryDialog(true)}
        >
          <BarChart2 className="h-4 w-4 mr-1" />
          Historial
        </Button>
      </div>

      {/* Exercise Info */}
      <Card className="mb-6 p-6">
        <h1 className="text-2xl font-bold mb-2">{exercise.name}</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
            {exercise.muscle_group_main}
          </span>
          {exercise.equipment_required && (
            <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
              {exercise.equipment_required}
            </span>
          )}
          <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
            {exercise.difficulty_level}
          </span>
        </div>
        
        {exercise.description && (
          <p className="text-muted-foreground mb-4">
            {exercise.description}
          </p>
        )}

        <Button onClick={handleStartWorkout} className="w-full">
          <Play className="h-4 w-4 mr-2" />
          Empezar ejercicio
        </Button>
      </Card>

      {/* Exercise History Dialog */}
      <ExerciseHistoryDialog
        isOpen={showHistoryDialog}
        onClose={() => setShowHistoryDialog(false)}
        exerciseName={exercise.name}
        history={exerciseHistory}
        loading={historyLoading}
      />
    </div>
  );
};

export default ExerciseDetailsPage;
