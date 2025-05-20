
import React from "react";
import { RoutineExercise } from "../../types";
import ExerciseOptionsSheet from "./ExerciseOptionsSheet";
import ReorderSheet from "./ReorderSheet";

interface RoutineSheetsProps {
  showExerciseOptionsSheet: boolean;
  setShowExerciseOptionsSheet: (show: boolean) => void;
  showReorderSheet: boolean;
  setShowReorderSheet: (show: boolean) => void;
  currentExerciseIndex: number | null;
  handleRemoveExercise: (index: number) => void;
  handleMoveExercise: (fromIndex: number, toIndex: number) => void;
  routineExercises: RoutineExercise[];
  navigateToSelectExercises: (e?: React.MouseEvent) => void;
  handleReorderSave: () => void;
}

const RoutineSheets: React.FC<RoutineSheetsProps> = ({
  showExerciseOptionsSheet,
  setShowExerciseOptionsSheet,
  showReorderSheet,
  setShowReorderSheet,
  currentExerciseIndex,
  handleRemoveExercise,
  handleMoveExercise,
  routineExercises,
  navigateToSelectExercises,
  handleReorderSave
}) => {
  return (
    <>
      <ExerciseOptionsSheet
        open={showExerciseOptionsSheet}
        onOpenChange={setShowExerciseOptionsSheet}
        onReorderClick={() => {
          setShowExerciseOptionsSheet(false);
          setShowReorderSheet(true);
        }}
        onReplaceExercise={() => {
          setShowExerciseOptionsSheet(false);
          navigateToSelectExercises();
        }}
        onRemoveExercise={() => {
          if (currentExerciseIndex !== null) {
            handleRemoveExercise(currentExerciseIndex);
            setShowExerciseOptionsSheet(false);
          }
        }}
      />

      <ReorderSheet
        open={showReorderSheet}
        exercises={routineExercises}
        onOpenChange={setShowReorderSheet}
        onMoveExercise={handleMoveExercise}
        onRemoveExercise={handleRemoveExercise}
        onSave={handleReorderSave}
      />
    </>
  );
};

export default RoutineSheets;
