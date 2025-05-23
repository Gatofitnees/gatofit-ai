
import React, { useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExerciseSearch from "@/components/exercise/ExerciseSearch";
import ExerciseFilters from "@/components/exercise/ExerciseFilters";

interface ExerciseSelectionHeaderProps {
  searchTerm: string;
  muscleGroups: string[];
  equipmentTypes: string[];
  muscleFilters: string[];
  equipmentFilters: string[];
  isActiveWorkout?: boolean;
  onSearchChange: (term: string) => void;
  onMuscleFilterToggle: (muscle: string) => void;
  onEquipmentFilterToggle: (equipment: string) => void;
  onNavigateBack: () => void;
}

const ExerciseSelectionHeader: React.FC<ExerciseSelectionHeaderProps> = ({
  searchTerm,
  onSearchChange,
  muscleGroups,
  equipmentTypes,
  muscleFilters,
  equipmentFilters,
  isActiveWorkout,
  onMuscleFilterToggle,
  onEquipmentFilterToggle,
  onNavigateBack,
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [clearSearch, setClearSearch] = useState(false);

  const handleClearSearch = () => {
    onSearchChange("");
    setClearSearch(true);
    setTimeout(() => setClearSearch(false), 100); // Reset clear flag
  };

  const toggleFilters = () => setFiltersOpen(!filtersOpen);

  return (
    <div className="sticky top-0 z-10 bg-background pt-6 px-4 pb-2 shadow-sm">
      {/* Header row with back button */}
      <div className="mb-3 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onNavigateBack}
          className="h-10 w-10 rounded-full"
        >
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-lg font-semibold">
          {isActiveWorkout 
            ? "Añadir ejercicio temporal" 
            : "Seleccionar ejercicios"}
        </h1>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      {isActiveWorkout && (
        <div className="mb-3 p-2 bg-yellow-100 text-yellow-800 text-xs rounded-md">
          Estos ejercicios solo se añadirán a tu sesión actual y no modificarán la rutina base.
        </div>
      )}
      
      {/* Search input */}
      <div className="relative mb-3">
        <ExerciseSearch 
          value={searchTerm} 
          onChange={onSearchChange}
          onFilterToggle={toggleFilters} 
          clearSearch={clearSearch}
          activeFiltersCount={muscleFilters.length + equipmentFilters.length}
        />
        
        {searchTerm && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClearSearch}
            className="absolute right-12 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
          >
            <X size={16} />
          </Button>
        )}
      </div>

      {/* Filters section */}
      {filtersOpen && (
        <div className="mb-3">
          <ExerciseFilters
            muscleGroups={muscleGroups}
            equipmentTypes={equipmentTypes}
            selectedMuscleGroups={muscleFilters}
            selectedEquipmentTypes={equipmentFilters}
            onMuscleGroupToggle={onMuscleFilterToggle}
            onEquipmentTypeToggle={onEquipmentFilterToggle}
          />
        </div>
      )}
    </div>
  );
};

export default ExerciseSelectionHeader;
