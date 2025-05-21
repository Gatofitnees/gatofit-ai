
import React from "react";

interface ExerciseSet {
  set_number: number;
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
}

interface ExerciseCardProps {
  id: number;
  name: string;
  muscleGroup?: string;
  equipment?: string;
  sets: ExerciseSet[];
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ id, name, muscleGroup, equipment, sets }) => {
  return (
    <div className="bg-white shadow-neu-button rounded-xl overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{name}</h3>
            <p className="text-xs text-muted-foreground">
              {muscleGroup}
              {equipment && ` • ${equipment}`}
            </p>
          </div>
          <span className="bg-secondary/20 text-xs px-2 py-1 rounded-full">
            {sets.length} {sets.length === 1 ? 'serie' : 'series'}
          </span>
        </div>
        
        {/* Sets */}
        <div className="mt-3 space-y-2">
          {sets.map((set, setIndex) => (
            <div key={setIndex} className="flex justify-between items-center text-sm p-2 bg-secondary/10 rounded-lg">
              <div className="flex items-center">
                <span className="font-medium mr-2">Serie {set.set_number}</span>
                <span>{set.reps_min}-{set.reps_max} reps</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {set.rest_seconds}s descanso
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;
