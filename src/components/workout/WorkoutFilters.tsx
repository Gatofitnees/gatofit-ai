
import React, { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { ROUTINE_TYPES_FOR_UI } from "@/features/workout/utils/routineTypeMapping";
import { supabase } from "@/integrations/supabase/client";

interface WorkoutFiltersProps {
  onFiltersChange: (filters: { types: string[], muscles: string[] }) => void;
  activeFilters: { types: string[], muscles: string[] };
}

const WorkoutFilters: React.FC<WorkoutFiltersProps> = ({ 
  onFiltersChange, 
  activeFilters 
}) => {
  const [availableMuscles, setAvailableMuscles] = useState<string[]>([]);
  const [tempFilters, setTempFilters] = useState(activeFilters);

  // Obtener grupos musculares disponibles en las rutinas del usuario
  useEffect(() => {
    const fetchAvailableMuscles = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('routines')
          .select(`
            routine_exercises!inner(
              exercise:exercise_id!inner(
                muscle_group_main
              )
            )
          `)
          .eq('user_id', user.id)
          .eq('is_predefined', false);

        if (error) {
          console.error("Error fetching muscle groups:", error);
          return;
        }

        const muscleSet = new Set<string>();
        data?.forEach(routine => {
          routine.routine_exercises?.forEach(re => {
            if (re.exercise?.muscle_group_main) {
              re.exercise.muscle_group_main.split(/[,\s]+/).forEach(muscle => {
                if (muscle.trim()) {
                  muscleSet.add(muscle.trim().charAt(0).toUpperCase() + muscle.trim().slice(1));
                }
              });
            }
          });
        });

        setAvailableMuscles(Array.from(muscleSet).sort());
      } catch (error) {
        console.error("Error fetching available muscles:", error);
      }
    };

    fetchAvailableMuscles();
  }, []);

  const handleTypeToggle = (type: string) => {
    const newTypes = tempFilters.types.includes(type)
      ? tempFilters.types.filter(t => t !== type)
      : [...tempFilters.types, type];
    
    setTempFilters(prev => ({ ...prev, types: newTypes }));
  };

  const handleMuscleToggle = (muscle: string) => {
    const newMuscles = tempFilters.muscles.includes(muscle)
      ? tempFilters.muscles.filter(m => m !== muscle)
      : [...tempFilters.muscles, muscle];
    
    setTempFilters(prev => ({ ...prev, muscles: newMuscles }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters = { types: [], muscles: [] };
    setTempFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const totalActiveFilters = activeFilters.types.length + activeFilters.muscles.length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="relative">
          <Button 
            variant="secondary"
            size="sm"
            leftIcon={<Filter className="h-4 w-4" />}
          >
            Filtrar
          </Button>
          {totalActiveFilters > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {totalActiveFilters}
            </Badge>
          )}
        </div>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filtrar Rutinas</SheetTitle>
        </SheetHeader>
        
        <div className="py-4 space-y-6">
          {/* Filtros de tipo */}
          <div>
            <h3 className="text-sm font-medium mb-3">Tipo de rutina</h3>
            <div className="grid grid-cols-2 gap-2">
              {ROUTINE_TYPES_FOR_UI.map(type => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`type-${type.value}`} 
                    checked={tempFilters.types.includes(type.label)}
                    onCheckedChange={() => handleTypeToggle(type.label)}
                  />
                  <label 
                    htmlFor={`type-${type.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Filtros de músculos */}
          {availableMuscles.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Grupos musculares</h3>
              <div className="grid grid-cols-2 gap-2">
                {availableMuscles.map(muscle => (
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
          )}

          {/* Mostrar filtros activos */}
          {totalActiveFilters > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Filtros activos</h3>
              <div className="flex flex-wrap gap-2">
                {activeFilters.types.map(type => (
                  <Badge key={`active-type-${type}`} variant="secondary">
                    {type}
                  </Badge>
                ))}
                {activeFilters.muscles.map(muscle => (
                  <Badge key={`active-muscle-${muscle}`} variant="secondary">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <SheetFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleClearFilters}
            className="flex-1"
          >
            Limpiar
          </Button>
          <SheetClose asChild>
            <Button 
              variant="primary" 
              onClick={handleApplyFilters}
              className="flex-1"
            >
              Aplicar
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default WorkoutFilters;
