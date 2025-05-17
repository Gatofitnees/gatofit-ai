
import React from "react";
import { ArrowLeft, Filter } from "lucide-react";
import Button from "@/components/Button";
import ExerciseSearchBar from "@/components/workout/ExerciseSearchBar";

interface ExerciseSelectionHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onBackClick: () => void;
  onFilterClick: () => void;
  routineId?: number;
  routineName?: string;
}

const ExerciseSelectionHeader: React.FC<ExerciseSelectionHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onBackClick,
  onFilterClick,
  routineId,
  routineName
}) => {
  return (
    <div className="sticky top-0 z-10 bg-background p-4 border-b border-muted/20">
      <div className="flex items-center mb-4">
        <button 
          onClick={onBackClick}
          className="mr-3 p-1 rounded-full hover:bg-secondary/50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Seleccionar Ejercicios</h1>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-2">
        <ExerciseSearchBar 
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
        />

        <Button 
          variant="secondary"
          size="sm"
          leftIcon={<Filter className="h-4 w-4" />}
          onClick={onFilterClick}
        >
          Filtrar
        </Button>
      </div>
    </div>
  );
};

export default ExerciseSelectionHeader;
