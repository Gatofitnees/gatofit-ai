
interface Exercise {
  id: number;
  name: string;
  muscle_group_main: string;
  equipment_required?: string;
  difficulty_level?: string;
  video_url?: string;
  description?: string;
}

// Cardio exercises (IDs 8001-8010)
export const cardioExercises: Exercise[] = [
  {
    id: 8001,
    name: "Bicicleta elíptica",
    muscle_group_main: "Cardio",
    equipment_required: "Maquina",
    difficulty_level: "Principiante",
    description: "Ejercicio cardiovascular de bajo impacto en máquina elíptica.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Cardio/bicicleta-eliptica.mp4",
  },
  {
    id: 8002,
    name: "Bicicleta estacionaria",
    muscle_group_main: "Cardio",
    equipment_required: "Maquina",
    difficulty_level: "Principiante",
    description: "Ejercicio cardiovascular en bicicleta estática.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Cardio/bicicleta-estacionaria.mp4",
  },
  {
    id: 8003,
    name: "Burpees",
    muscle_group_main: "Cardio",
    equipment_required: "Libre",
    difficulty_level: "Intermedio",
    description: "Ejercicio de alta intensidad que combina sentadilla, plancha y salto.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Cardio/burpee.mp4",
  },
  {
    id: 8004,
    name: "Caminar",
    muscle_group_main: "Cardio",
    equipment_required: "Libre Maquina",
    difficulty_level: "Principiante",
    description: "Actividad cardiovascular básica de bajo impacto.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Cardio/caminar.mp4",
  },
  {
    id: 8005,
    name: "Caminata inclinado",
    muscle_group_main: "Cardio",
    equipment_required: "Libre Maquina",
    difficulty_level: "Principiante",
    description: "Caminata en superficie o cinta con inclinación para mayor intensidad.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Cardio/caminata-inclinado.mp4",
  },
  {
    id: 8006,
    name: "Correr",
    muscle_group_main: "Cardio",
    equipment_required: "Libre Maquina",
    difficulty_level: "Intermedio",
    description: "Actividad cardiovascular de mayor intensidad que la caminata.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Cardio/correr.mp4",
  },
  {
    id: 8007,
    name: "Cuerda de batalla",
    muscle_group_main: "Cardio",
    equipment_required: "Libre",
    difficulty_level: "Intermedio",
    description: "Ejercicio con cuerdas pesadas que combina cardio y fuerza.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Cardio/cuerda-de-batalla.mp4",
  },
  {
    id: 8008,
    name: "Remo",
    muscle_group_main: "Cardio",
    equipment_required: "Maquina",
    difficulty_level: "Principiante",
    description: "Ejercicio cardiovascular en máquina de remo que también trabaja músculos.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Cardio/remo.mp4",
  },
  {
    id: 8009,
    name: "Saltar",
    muscle_group_main: "Cardio",
    equipment_required: "Libre",
    difficulty_level: "Principiante",
    description: "Ejercicio cardiovascular básico que implica saltos continuos.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Cardio/saltar.mp4",
  },
  {
    id: 8010,
    name: "Saltos de cajón",
    muscle_group_main: "Cardio",
    equipment_required: "Libre",
    difficulty_level: "Intermedio",
    description: "Saltos explosivos sobre un cajón o plataforma elevada.",
    video_url: "https://storage.googleapis.com/almacenamiento-app-gatofit/Ejercicios%20APP/Cardio/saltos-de-cajon.mp4",
  },
];
