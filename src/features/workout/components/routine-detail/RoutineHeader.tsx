
import React from "react";
import { ArrowLeft } from "lucide-react";

interface RoutineHeaderProps {
  title: string;
  onBack: () => void;
}

const RoutineHeader: React.FC<RoutineHeaderProps> = ({ title, onBack }) => {
  return (
    <div className="flex items-center mb-6">
      <button 
        onClick={onBack}
        className="mr-3 p-1 rounded-full hover:bg-secondary/50"
        type="button"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <h1 className="text-xl font-bold">{title}</h1>
    </div>
  );
};

export default RoutineHeader;
