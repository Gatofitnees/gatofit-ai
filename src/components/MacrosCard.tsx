
import React from "react";
import { Card, CardHeader, CardBody, CardFooter } from "./Card";
import MacroRing from "./MacroRing";
import MacroProgress from "./MacroProgress";
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
        <div className="flex flex-col items-center mb-4">
          <MacroRing
            value={macros.calories.current}
            target={macros.calories.target}
            color="primary"
            size="lg"
            unit={macros.calories.unit}
            icon={<Flame className="h-6 w-6 text-orange-400" />}
            showValues={false}
          />
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Calorías Consumidas
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex flex-col items-center">
            <MacroRing
              value={macros.protein.current}
              target={macros.protein.target}
              color="protein"
              size="sm"
              icon={<Zap className="h-4 w-4" />}
              showValues={false}
            />
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Proteína
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <MacroRing
              value={macros.carbs.current}
              target={macros.carbs.target}
              color="carbs"
              size="sm"
              icon={<Wheat className="h-4 w-4" />}
              showValues={false}
            />
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Carbos
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <MacroRing
              value={macros.fats.current}
              target={macros.fats.target}
              color="fat"
              size="sm"
              icon={<Droplet className="h-4 w-4" />}
              showValues={false}
            />
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Grasas
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <MacroProgress 
            label="Calorías" 
            current={macros.calories.current} 
            target={macros.calories.target} 
            unit={macros.calories.unit} 
            icon="calories"
          />
          <MacroProgress 
            label="Proteínas" 
            current={macros.protein.current} 
            target={macros.protein.target}
            color="protein" 
            icon="protein"
          />
          <MacroProgress 
            label="Carbohidratos" 
            current={macros.carbs.current} 
            target={macros.carbs.target}
            color="carbs" 
            icon="carbs"
          />
          <MacroProgress 
            label="Grasas" 
            current={macros.fats.current} 
            target={macros.fats.target}
            color="fat" 
            icon="fat"
          />
        </div>
      </CardBody>
      <CardFooter>
        <Button
          variant="secondary"
          className="w-full"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={onAddFood}
        >
          Añadir comidas
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MacrosCard;
