
import React from "react";
import { Filter } from "lucide-react";
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

interface ExerciseFiltersProps {
  muscleGroups: string[];
  equipmentTypes: string[];
  muscleFilters: string[];
  equipmentFilters: string[];
  onMuscleFilterToggle: (muscle: string) => void;
  onEquipmentFilterToggle: (equipment: string) => void;
}

const ExerciseFilters: React.FC<ExerciseFiltersProps> = ({
  muscleGroups,
  equipmentTypes,
  muscleFilters,
  equipmentFilters,
  onMuscleFilterToggle,
  onEquipmentFilterToggle
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="secondary"
          size="sm"
          leftIcon={<Filter className="h-4 w-4" />}
        >
          Filtrar
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-background/95 backdrop-blur-md border-l border-white/5 w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filtrar Ejercicios</SheetTitle>
        </SheetHeader>
        
        <div className="py-4">
          <h3 className="text-sm font-medium mb-2">Grupos Musculares</h3>
          <div className="grid grid-cols-2 gap-2">
            {muscleGroups.map(muscle => (
              <div key={muscle} className="flex items-center space-x-2">
                <Checkbox 
                  id={`muscle-${muscle}`} 
                  checked={muscleFilters.includes(muscle)}
                  onCheckedChange={() => onMuscleFilterToggle(muscle)}
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

          <h3 className="text-sm font-medium mb-2 mt-6">Equipamiento</h3>
          <div className="grid grid-cols-2 gap-2">
            {equipmentTypes.map(equipment => (
              <div key={equipment} className="flex items-center space-x-2">
                <Checkbox 
                  id={`equipment-${equipment}`}
                  checked={equipmentFilters.includes(equipment)}
                  onCheckedChange={() => onEquipmentFilterToggle(equipment)}
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
        
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="primary" fullWidth>
              Aplicar Filtros
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ExerciseFilters;
