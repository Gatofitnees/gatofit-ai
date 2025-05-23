
import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface SelectionFloatingButtonProps {
  selectedCount: number;
  onAddExercises: () => void;
  isActiveWorkout?: boolean;
}

const SelectionFloatingButton: React.FC<SelectionFloatingButtonProps> = ({
  selectedCount,
  onAddExercises,
  isActiveWorkout
}) => {
  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-0 right-0 px-4 z-50"
      >
        <Button
          onClick={onAddExercises}
          className="w-full h-14 rounded-xl shadow-lg"
          size="lg"
        >
          <Check className="w-5 h-5 mr-2" />
          {isActiveWorkout
            ? `Añadir ${selectedCount} ejercicio${selectedCount === 1 ? "" : "s"} temporalmente`
            : `Añadir ${selectedCount} ejercicio${selectedCount === 1 ? "" : "s"}`}
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};

export default SelectionFloatingButton;
