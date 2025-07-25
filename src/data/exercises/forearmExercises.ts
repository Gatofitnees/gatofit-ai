import { Exercise, normalizeDifficulty } from './exerciseTypes';

// Forearm exercises (IDs 6041-6059)
export const forearmExercises: Exercise[] = [
  {
    id: 6041,
    name: "Curl predicador con barra",
    muscle_group_main: "Biceps",
    equipment_required: "Barra Maquina",
    difficulty_level: normalizeDifficulty("Intermedio"),
    description: "Curl de bíceps en banco predicador con barra recta para aislar el trabajo.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Brazo/biceps/curl-predicador-con-barra-recta.mp4",
  },
  {
    id: 6042,
    name: "Curl predicador con barra z",
    muscle_group_main: "Biceps",
    equipment_required: "Barra Maquina",
    difficulty_level: normalizeDifficulty("Intermedio"),
    description: "Curl de bíceps en banco predicador con barra Z para mayor comodidad en muñecas.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Brazo/biceps/curl-predicador-con-barra-z.mp4",
  },
  {
    id: 6043,
    name: "Curl predicador en maquina",
    muscle_group_main: "Biceps",
    equipment_required: "Barra Maquina",
    difficulty_level: normalizeDifficulty("Principiante"),
    description: "Curl de bíceps en máquina de predicador con recorrido guiado.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Brazo/biceps/curl-predicador-en-maquina.mp4",
  },
  {
    id: 6044,
    name: "Curl predicador en polea",
    muscle_group_main: "Biceps",
    equipment_required: "Polea",
    difficulty_level: normalizeDifficulty("Intermedio"),
    description: "Curl de bíceps en banco predicador utilizando polea como resistencia.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Brazo/biceps/curl-predicador-en-polea.mp4",
  },
  {
    id: 6045,
    name: "Curl predicador unilateral",
    muscle_group_main: "Biceps",
    equipment_required: "Mancuerna",
    difficulty_level: normalizeDifficulty("Intermedio"),
    description: "Curl de bíceps en banco predicador realizado con un brazo a la vez.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Brazo/biceps/curl-predicador-unilateral.mp4",
  },
  {
    id: 6046,
    name: "Curl spider con mancuernas",
    muscle_group_main: "Biceps",
    equipment_required: "Mancuerna",
    difficulty_level: normalizeDifficulty("Intermedio"),
    description: "Curl de bíceps en banco inclinado con brazos colgando para mayor estiramiento.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Brazo/biceps/curl-spider-con-mancuernas.mp4",
  },
  {
    id: 6047,
    name: "Curl spider",
    muscle_group_main: "Biceps",
    equipment_required: "Barra",
    difficulty_level: normalizeDifficulty("Intermedio"),
    description: "Curl de bíceps en banco inclinado con barra para mayor estiramiento.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Brazo/biceps/curl-spider.mp4",
  },
  {
    id: 6048,
    name: "Curl unilateral en polea",
    muscle_group_main: "Biceps",
    equipment_required: "Polea",
    difficulty_level: normalizeDifficulty("Principiante"),
    description: "Curl de bíceps en polea realizado con un brazo a la vez.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Brazo/biceps/curl-unilateral-en-polea.mp4",
  },
  {
    id: 6049,
    name: "Curl de antebrazo en banco con barra",
    muscle_group_main: "Antebrazo",
    equipment_required: "Barra",
    difficulty_level: normalizeDifficulty("Principiante"),
    description: "Curl de antebrazo apoyado en banco con barra para desarrollar los flexores.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Brazo/antebrazo/curl-de-antebrazo-en-banco-con-barra.mp4",
  },
  {
    id: 6050,
    name: "Curl de antebrazo en banco con mancuernas",
    muscle_group_main: "Antebrazo",
    equipment_required: "Mancuerna",
    difficulty_level: normalizeDifficulty("Principiante"),
    description: "Curl de antebrazo apoyado en banco con mancuernas para desarrollar los flexores.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Brazo/antebrazo/curl-de-antebrazo-en-banco-con-mancuernas.mp4",
  },
  {
    id: 6051,
    name: "Curl de antebrazo en polea",
    muscle_group_main: "Antebrazo",
    equipment_required: "Polea",
    difficulty_level: normalizeDifficulty("Principiante"),
    description: "Curl de antebrazo utilizando polea para tensión constante.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Brazo/antebrazo/curl-de-antebrazo-en-polea.mp4",
  },
  {
    id: 6052,
    name: "Curl de antebrazo invertido con barra en polea",
    muscle_group_main: "Antebrazo",
    equipment_required: "Polea",
    difficulty_level: normalizeDifficulty("Principiante"),
    description: "Curl inverso de antebrazo en polea para trabajar los extensores.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Brazo/antebrazo/curl-de-antebrazo-invertido-con-barra-en-polea.mp4",
  },
  {
    id: 6053,
    name: "Curl de antebrazo invertido",
    muscle_group_main: "Antebrazo",
    equipment_required: "Barra",
    difficulty_level: normalizeDifficulty("Principiante"),
    description: "Curl inverso de antebrazo con barra para trabajar los extensores.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Brazo/antebrazo/curl-de-antebrazo-invertido.mp4",
  },
  {
    id: 6054,
    name: "Curl de antebrazo unilateral",
    muscle_group_main: "Antebrazo",
    equipment_required: "Mancuerna",
    difficulty_level: normalizeDifficulty("Principiante"),
    description: "Curl de antebrazo realizado con un brazo a la vez.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Brazo/antebrazo/curl-de-antebrazo-unilateral.mp4",
  },
  {
    id: 6055,
    name: "Curl de antebrazo",
    muscle_group_main: "Antebrazo",
    equipment_required: "Barra",
    difficulty_level: normalizeDifficulty("Principiante"),
    description: "Curl básico de antebrazo con barra para desarrollar los flexores.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Brazo/antebrazo/curl-de-antebrazo.mp4",
  },
  {
    id: 6056,
    name: "Curl invertido con mancuerna",
    muscle_group_main: "Biceps Braquial Antebrazo",
    equipment_required: "Mancuerna",
    difficulty_level: normalizeDifficulty("Principiante"),
    description: "Curl de bíceps con agarre en pronación que trabaja braquial y antebrazos.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Brazo/antebrazo/curl-invertido-con-mancuerna.mp4",
  },
  {
    id: 6057,
    name: "Curl invertido",
    muscle_group_main: "Biceps Braquial Antebrazo",
    equipment_required: "Barra",
    difficulty_level: normalizeDifficulty("Principiante"),
    description: "Curl con barra y agarre en pronación que trabaja braquial y antebrazos.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Brazo/antebrazo/curl-invertido.mp4",
  },
  {
    id: 6058,
    name: "Curl de antebrazo invertido con mancuernas",
    muscle_group_main: "Antebrazo",
    equipment_required: "Mancuerna",
    difficulty_level: normalizeDifficulty("Principiante"),
    description: "Curl inverso de antebrazo con mancuernas para trabajar los extensores.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Brazo/antebrazo/curl-de-antebrazo-invertido-con-mancuernas.mp4",
  },
  {
    id: 6059,
    name: "Rodillo de muñeca",
    muscle_group_main: "Antebrazo",
    equipment_required: "Barra",
    difficulty_level: normalizeDifficulty("Intermedio"),
    description: "Ejercicio con rodillo y cuerda para fortalecer antebrazos y mejorar el agarre.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Brazo/antebrazo/rodillo-de-mu%C3%B1eca.mp4",
  },
];
