
export interface ExerciseItem {
  id: number;
  name: string;
  muscle_group_main: string;
  equipment_required?: string;
}

export interface ExerciseSet {
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
}

export interface RoutineExercise extends ExerciseItem {
  sets: ExerciseSet[];
}
