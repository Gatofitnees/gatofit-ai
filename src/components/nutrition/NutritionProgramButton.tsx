import React from "react";
import { useNavigate } from "react-router-dom";
import { useNutritionPlanCheck } from "@/hooks/useNutritionPlanCheck";
import gatofitLogo from "@/assets/gatofit-logo.svg";
import { useLocalTimezone } from "@/hooks/useLocalTimezone";

interface NutritionProgramButtonProps {
  selectedDate: Date;
}

export const NutritionProgramButton: React.FC<NutritionProgramButtonProps> = React.memo(({
  selectedDate
}) => {
  const navigate = useNavigate();
  const { hasNutritionPlan, loading } = useNutritionPlanCheck(selectedDate);
  const { getLocalDateString } = useLocalTimezone();

  // No mostrar si está cargando o no hay plan
  if (loading || !hasNutritionPlan) {
    return null;
  }

  const handleClick = () => {
    const dateString = getLocalDateString(selectedDate);
    navigate(`/nutrition-program?date=${dateString}`);
  };

  return (
    <button
      onClick={handleClick}
      className="relative w-12 h-12 rounded-full border-2 border-primary/30 hover:border-primary/50 transition-all duration-200 shadow-lg hover:shadow-xl overflow-hidden"
    >
      <img 
        src={gatofitLogo} 
        alt="Gatofit Logo" 
        className="w-full h-full object-cover rounded-full"
      />
    </button>
  );
});