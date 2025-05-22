
import { chestExercises } from "./exercises/chest";
import { backExercises } from "./exercises/backExercises";
import { shoulderExercises } from "./exercises/shoulderExercises";
import { armExercises } from "./exercises/armExercises";
import { legExercises } from "./exercises/legExercises";
import { abdominalExercises } from "./exercises/abdominalExercises";
import { cardioExercises } from "./exercises/cardioExercises";
import { forearmExercises } from "./exercises/forearmExercises";

// Ejercicios a eliminar por ser duplicados o por solicitud del usuario
const exercisesToRemove = [
  /workout/exercise-details/1 , 
  "Pull-up", 
  "Deadlift", 
  "Peso muerto",
  "Dominadas", 
  "Burpees",
  "Mountain climbers", 
  "Push-up", 
  "Bench Press", 
  "Squat", 
  "Sentadilla"
];

// Filtrar todos los ejercicios para eliminar los duplicados
const filteredChestExercises = chestExercises.filter(ex => !exercisesToRemove.includes(ex.name));
const filteredBackExercises = backExercises.filter(ex => !exercisesToRemove.includes(ex.name));
const filteredShoulderExercises = shoulderExercises.filter(ex => !exercisesToRemove.includes(ex.name));
const filteredArmExercises = armExercises.filter(ex => !exercisesToRemove.includes(ex.name));
const filteredLegExercises = legExercises.filter(ex => !exercisesToRemove.includes(ex.name));
const filteredAbdominalExercises = abdominalExercises.filter(ex => !exercisesToRemove.includes(ex.name));
const filteredCardioExercises = cardioExercises.filter(ex => !exercisesToRemove.includes(ex.name));
const filteredForearmExercises = forearmExercises.filter(ex => !exercisesToRemove.includes(ex.name));

// Combinar todos los ejercicios filtrados
export const preloadedExercises = [
  ...filteredChestExercises,
  ...filteredBackExercises,
  ...filteredShoulderExercises,
  ...filteredArmExercises,
  ...filteredLegExercises,
  ...filteredAbdominalExercises,
  ...filteredCardioExercises,
  ...filteredForearmExercises
];
