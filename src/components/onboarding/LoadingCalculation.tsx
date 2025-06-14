
import React from 'react';

interface LoadingCalculationProps {
  calculationError: boolean;
}

const LoadingCalculation: React.FC<LoadingCalculationProps> = ({ calculationError }) => {
  return (
    <div className="flex flex-col items-center p-8">
      <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg">Analizando tus datos...</p>
      {calculationError && (
        <p className="mt-2 text-sm text-orange-500">Usando valores por defecto...</p>
      )}
    </div>
  );
};

export default LoadingCalculation;
