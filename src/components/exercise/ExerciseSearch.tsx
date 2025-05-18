
import React from "react";
import { Search } from "lucide-react";

interface ExerciseSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const ExerciseSearch: React.FC<ExerciseSearchProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input 
        type="text" 
        placeholder="Buscar ejercicios..." 
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full h-10 rounded-xl pl-10 pr-4 bg-secondary border-none focus:ring-1 focus:ring-primary outline-none shadow-neu-button"
      />
    </div>
  );
};

export default ExerciseSearch;
