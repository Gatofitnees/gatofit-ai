
export interface RankInfo {
  name: string;
  description: string;
  icon: string;
  color: string;
  textColor: string;
}

export const RANKS: Record<string, RankInfo> = {
  'Gatito Novato': {
    name: 'Gatito Novato',
    description: 'Todo gran felino empieza con un primer salto.',
    icon: '🐱',
    color: 'from-gray-400 to-gray-500',
    textColor: 'text-gray-400'
  },
  'Gato Curioso': {
    name: 'Gato Curioso',
    description: 'Exploras tu fuerza. Te mueves. Estás despierto.',
    icon: '😸',
    color: 'from-yellow-400 to-yellow-500',
    textColor: 'text-yellow-400'
  },
  'Gato Enérgico': {
    name: 'Gato Enérgico',
    description: 'La energía fluye y ya no te detienes.',
    icon: '😺',
    color: 'from-lime-400 to-lime-500',
    textColor: 'text-lime-400'
  },
  'Gato Entrenado': {
    name: 'Gato Entrenado',
    description: 'Tu constancia te empieza a definir.',
    icon: '💪',
    color: 'from-blue-400 to-blue-500',
    textColor: 'text-blue-400'
  },
  'Gato Feroz': {
    name: 'Gato Feroz',
    description: 'Tus garras ya están afiladas. Vas en serio.',
    icon: '😾',
    color: 'from-orange-400 to-red-500',
    textColor: 'text-orange-400'
  },
  'Gato Maestro': {
    name: 'Gato Maestro',
    description: 'Controlas tu cuerpo, tu mente y tu entrenamiento.',
    icon: '🧘',
    color: 'from-purple-400 to-purple-500',
    textColor: 'text-purple-400'
  },
  'Gato Alpha': {
    name: 'Gato Alpha',
    description: 'Lideras el cambio. Otros empiezan a seguirte.',
    icon: '👑',
    color: 'from-indigo-400 to-blue-600',
    textColor: 'text-indigo-400'
  },
  'Gato Legendario': {
    name: 'Gato Legendario',
    description: 'Tu historia ya se cuenta entre los grandes.',
    icon: '⚔️',
    color: 'from-yellow-300 to-yellow-500',
    textColor: 'text-yellow-300'
  },
  'Gato Místico': {
    name: 'Gato Místico',
    description: 'Eres una leyenda viva. Parece magia, pero es trabajo.',
    icon: '✨',
    color: 'from-white to-purple-200',
    textColor: 'text-white'
  },
  'Gato Inmortal': {
    name: 'Gato Inmortal',
    description: 'El entrenamiento es tu esencia. No paras. No caes.',
    icon: '👑',
    color: 'from-black via-yellow-400 to-black',
    textColor: 'text-transparent bg-clip-text bg-gradient-to-r from-black via-yellow-400 to-black'
  }
};

export const getRankFromLevel = (level: number): RankInfo => {
  if (level >= 91) return RANKS['Gato Inmortal'];
  if (level >= 81) return RANKS['Gato Místico'];
  if (level >= 71) return RANKS['Gato Legendario'];
  if (level >= 61) return RANKS['Gato Alpha'];
  if (level >= 51) return RANKS['Gato Maestro'];
  if (level >= 41) return RANKS['Gato Feroz'];
  if (level >= 31) return RANKS['Gato Entrenado'];
  if (level >= 21) return RANKS['Gato Enérgico'];
  if (level >= 11) return RANKS['Gato Curioso'];
  return RANKS['Gatito Novato'];
};

export const getExperienceProgress = (totalExperience: number) => {
  const level = Math.floor(totalExperience / 100) + 1;
  const currentLevelXP = totalExperience % 100;
  const nextLevelXP = 100;
  const progress = (currentLevelXP / nextLevelXP) * 100;
  
  return {
    level,
    currentLevelXP,
    nextLevelXP,
    progress
  };
};
