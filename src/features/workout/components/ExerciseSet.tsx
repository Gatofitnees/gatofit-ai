
import React from "react";
import { ExerciseSet as ExerciseSetType } from "../types";

interface ExerciseSetProps {
  set: ExerciseSetType;
  setIndex: number;
  onSetUpdate: (setIndex: number, field: string, value: number) => void;
}

const ExerciseSet: React.FC<ExerciseSetProps> = ({ set, setIndex, onSetUpdate }) => {
  return (
    <div key={`set-${setIndex}`} className="mb-3 last:mb-0">
      <div className="text-sm font-medium mb-1">Serie {setIndex + 1}</div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs font-medium mb-1">Repeticiones</label>
          <div className="flex items-center">
            <input 
              type="number"
              min="1"
              max="100"
              className="w-full h-9 rounded-lg px-3 py-1 bg-background border-none text-sm"
              value={set.reps_min}
              onChange={(e) => onSetUpdate(setIndex, "reps_min", parseInt(e.target.value))}
            />
            <span className="px-1">-</span>
            <input 
              type="number"
              min="1"
              max="100"
              className="w-full h-9 rounded-lg px-3 py-1 bg-background border-none text-sm"
              value={set.reps_max}
              onChange={(e) => onSetUpdate(setIndex, "reps_max", parseInt(e.target.value))}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Descanso (s)</label>
          <input 
            type="number"
            min="0"
            max="300"
            step="5"
            className="w-full h-9 rounded-lg px-3 py-1 bg-background border-none text-sm"
            value={set.rest_seconds}
            onChange={(e) => onSetUpdate(setIndex, "rest_seconds", parseInt(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};

export default ExerciseSet;
