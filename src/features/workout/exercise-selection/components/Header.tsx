
import React from "react";
import { ArrowLeft } from "lucide-react";
import ExerciseSearchBar from "./ExerciseSearchBar";

interface HeaderProps {
  onBack: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onOpenFilters: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onBack,
  searchTerm,
  onSearchChange,
  onOpenFilters
}) => {
  return (
    <div className="sticky top-0 z-10 bg-background p-4 border-b border-muted/20">
      <div className="flex items-center mb-4">
        <button 
          onClick={onBack}
          className="mr-3 p-1 rounded-full hover:bg-secondary/50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Seleccionar Ejercicios</h1>
      </div>
      
      <ExerciseSearchBar 
        searchTerm={searchTerm} 
        onSearchChange={onSearchChange}
        onOpenFilters={onOpenFilters} 
      />
    </div>
  );
};

export default Header;
