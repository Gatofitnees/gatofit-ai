
export const ROUTINE_TYPE_MAPPING = {
  // Español -> Inglés (para guardar en DB)
  'fuerza': 'strength',
  'cardio': 'cardio',
  'flexibilidad': 'flexibility',
  'funcional': 'functional',
  'hiit': 'hiit',
  'yoga': 'yoga',
  'pilates': 'pilates',
  'crossfit': 'crossfit',
  'powerlifting': 'powerlifting',
  'bodybuilding': 'bodybuilding',
  'rehabilitacion': 'rehabilitation',
  'general': 'general'
} as const;

export const ROUTINE_TYPE_REVERSE_MAPPING = {
  // Inglés -> Español (para mostrar en UI)
  'strength': 'Fuerza',
  'cardio': 'Cardio',
  'flexibility': 'Flexibilidad',
  'functional': 'Funcional',
  'hiit': 'HIIT',
  'yoga': 'Yoga',
  'pilates': 'Pilates',
  'crossfit': 'CrossFit',
  'powerlifting': 'Powerlifting',
  'bodybuilding': 'Bodybuilding',
  'rehabilitation': 'Rehabilitación',
  'general': 'General'
} as const;

export const ROUTINE_TYPES_FOR_UI = [
  { value: 'fuerza', label: 'Fuerza' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibilidad', label: 'Flexibilidad' },
  { value: 'funcional', label: 'Funcional' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'pilates', label: 'Pilates' },
  { value: 'crossfit', label: 'CrossFit' },
  { value: 'powerlifting', label: 'Powerlifting' },
  { value: 'bodybuilding', label: 'Bodybuilding' },
  { value: 'rehabilitacion', label: 'Rehabilitación' },
  { value: 'general', label: 'General' }
];

export const convertRoutineTypeToDb = (uiType: string): string => {
  return ROUTINE_TYPE_MAPPING[uiType as keyof typeof ROUTINE_TYPE_MAPPING] || uiType;
};

export const convertRoutineTypeToUi = (dbType: string): string => {
  return ROUTINE_TYPE_REVERSE_MAPPING[dbType as keyof typeof ROUTINE_TYPE_REVERSE_MAPPING] || dbType;
};
