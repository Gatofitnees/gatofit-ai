
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Target, Dumbbell, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExerciseHistory } from "@/hooks/useExerciseHistory";
import ExerciseHistoryDialog from "@/components/exercise/ExerciseHistoryDialog";

const ExerciseDetailsPage: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  
  const { history, loading, isEmpty } = useExerciseHistory({ 
    exerciseId: exerciseId ? parseInt(exerciseId) : undefined 
  });

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Mock exercise data - in a real app this would come from a database
  const exercise = {
    id: parseInt(exerciseId || "0"),
    name: "Press de Banca",
    description: "El press de banca es un ejercicio fundamental para desarrollar la fuerza y masa muscular del pecho, hombros y tríceps.",
    muscle_group_main: "Pecho",
    muscle_groups_secondary: ["Hombros", "Tríceps"],
    equipment_required: "Barra",
    difficulty_level: "Intermedio",
    instructions: [
      "Acuéstate en el banco con los pies firmes en el suelo",
      "Agarra la barra con las manos separadas al ancho de los hombros",
      "Baja la barra controladamente hasta el pecho",
      "Empuja la barra hacia arriba hasta extender completamente los brazos",
      "Repite el movimiento de forma controlada"
    ],
    tips: [
      "Mantén los omóplatos retraídos durante todo el movimiento",
      "No rebotes la barra en el pecho",
      "Respira profundo antes de bajar la barra y exhala al empujar"
    ]
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="p-2 mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold truncate">{exercise.name}</h1>
      </div>

      {/* Exercise Info Card */}
      <div className="bg-secondary/20 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
            <Target className="h-3 w-3 mr-1" />
            {exercise.muscle_group_main}
          </div>
          <div className="flex items-center bg-secondary/40 text-muted-foreground px-3 py-1 rounded-full text-sm">
            <Dumbbell className="h-3 w-3 mr-1" />
            {exercise.equipment_required}
          </div>
          <div className="bg-orange-500/10 text-orange-600 px-3 py-1 rounded-full text-sm">
            {exercise.difficulty_level}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {exercise.description}
        </p>
      </div>

      {/* Secondary Muscles */}
      {exercise.muscle_groups_secondary.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Músculos secundarios</h3>
          <div className="flex flex-wrap gap-2">
            {exercise.muscle_groups_secondary.map((muscle, index) => (
              <span
                key={index}
                className="bg-secondary/30 text-foreground px-3 py-1 rounded-full text-sm"
              >
                {muscle}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Instrucciones</h3>
        <div className="space-y-3">
          {exercise.instructions.map((instruction, index) => (
            <div key={index} className="flex items-start">
              <div className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                {index + 1}
              </div>
              <p className="text-sm leading-relaxed">{instruction}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Consejos</h3>
        <div className="space-y-2">
          {exercise.tips.map((tip, index) => (
            <div key={index} className="flex items-start">
              <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0"></div>
              <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* History Button */}
      <div className="mb-6">
        <ExerciseHistoryDialog
          exerciseId={exercise.id}
          exerciseName={exercise.name}
        />
      </div>
    </div>
  );
};

export default ExerciseDetailsPage;
