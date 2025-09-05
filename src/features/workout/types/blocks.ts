export type BlockType = "warmup" | "effective_sets";

export interface WorkoutBlock {
  id: string;
  type: BlockType;
  name: string;
  exercises: number[]; // Array of exercise indices from routineExercises
  order: number;
}

export interface BlockTypeOption {
  value: BlockType;
  label: string;
  description: string;
}

export const BLOCK_TYPE_OPTIONS: BlockTypeOption[] = [
  {
    value: "warmup",
    label: "Calentamiento",
    description: "Ejercicios de preparación y activación"
  },
  {
    value: "effective_sets",
    label: "Series Efectivas", 
    description: "Ejercicios principales del entrenamiento"
  }
];

export const getBlockTypeName = (type: BlockType): string => {
  const option = BLOCK_TYPE_OPTIONS.find(opt => opt.value === type);
  return option?.label || type;
};