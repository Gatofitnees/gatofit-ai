
import React from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/Card";
import Button from "@/components/Button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RoutineFormProps {
  routineName: string;
  routineType: string;
  routineDescription: string;
  onRoutineNameChange: (value: string) => void;
  onRoutineTypeChange: (value: string) => void;
  onRoutineDescriptionChange: (value: string) => void;
  onAddExercises: () => void;
}

const RoutineForm: React.FC<RoutineFormProps> = ({
  routineName,
  routineType,
  routineDescription,
  onRoutineNameChange,
  onRoutineTypeChange,
  onRoutineDescriptionChange,
  onAddExercises,
}) => {
  return (
    <div className="animate-fade-in">
      <Card>
        <CardHeader title="Crear Nueva Rutina" />
        <CardBody>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre de la Rutina</label>
              <input 
                type="text" 
                placeholder="Ej: Día de Pierna" 
                value={routineName}
                onChange={(e) => onRoutineNameChange(e.target.value)}
                className="w-full h-10 rounded-xl px-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Rutina</label>
              <Select value={routineType} onValueChange={onRoutineTypeChange}>
                <SelectTrigger className="w-full h-10 rounded-xl px-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button">
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
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
              <textarea 
                rows={3}
                placeholder="Describe brevemente esta rutina..." 
                value={routineDescription}
                onChange={(e) => onRoutineDescriptionChange(e.target.value)}
                className="w-full rounded-xl p-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button resize-none"
              />
            </div>
            
            <div className="pt-2">
              <Button 
                variant="primary" 
                fullWidth 
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={onAddExercises}
              >
                Añadir Ejercicios
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default RoutineForm;
