
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
        <label className="block text-sm font-medium mb-2">
          Nombre de la rutina *
        </label>
        <input
          type="text"
          value={routineName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ej: Rutina de fuerza para principiantes"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
            validationErrors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {validationErrors.name && (
          <p className="text-red-500 text-xs mt-1">El nombre es requerido</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Tipo de rutina *
        </label>
        <select
          value={routineType}
          onChange={(e) => onTypeChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${
            validationErrors.type ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Selecciona un tipo</option>
          {ROUTINE_TYPES_FOR_UI.map((type) => (
            <option key={type.value} value={type.value}>
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
