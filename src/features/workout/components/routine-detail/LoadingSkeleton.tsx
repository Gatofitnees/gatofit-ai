
import React from "react";
import { ArrowLeft } from "lucide-react";

interface LoadingSkeletonProps {
  onBack: () => void;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="mr-3 p-1 rounded-full hover:bg-secondary/50"
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Cargando rutina...</h1>
      </div>
      
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-secondary/30 rounded-xl"></div>
        <div className="h-40 bg-secondary/20 rounded-xl"></div>
        <div className="h-40 bg-secondary/20 rounded-xl"></div>
        <div className="h-40 bg-secondary/20 rounded-xl"></div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
