
import React from "react";
import { ROUTINE_TYPES_FOR_UI } from "../utils/routineTypeMapping";

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
    <>
      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Nombre de la rutina *
        </label>
        <input
          type="text"
          value={routineName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ej: Rutina de fuerza para principiantes"
          className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 text-foreground placeholder:text-muted-foreground ${
            validationErrors.name ? 'border-red-500' : 'border-border'
          }`}
        />
        {validationErrors.name && (
          <p className="text-red-500 text-xs mt-1">El nombre es requerido</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Tipo de rutina *
        </label>
        <select
          value={routineType}
          onChange={(e) => onTypeChange(e.target.value)}
          className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 text-foreground appearance-none ${
            validationErrors.type ? 'border-red-500' : 'border-border'
          }`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem'
          }}
        >
          <option value="" className="text-muted-foreground">Selecciona un tipo</option>
          {ROUTINE_TYPES_FOR_UI.map((type) => (
            <option key={type.value} value={type.value} className="text-foreground bg-background">
              {type.label}
            </option>
          ))}
        </select>
        {validationErrors.type && (
          <p className="text-red-500 text-xs mt-1">El tipo es requerido</p>
        )}
      </div>
    </>
  );
};

export default RoutineForm;
