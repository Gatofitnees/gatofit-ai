
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import Button from "@/components/Button";

interface CreateRoutineHeaderProps {
  title: string;
  onSave: () => void;
  hasExercises: boolean;
  isLoading: boolean;
}

const CreateRoutineHeader: React.FC<CreateRoutineHeaderProps> = ({
  title,
  onSave,
  hasExercises,
  isLoading
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="sticky top-0 z-10 bg-background p-4 border-b border-muted/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <button 
            onClick={() => navigate("/workout")}
            className="mr-3 p-1 rounded-full hover:bg-secondary/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        {hasExercises && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Save className="h-4 w-4" />}
            onClick={onSave}
            disabled={isLoading}
          >
            Guardar
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateRoutineHeader;
