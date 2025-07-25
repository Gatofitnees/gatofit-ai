
export interface WorkoutSet {
  set_number: number;
  weight: number | string | null;
  reps: number | null;
  notes: string;
  previous_weight: number | null;
  previous_reps: number | null;
  target_reps_min?: number;
  target_reps_max?: number;
}

export interface WorkoutExercise {
  id: number;
  name: string;
  sets: WorkoutSet[];
  muscle_group_main?: string;
  equipment_required?: string;
  notes: string;
}

export interface PreviousData {
  weight: number | null;
  reps: number | null;
}
