
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { muscleGroups, equipmentTypes, difficultyLevels } from "../data/constants";

interface ExerciseFormProps {
  formState: {
    name: string;
    description: string;
    muscleGroup: string;
    equipment: string;
    difficulty: string;
  };
  setters: {
    setName: (value: string) => void;
    setDescription: (value: string) => void;
    setMuscleGroup: (value: string) => void;
    setEquipment: (value: string) => void;
    setDifficulty: (value: string) => void;
  };
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({ formState, setters }) => {
  const { name, description, muscleGroup, equipment, difficulty } = formState;
  const { setName, setDescription, setMuscleGroup, setEquipment, setDifficulty } = setters;

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
        <label className="block text-sm font-medium mb-1">Grupo Muscular Principal*</label>
        <Select value={muscleGroup} onValueChange={setMuscleGroup}>
          <SelectTrigger className="w-full h-10 rounded-xl bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button">
            <SelectValue placeholder="Seleccionar grupo muscular" />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-sm border border-secondary">
            {muscleGroups.map((group) => (
              <SelectItem key={group} value={group}>{group}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Equipamiento Necesario</label>
        <Select value={equipment} onValueChange={setEquipment}>
          <SelectTrigger className="w-full h-10 rounded-xl bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button">
            <SelectValue placeholder="Seleccionar equipamiento" />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-sm border border-secondary">
            {equipmentTypes.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
