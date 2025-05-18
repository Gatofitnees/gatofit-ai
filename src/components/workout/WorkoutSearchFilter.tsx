
import React from "react";
import { Search, Filter } from "lucide-react";
import Button from "@/components/Button";

interface WorkoutSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const WorkoutSearchFilter: React.FC<WorkoutSearchFilterProps> = ({ 
  searchTerm, 
  onSearchChange 
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
      <Button 
        variant="secondary"
        size="sm"
        leftIcon={<Filter className="h-4 w-4" />}
      >
        Filtrar
      </Button>
    </div>
  );
};

export default WorkoutSearchFilter;
