import React from "react";
import { ChefHat, ChevronRight, Utensils } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useNutritionPlanCheck } from "@/hooks/useNutritionPlanCheck";

interface NutritionCardProps {
  selectedDate: Date;
  onStartNutrition?: () => void;
  className?: string;
}

const NutritionCard: React.FC<NutritionCardProps> = ({
  selectedDate,
  onStartNutrition,
  className
}) => {
  const { hasNutritionPlan, loading } = useNutritionPlanCheck(selectedDate);

  const handleStartNutrition = () => {
    const dateString = selectedDate.toISOString().split('T')[0];
    if (onStartNutrition) {
      onStartNutrition();
    } else {
      window.location.href = `/nutrition-program?date=${dateString}`;
    }
  };

  if (loading) {
    return (
      <div className={cn("mb-5", className)}>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <ChefHat className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Alimentación</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-6 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasNutritionPlan) {
    return null; // Don't show card if no nutrition plan
  }

  return (
    <div className={cn("mb-5", className)}>
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-3">
          <ChefHat className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Alimentación</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" />
              <h4 className="font-medium text-base">Plan de alimentación</h4>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Tienes un plan nutricional programado para hoy
            </p>
          </div>
          
          <Button 
            onClick={handleStartNutrition}
            className="w-full"
          >
            Iniciar
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionCard;