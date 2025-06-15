
import { useMemo } from 'react';
import { preloadedExercises } from "@/data/preloadedExercises";
import { additionalExercises } from "@/data/additionalExercises";
import { Exercise } from '../types';

const getUniqueValues = (key: keyof Pick<Exercise, 'muscle_group_main' | 'equipment_required'>) => {
  const valueSet = new Set<string>();
  const allExercises = [...preloadedExercises, ...additionalExercises];

  allExercises.forEach(exercise => {
    const property = exercise[key];
    if (property) {
      property.split(/[ ,]+/).forEach(value => {
        if (value.trim()) {
          const a = value.trim();
          valueSet.add(a.charAt(0).toUpperCase() + a.slice(1));
        }
      });
    }
  });

  return Array.from(valueSet).sort();
};

export const useExerciseFilterOptions = () => {
  const muscleGroups = useMemo(() => getUniqueValues('muscle_group_main'), []);
  const equipmentTypes = useMemo(() => getUniqueValues('equipment_required'), []);

  return { muscleGroups, equipmentTypes };
};
