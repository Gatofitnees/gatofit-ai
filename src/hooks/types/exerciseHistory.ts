
export interface ExerciseSession {
  date: string;
  sets: {
    set_number: number;
    weight_kg_used: number | null;
    reps_completed: number | null;
  }[];
  maxWeight: number | null;
  totalReps: number;
}

export interface ExerciseStats {
  maxWeight: number | null;
  maxReps: number | null;
  sessions: ExerciseSession[];
  progressData: { date: string; maxWeight: number }[];
}

export interface UseExerciseHistoryProps {
  exerciseId?: number;
}

export interface ExerciseHistoryReturn {
  stats: ExerciseStats;
  loading: boolean;
  isEmpty: boolean;
}
