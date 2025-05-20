
import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Create this component to maintain state when going back to select exercises
const ExerciseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromSelectExercises = location.state?.fromSelectExercises || false;
  
  const handleBack = () => {
    // If we came from select exercises, we need to pass state to maintain selections
    if (fromSelectExercises) {
      navigate("/workout/select-exercises", { state: { fromDetails: true } });
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background p-4 border-b border-muted/20">
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="mr-3 p-1 rounded-full hover:bg-secondary/50"
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Detalles del Ejercicio</h1>
        </div>
      </div>

      {/* Exercise details content - This is just a placeholder */}
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-muted rounded-xl"></div>
          <div className="h-6 bg-muted rounded-md w-3/4"></div>
          <div className="h-4 bg-muted rounded-md w-1/2"></div>
          <div className="h-20 bg-muted rounded-md"></div>
          <div className="h-4 bg-muted rounded-md w-5/6"></div>
          <div className="h-4 bg-muted rounded-md w-2/3"></div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailsPage;
