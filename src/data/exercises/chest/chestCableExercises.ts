import { Exercise, normalizeDifficulty } from '../exerciseTypes';

// Chest exercises with cables (IDs 3039-3046)
export const chestCableExercises: Exercise[] = [
  {
    id: 3001,
    name: "Aperturas con banda",
    muscle_group_main: "Pecho",
    equipment_required: "Banda",
    difficulty_level: normalizeDifficulty("Principiante"),
    description: "Ejercicio para pecho que utiliza bandas de resistencia para simular el movimiento de aperturas.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/aperturas-con-banda.mp4",
  },
  {
    id: 3002,
    name: "Aperturas en polea baja",
    muscle_group_main: "Pecho",
    equipment_required: "Polea",
    difficulty_level: normalizeDifficulty("Intermedio"),
    description: "Aperturas realizadas con poleas bajas para enfatizar la parte inferior del pecho.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/aperturas-en-polea-baja.mp4",
  },
  {
    id: 3003,
    name: "Aperturas en polea media",
    muscle_group_main: "Pecho",
    equipment_required: "Polea",
    difficulty_level: normalizeDifficulty("Intermedio"),
    description: "Aperturas realizadas con poleas a altura media para trabajar el pecho de manera uniforme.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/aperturas-en-polea-media.mp4",
  },
  {
    id: 3004,
    name: "Aperturas en polea media con banco",
    muscle_group_main: "Pecho",
    equipment_required: "Polea",
    difficulty_level: normalizeDifficulty("Intermedio"),
    description: "Aperturas con poleas a altura media utilizando un banco para mayor estabilidad.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/aperturas-en-polea-media-con-banco.mp4",
  },
  {
    id: 3019,
    name: "Press en polea",
    muscle_group_main: "Pecho",
    equipment_required: "Polea",
    difficulty_level: normalizeDifficulty("Intermedio"),
    description: "Press para pecho utilizando poleas que proporciona tensión constante durante todo el movimiento.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/press-en-polea.mp4",
  },
  {
    id: 3021,
    name: "Press inclinado en polea con banco",
    muscle_group_main: "Pecho",
    equipment_required: "Polea",
    difficulty_level: normalizeDifficulty("Intermedio"),
    description: "Press inclinado utilizando poleas con un banco como soporte para trabajar la parte superior del pecho.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/press-inclinado-en-polea-con-banco.mp4",
  },
  {
    id: 3026,
    name: "Press plano en polea",
    muscle_group_main: "Pecho",
    equipment_required: "Polea",
    difficulty_level: normalizeDifficulty("Intermedio"),
    description: "Press horizontal utilizando poleas que proporciona tensión constante durante todo el movimiento.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/press-plano-en-polea.mp4",
  },
  {
    id: 3034,
    name: "Aperturas en polea alta",
    muscle_group_main: "Pecho",
    equipment_required: "Polea",
    difficulty_level: normalizeDifficulty("Intermedio"),
    description: "Ejercicio de aperturas realizado con poleas altas que permite mantener tensión constante en los músculos pectorales.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Pecho/aperturas-en-polea-alta.mp4",
  },
];
