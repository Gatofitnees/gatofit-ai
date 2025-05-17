
import React from "react";
import { Card, CardHeader, CardBody, CardFooter } from "./Card";
import MacroRing from "./MacroRing";
import { Flame, Zap, Wheat, Droplet, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "./Button";

interface MacroData {
  calories: { current: number; target: number; unit: string };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fats: { current: number; target: number };
}

interface MacrosCardProps {
  macros: MacroData;
  className?: string;
  onAddFood?: () => void;
}

const MacrosCard: React.FC<MacrosCardProps> = ({
  macros,
  className,
  onAddFood
}) => {
  return (
    <Card className={cn("animate-fade-in", className)}>
      <CardHeader 
        title="Mis Macros Hoy"
        subtitle="Resumen de objetivos nutricionales" 
      />
      <CardBody>
        <div className="flex flex-col space-y-6">
          {/* Main calorie counter */}
          <div className="bg-background/20 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{macros.calories.target}</div>
                <div className="text-xs text-muted-foreground">Calorías requeridas</div>
              </div>
              <div className="flex-shrink-0">
                <MacroRing
                  value={macros.calories.current}
                  target={macros.calories.target}
                  color="primary"
                  size="md"
                  icon={<Flame className="h-6 w-6 text-orange-400" />}
                />
              </div>
            </div>
          </div>
          
          {/* Macros grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Protein */}
            <div className="bg-background/20 p-3 rounded-xl">
              <div className="flex flex-col items-center">
                <div className="text-sm font-semibold">{macros.protein.target}g</div>
                <div className="text-xs text-muted-foreground mb-2">Proteínas</div>
                <MacroRing
                  value={macros.protein.current}
                  target={macros.protein.target}
                  color="protein"
                  size="sm"
                  icon={<Zap className="h-4 w-4 text-blue-400" />}
                />
              </div>
            </div>
            
            {/* Carbs */}
            <div className="bg-background/20 p-3 rounded-xl">
              <div className="flex flex-col items-center">
                <div className="text-sm font-semibold">{macros.carbs.target}g</div>
                <div className="text-xs text-muted-foreground mb-2">Carbohid.</div>
                <MacroRing
                  value={macros.carbs.current}
                  target={macros.carbs.target}
                  color="carbs"
                  size="sm"
                  icon={<Wheat className="h-4 w-4 text-green-400" />}
                />
              </div>
            </div>
            
            {/* Fats */}
            <div className="bg-background/20 p-3 rounded-xl">
              <div className="flex flex-col items-center">
                <div className="text-sm font-semibold">{macros.fats.target}g</div>
                <div className="text-xs text-muted-foreground mb-2">Grasas</div>
                <MacroRing
                  value={macros.fats.current}
                  target={macros.fats.target}
                  color="fat"
                  size="sm"
                  icon={<Droplet className="h-4 w-4 text-yellow-400" />}
                />
              </div>
            </div>
          </div>
        </div>
      </CardBody>
      <CardFooter>
        <Button
          variant="secondary"
          className="w-full flex items-center justify-center"
          onClick={onAddFood}
        >
          <Plus className="h-4 w-4 mr-2" /> Añadir comidas
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MacrosCard;
