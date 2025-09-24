
import React from 'react';
import { Card, CardHeader, CardBody } from '../Card';
import MacroProgress from '../MacroProgress';

interface Macros {
    calories: { current: number; target: number; unit: string; };
    protein: { current: number; target: number; };
    carbs: { current: number; target: number; };
    fats: { current: number; target: number; };
}

interface MacrosSummaryProps {
  macros: Macros;
}

export const MacrosSummary: React.FC<MacrosSummaryProps> = React.memo(({ macros }) => {
  return (
    <Card className="mb-6">
      <CardHeader 
        title="Macronutrientes" 
        subtitle="Resumen diario" 
      />
      <CardBody>
        <div className="space-y-4">
          <MacroProgress 
            label="Proteínas" 
            current={macros.protein.current} 
            target={macros.protein.target}
            color="protein" 
          />
          <MacroProgress 
            label="Carbohidratos" 
            current={macros.carbs.current} 
            target={macros.carbs.target}
            color="carbs" 
          />
          <MacroProgress 
            label="Grasas" 
            current={macros.fats.current} 
            target={macros.fats.target}
            color="fat" 
          />
        </div>
      </CardBody>
    </Card>
  );
});
