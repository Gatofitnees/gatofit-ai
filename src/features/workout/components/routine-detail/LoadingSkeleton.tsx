
import React from "react";
import { ArrowLeft } from "lucide-react";

interface LoadingSkeletonProps {
  onBack: () => void;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-background text-foreground pt-6 pb-24 px-4 max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="mr-3 p-1 rounded-full hover:bg-secondary/50 text-foreground"
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Cargando rutina...</h1>
      </div>
      
      {/* Loading spinner */}
      <div className="flex justify-center items-center py-12">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
      
      <div className="animate-pulse space-y-4 mt-8">
        <div className="h-12 bg-card rounded-xl"></div>
        <div className="h-40 bg-card rounded-xl"></div>
        <div className="h-40 bg-card rounded-xl"></div>
        <div className="h-40 bg-card rounded-xl"></div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
