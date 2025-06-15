
import React from 'react';
import { Utensils } from 'lucide-react';
import { Card, CardBody } from '../Card';

interface EmptyMealsStateProps {
  isSelectedDay: boolean;
  isToday: boolean;
}

export const EmptyMealsState: React.FC<EmptyMealsStateProps> = ({ isSelectedDay, isToday }) => {
  return (
    <Card>
      <CardBody>
        <div className="text-center py-8">
          <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {isSelectedDay ? 'No hay comidas registradas en este día' : 'No has registrado comidas hoy'}
          </p>
          {isToday && (
            <p className="text-xs text-muted-foreground mt-1">
              Usa el botón de cámara para empezar
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
