
import { Exercise } from "@/features/workout/exercise-selection/types";

export interface ConfiguredExercise extends Exercise {
  sets: number;
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
  notes?: string;
  is_time_based: boolean;
  duration_seconds?: number;
}

export interface ExerciseConfigurationProps {
  exercises: ConfiguredExercise[];
  onUpdate: (index: number, data: Partial<ConfiguredExercise>) => void;
  onRemove: (index: number) => void;
}
