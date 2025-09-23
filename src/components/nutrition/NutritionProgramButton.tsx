import React from "react";
import { useNavigate } from "react-router-dom";
import { useAdminNutritionProgramCheck } from "@/hooks/useAdminNutritionProgramCheck";
import gatofitLogo from "@/assets/gatofit-logo.svg";

interface NutritionProgramButtonProps {
  selectedDate: Date;
}

export const NutritionProgramButton: React.FC<NutritionProgramButtonProps> = ({
  selectedDate
}) => {
  const navigate = useNavigate();
  const { hasNutritionPlan, loading } = useAdminNutritionProgramCheck(selectedDate);

  // No mostrar si está cargando o no hay plan
  if (loading || !hasNutritionPlan) {
    return null;
  }

  const handleClick = () => {
    const dateString = selectedDate.toISOString().split('T')[0];
    navigate(`/nutrition-program?date=${dateString}`);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/30 hover:bg-primary/30 transition-all duration-200 shadow-lg hover:shadow-xl"
    >
      <img 
        src={gatofitLogo} 
        alt="Gatofit Logo" 
        className="w-8 h-8 object-contain"
      />
    </button>
  );
};