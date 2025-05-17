
import React from "react";
import { CheckCircle } from "lucide-react";
import Button from "@/components/Button";

interface ExerciseSetProps {
  setNumber: number;
  totalSets: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
  isActive: boolean;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onComplete: () => void;
}

const ExerciseSet: React.FC<ExerciseSetProps> = ({
  setNumber,
  totalSets,
  weight,
  reps,
  completed,
  isActive,
  onWeightChange,
  onRepsChange,
  onComplete
}) => {
  return (
    <div 
      className={`flex items-center p-2 rounded-lg ${
        isActive ? "bg-primary/10" : "bg-secondary/30"
      } ${completed ? "opacity-50" : ""}`}
    >
      <span className="text-sm font-medium w-8">
        {setNumber}/{totalSets}
      </span>
      
      <div className="flex-1 flex items-center gap-2">
        <input
          type="number"
          placeholder="kg"
          className="w-14 h-8 px-2 rounded bg-background border-none text-sm"
          value={weight !== null ? weight : ""}
          onChange={(e) => onWeightChange(e.target.value)}
          disabled={completed}
        />
        <input
          type="number"
          placeholder="reps"
          className="w-14 h-8 px-2 rounded bg-background border-none text-sm"
          value={reps !== null ? reps : ""}
          onChange={(e) => onRepsChange(e.target.value)}
          disabled={completed}
        />
      </div>
      
      <Button
        variant={completed ? "outline" : "primary"}
        size="sm"
        className="min-w-8 h-8 p-1"
        onClick={onComplete}
        disabled={completed}
      >
        {completed ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          "Hecho"
        )}
      </Button>
    </div>
  );
};

export default ExerciseSet;
