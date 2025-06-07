
import React from "react";
import { Search } from "lucide-react";
import WorkoutFilters from "./WorkoutFilters";

interface WorkoutSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFiltersChange: (filters: { types: string[], muscles: string[] }) => void;
  activeFilters: { types: string[], muscles: string[] };
}

const WorkoutSearchFilter: React.FC<WorkoutSearchFilterProps> = ({ 
  searchTerm, 
  onSearchChange,
  onFiltersChange,
  activeFilters
}) => {
  return (
    <div className="flex items-center gap-2 mb-5">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Buscar rutinas..." 
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-10 rounded-xl pl-10 pr-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button"
        />
      </div>
      <WorkoutFilters 
        onFiltersChange={onFiltersChange}
        activeFilters={activeFilters}
      />
    </div>
  );
};

export default WorkoutSearchFilter;
