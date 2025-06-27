
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useExerciseFilterOptions } from "@/features/workout/hooks/useExerciseFilterOptions";

interface ExerciseFormProps {
  formState: {
    name: string;
    description: string;
    muscleGroups: string[];
    equipmentTypes: string[];
    difficulty: string;
  };
  setters: {
    setName: (value: string) => void;
    setDescription: (value: string) => void;
    setMuscleGroups: (value: string[]) => void;
    setEquipmentTypes: (value: string[]) => void;
    setDifficulty: (value: string) => void;
  };
}

const difficultyLevels = [
  "Principiante", "Intermedio", "Avanzado"
];

const ExerciseForm: React.FC<ExerciseFormProps> = ({ formState, setters }) => {
  const { name, description, muscleGroups, equipmentTypes, difficulty } = formState;
  const { setName, setDescription, setMuscleGroups, setEquipmentTypes, setDifficulty } = setters;
  
  const { muscleGroups: availableMuscleGroups, equipmentTypes: availableEquipmentTypes } = useExerciseFilterOptions();

  const handleMuscleGroupToggle = (muscle: string) => {
    const newMuscleGroups = muscleGroups.includes(muscle)
      ? muscleGroups.filter(m => m !== muscle)
      : [...muscleGroups, muscle];
    setMuscleGroups(newMuscleGroups);
  };

  const handleEquipmentToggle = (equipment: string) => {
    const newEquipmentTypes = equipmentTypes.includes(equipment)
      ? equipmentTypes.filter(e => e !== equipment)
      : [...equipmentTypes, equipment];
    setEquipmentTypes(newEquipmentTypes);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nombre del Ejercicio*</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Press de Banca"
          className="w-full h-10 rounded-xl px-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Grupo muscular*</label>
        <div className="grid grid-cols-2 gap-2 p-4 bg-secondary rounded-xl shadow-neu-button">
          {availableMuscleGroups.map((muscle) => (
            <div key={muscle} className="flex items-center space-x-2">
              <Checkbox 
                id={`muscle-${muscle}`} 
                checked={muscleGroups.includes(muscle)}
                onCheckedChange={() => handleMuscleGroupToggle(muscle)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label 
                htmlFor={`muscle-${muscle}`}
                className="text-sm cursor-pointer"
              >
                {muscle}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Equipamiento Necesario</label>
        <div className="grid grid-cols-2 gap-2 p-4 bg-secondary rounded-xl shadow-neu-button">
          {availableEquipmentTypes.map((equipment) => (
            <div key={equipment} className="flex items-center space-x-2">
              <Checkbox 
                id={`equipment-${equipment}`}
                checked={equipmentTypes.includes(equipment)}
                onCheckedChange={() => handleEquipmentToggle(equipment)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label 
                htmlFor={`equipment-${equipment}`}
                className="text-sm cursor-pointer"
              >
                {equipment}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nivel de Dificultad</label>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-full h-10 rounded-xl bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button">
            <SelectValue placeholder="Seleccionar dificultad" />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-sm border border-secondary">
            {difficultyLevels.map((level) => (
              <SelectItem key={level} value={level}>{level}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe cómo realizar correctamente el ejercicio..."
          rows={4}
          className="w-full rounded-xl p-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button resize-none"
        />
      </div>
    </div>
  );
};

export default ExerciseForm;
