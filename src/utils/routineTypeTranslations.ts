
export const translateRoutineType = (routineType: string | null): string => {
  if (!routineType) return '';
  
  const translations: Record<string, string> = {
    'strength': 'Fuerza',
    'cardio': 'Cardio', 
    'flexibility': 'Flexibilidad',
    'endurance': 'Resistencia',
    'hiit': 'HIIT',
    'yoga': 'Yoga',
    'pilates': 'Pilates',
    'crossfit': 'CrossFit',
    'bodyweight': 'Peso corporal',
    'powerlifting': 'Powerlifting',
    'olympic': 'Olímpico',
    'mixed': 'Mixto'
  };
  
  return translations[routineType.toLowerCase()] || routineType;
};
