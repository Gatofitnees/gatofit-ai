
import React from "react";
import { Plus } from "lucide-react";
import Button from "@/components/Button";
import { useNavigate } from "react-router-dom";

interface WorkoutHeaderProps {
  title: string;
}

const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  
  const handleCreateRoutine = () => {
    navigate("/workout/create");
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-xl font-bold">{title}</h1>
      <Button 
        variant="primary"
        size="sm"
        leftIcon={<Plus className="h-4 w-4" />}
        onClick={handleCreateRoutine}
        className="bg-blue-500 hover:bg-blue-600"
      >
        Nueva Rutina
      </Button>
    </div>
  );
};

export default WorkoutHeader;
