
import React, { useState } from "react";
import { Filter, X } from "lucide-react";
import Button from "@/components/Button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";

interface WorkoutFiltersProps {
  onFiltersChange: (filters: { types: string[], muscles: string[] }) => void;
  activeFilters: { types: string[], muscles: string[] };
}

const routineTypes = [
  "Fuerza",
  "Cardio", 
  "Mixto",
  "Flexibilidad",
  "Resistencia"
];

const muscleGroups = [
  "Pecho",
  "Espalda", 
  "Piernas",
  "Hombros",
  "Bíceps",
  "Tríceps",
  "Core",
  "Glúteos"
];

const WorkoutFilters: React.FC<WorkoutFiltersProps> = ({ onFiltersChange, activeFilters }) => {
  const [tempFilters, setTempFilters] = useState(activeFilters);

  const handleTypeToggle = (type: string) => {
    const newTypes = tempFilters.types.includes(type)
      ? tempFilters.types.filter(t => t !== type)
      : [...tempFilters.types, type];
    
    setTempFilters({ ...tempFilters, types: newTypes });
  };

  const handleMuscleToggle = (muscle: string) => {
    const newMuscles = tempFilters.muscles.includes(muscle)
      ? tempFilters.muscles.filter(m => m !== muscle)
      : [...tempFilters.muscles, muscle];
    
    setTempFilters({ ...tempFilters, muscles: newMuscles });
  };

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters = { types: [], muscles: [] };
    setTempFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = activeFilters.types.length > 0 || activeFilters.muscles.length > 0;
  const totalActiveFilters = activeFilters.types.length + activeFilters.muscles.length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="secondary"
          size="sm"
          leftIcon={<Filter className="h-4 w-4" />}
          className={hasActiveFilters ? "bg-primary/20 border-primary/30" : ""}
        >
          Filtrar
          {totalActiveFilters > 0 && (
            <span className="ml-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
              {totalActiveFilters}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-background/95 backdrop-blur-md border-l border-white/5 w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filtrar Rutinas</SheetTitle>
        </SheetHeader>
        
        <div className="py-4 space-y-6">
          {/* Routine Types */}
          <div>
            <h3 className="text-sm font-medium mb-3">Tipo de Rutina</h3>
            <div className="space-y-2">
              {routineTypes.map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`type-${type}`} 
                    checked={tempFilters.types.includes(type)}
                    onCheckedChange={() => handleTypeToggle(type)}
                  />
                  <label 
                    htmlFor={`type-${type}`}
                    className="text-sm cursor-pointer"
                  >
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Muscle Groups */}
          <div>
            <h3 className="text-sm font-medium mb-3">Grupo Muscular</h3>
            <div className="grid grid-cols-2 gap-2">
              {muscleGroups.map(muscle => (
                <div key={muscle} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`muscle-${muscle}`}
                    checked={tempFilters.muscles.includes(muscle)}
                    onCheckedChange={() => handleMuscleToggle(muscle)}
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
        </div>
        
        <SheetFooter className="flex-col gap-2">
          <Button 
            variant="outline" 
            fullWidth 
            onClick={handleClearFilters}
            leftIcon={<X className="h-4 w-4" />}
          >
            Limpiar Filtros
          </Button>
          <SheetClose asChild>
            <Button variant="primary" fullWidth onClick={handleApplyFilters}>
              Aplicar Filtros
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default WorkoutFilters;
