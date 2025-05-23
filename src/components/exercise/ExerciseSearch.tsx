
import React from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExerciseSearchProps {
  value: string;
  onChange: (value: string) => void;
  onFilterToggle?: () => void;
  clearSearch?: boolean;
  activeFiltersCount?: number;
}

const ExerciseSearch: React.FC<ExerciseSearchProps> = ({ 
  value, 
  onChange, 
  onFilterToggle,
  clearSearch,
  activeFiltersCount = 0
}) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input 
        type="text" 
        placeholder="Buscar ejercicios..." 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 rounded-xl pl-10 pr-16 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button"
      />
      
      {onFilterToggle && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onFilterToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2 flex items-center"
        >
          Filtros
          {activeFiltersCount > 0 && (
            <span className="ml-1.5 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      )}
    </div>
  );
};

export default ExerciseSearch;
