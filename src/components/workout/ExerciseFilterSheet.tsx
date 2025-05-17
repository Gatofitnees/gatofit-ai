
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import Button from "@/components/Button";

interface ExerciseFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  muscleGroups: string[];
  equipmentTypes: string[];
  muscleFilters: string[];
  equipmentFilters: string[];
  onMuscleFilterToggle: (muscle: string) => void;
  onEquipmentFilterToggle: (equipment: string) => void;
}

const ExerciseFilterSheet: React.FC<ExerciseFilterSheetProps> = ({
  open,
  onOpenChange,
  muscleGroups,
  equipmentTypes,
  muscleFilters,
  equipmentFilters,
  onMuscleFilterToggle,
  onEquipmentFilterToggle
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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

export default ExerciseFilterSheet;
