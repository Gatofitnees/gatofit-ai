
import React from "react";
import { ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RoutineFormProps {
  routineName: string;
  routineType: string;
  validationErrors: {
    name: boolean;
    type: boolean;
  };
  onNameChange: (name: string) => void;
  onTypeChange: (type: string) => void;
}

const RoutineForm: React.FC<RoutineFormProps> = ({
  routineName,
  routineType,
  validationErrors,
  onNameChange,
  onTypeChange
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Nombre de la Rutina</label>
      <input 
        type="text" 
        placeholder="Ej: Día de Pierna" 
        className={`w-full h-10 rounded-xl px-4 bg-secondary border ${validationErrors.name ? 'border-destructive ring-1 ring-destructive' : 'border-transparent'} focus:ring-1 focus:ring-primary outline-none shadow-neu-button`}
        value={routineName}
        onChange={(e) => onNameChange(e.target.value)}
      />
      {validationErrors.name && (
        <p className="mt-1 text-xs text-destructive">Este campo es obligatorio</p>
      )}
      
      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">Tipo de Rutina</label>
        <Select value={routineType} onValueChange={onTypeChange}>
          <SelectTrigger className={`w-full h-10 rounded-xl px-4 bg-secondary border ${validationErrors.type ? 'border-destructive ring-1 ring-destructive' : 'border-transparent'} focus:ring-1 focus:ring-primary outline-none shadow-neu-button`}>
            <SelectValue placeholder="Seleccionar tipo" />
            <ChevronDown className="h-4 w-4 text-primary" />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-sm border border-secondary">
            <SelectGroup>
              <SelectItem value="strength">Fuerza</SelectItem>
              <SelectItem value="cardio">Cardio</SelectItem>
              <SelectItem value="flexibility">Flexibilidad</SelectItem>
              <SelectItem value="mixed">Mixto</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {validationErrors.type && (
          <p className="mt-1 text-xs text-destructive">Este campo es obligatorio</p>
        )}
      </div>
    </div>
  );
};

export default RoutineForm;
