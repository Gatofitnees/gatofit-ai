
import { Exercise, normalizeDifficulty } from '../exerciseTypes';

// Chest exercises with barbell (IDs 3001-3016)
export const chestBarbellExercises: Exercise[] = [
  {
    id: 3014,
    name: "Press banca declinado",
    muscle_group_main: "Pecho",
    equipment_required: "Barra",
    difficulty_level: normalizeDifficulty("Intermedio"),
    description: "Press de banca realizado en banco declinado para enfatizar la parte inferior del pecho.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/press-banca-declinado.mp4",
  },
  {
    id: 3015,
    name: "Press banca inclinado",
    muscle_group_main: "Pecho",
    equipment_required: "Barra",
    difficulty_level: normalizeDifficulty("Intermedio"),
    description: "Press de banca realizado en banco inclinado para enfatizar la parte superior del pecho.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/press-banca-inclinado.mp4",
  },
  {
    id: 3016,
    name: "Press banca plano",
    muscle_group_main: "Pecho",
    equipment_required: "Barra",
    difficulty_level: normalizeDifficulty("Intermedio"),
    description: "Ejercicio clásico para desarrollo del pecho utilizando una barra en banco plano.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/press-banca-plano.mp4",
  },
];
