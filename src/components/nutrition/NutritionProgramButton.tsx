import React from "react";
import { UtensilsCrossed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import { useAdminNutritionProgram } from "@/hooks/useAdminNutritionProgram";

interface NutritionProgramButtonProps {
  selectedDate: Date;
}

export const NutritionProgramButton: React.FC<NutritionProgramButtonProps> = ({
  selectedDate
}) => {
  const navigate = useNavigate();
  const { hasNutritionPlan, loading } = useAdminNutritionProgram(selectedDate);

  // No mostrar si está cargando o no hay plan
  if (loading || !hasNutritionPlan) {
    return null;
  }

  const handleClick = () => {
    const dateString = selectedDate.toISOString().split('T')[0];
    navigate(`/admin-nutrition-plan?date=${dateString}`);
  };

  return (
    <Button 
      variant="secondary"
      size="sm"
      leftIcon={<UtensilsCrossed className="h-4 w-4" />}
      onClick={handleClick}
    >
      Alimentación
    </Button>
  );
};