
import React from "react";
import { Plus } from "lucide-react";
import { Card, CardBody } from "./Card";
import Button from "./Button";

interface PromoVideoCardProps {
  onStartWorkout: () => void;
  adaptToWorkoutCards?: boolean;
}

const PromoVideoCard: React.FC<PromoVideoCardProps> = ({ 
  onStartWorkout, 
  adaptToWorkoutCards = false 
}) => {
  return (
    <Card className="relative overflow-hidden">
      {/* GIF Background */}
      <div className="absolute inset-0">
        <img 
          src="https://storage.googleapis.com/almacenamiento-app-gatofit/Recursos%20Branding%20APP/animaciones/animacion%20gatofit%202.gif"
          alt="Gatofit Animation"
          className="w-full h-full object-cover"
        />
        
        {/* Overlay to ensure button visibility */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      <CardBody className={`relative z-10 flex flex-col justify-end bg-transparent p-4 ${
        adaptToWorkoutCards ? 'min-h-[140px]' : 'min-h-[140px]'
      }`}>
        <div className="flex justify-end">
          <Button 
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={onStartWorkout}
            className="shadow-lg"
          >
            Iniciar
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default PromoVideoCard;
