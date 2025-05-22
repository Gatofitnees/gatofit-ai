
import { RoutineExercise } from "../../types";

export interface RoutineNavigationOptions {
  editRoutineId?: number;
}

export interface RoutineNavigationState {
  routineName: string;
  routineType: string;
  routineExercises: RoutineExercise[];
  pendingNavigation: string | null;
  setShowDiscardChangesDialog: (show: boolean) => void;
  setRoutineName: (name: string) => void;
  setRoutineType: (type: string) => void;
  setRoutineExercises: (exercises: RoutineExercise[]) => void;
  setPendingNavigation: (path: string | null) => void;
}

export interface RoutineNavigationActions {
  handleNavigateAway: (targetPath: string) => boolean;
  handleBackClick: () => void;
  handleSelectExercises: (e?: React.MouseEvent) => void;
  handleDiscardChanges: () => void;
}
