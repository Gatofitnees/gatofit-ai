
import React from "react";
import { ExerciseSet as ExerciseSetType } from "../types";
import { NumericInput } from "@/components/ui/numeric-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExerciseSetProps {
  set: ExerciseSetType;
  setIndex: number;
  onSetUpdate: (setIndex: number, field: string, value: number) => void;
}

const REST_TIMES = [
  { label: "30 seg", value: 30 },
  { label: "45 seg", value: 45 },
  { label: "60 seg", value: 60 },
  { label: "90 seg", value: 90 },
  { label: "2 min", value: 120 },
  { label: "3 min", value: 180 },
  { label: "4 min", value: 240 },
  { label: "5 min", value: 300 }
];

const ExerciseSet: React.FC<ExerciseSetProps> = ({ set, setIndex, onSetUpdate }) => {
  const [repsValue, setRepsValue] = React.useState('');

  // Initialize reps value when component mounts or set changes
  React.useEffect(() => {
    // Only show values if they are actually set (greater than 0)
    if (set.reps_min > 0 && set.reps_max > 0) {
      if (set.reps_min === set.reps_max) {
        setRepsValue(set.reps_min.toString());
      } else {
        setRepsValue(`${set.reps_min}-${set.reps_max}`);
      }
    } else {
      setRepsValue('');
    }
  }, [set.reps_min, set.reps_max]);

  const handleRepsChange = (value: string) => {
    // Allow only numbers and hyphens
    const sanitizedValue = value.replace(/[^0-9-]/g, '');
    setRepsValue(sanitizedValue);
    
    if (sanitizedValue === '') {
      onSetUpdate(setIndex, "reps_min", 0);
      onSetUpdate(setIndex, "reps_max", 0);
      return;
    }

    const match = sanitizedValue.match(/^(\d+)(?:-(\d+))?$/);
    
    if (match) {
      const min = parseInt(match[1]);
      const max = match[2] ? parseInt(match[2]) : min;
      
      if (!isNaN(min) && !isNaN(max) && min <= max) {
        onSetUpdate(setIndex, "reps_min", min);
        onSetUpdate(setIndex, "reps_max", max);
      }
    }
  };

  const handleRepsFocus = () => {
    // Clear the input when user focuses if it's empty or has default values
    if (repsValue === '' || (set.reps_min === 0 && set.reps_max === 0)) {
      setRepsValue('');
    }
  };

  return (
    <div key={`set-${setIndex}`} className="mb-4 last:mb-0">
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center">
          <div className="text-sm font-medium mb-1.5 text-center w-full">Serie</div>
          <div className="h-9 w-9 flex items-center justify-center bg-primary/10 text-primary font-semibold rounded-full">
            {setIndex + 1}
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="text-sm font-medium mb-1.5 text-center">Reps</div>
          <div className="bg-background rounded-lg px-3 py-1.5 min-h-9">
            <input 
              type="text"
              className="w-full h-full bg-transparent border-none text-sm text-center placeholder:text-muted-foreground/60 outline-none"
              value={repsValue}
              onChange={(e) => handleRepsChange(e.target.value)}
              onFocus={handleRepsFocus}
              placeholder="8-12"
            />
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="text-sm font-medium mb-1.5 text-center">Descanso</div>
          <Select
            value={set.rest_seconds.toString()}
            onValueChange={(value) => onSetUpdate(setIndex, "rest_seconds", parseInt(value))}
          >
            <SelectTrigger className="w-full h-9 rounded-lg px-3 py-1 bg-background border-none text-sm">
              <SelectValue placeholder="60 seg" />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-sm border border-secondary">
              {REST_TIMES.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ExerciseSet;
