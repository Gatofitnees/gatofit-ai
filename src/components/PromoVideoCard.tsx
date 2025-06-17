
import React from "react";
import { Plus, Play } from "lucide-react";
import { Card, CardBody } from "./Card";
import Button from "./Button";

interface PromoVideoCardProps {
  onStartWorkout: () => void;
}

const PromoVideoCard: React.FC<PromoVideoCardProps> = ({ onStartWorkout }) => {
  return (
    <Card className="relative overflow-hidden">
      {/* Placeholder background - simulating video */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20">
        {/* Animated background pattern to simulate video movement */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-4 left-4 w-8 h-8 bg-primary/40 rounded-full animate-pulse"></div>
          <div className="absolute top-8 right-8 w-6 h-6 bg-secondary/40 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-6 left-8 w-4 h-4 bg-accent/40 rounded-full animate-pulse delay-500"></div>
          <div className="absolute bottom-8 right-6 w-10 h-10 bg-primary/30 rounded-full animate-pulse delay-700"></div>
        </div>
        
        {/* Play icon overlay to indicate video */}
        <div className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 bg-background/80 rounded-full">
          <Play className="h-4 w-4 text-primary fill-current" />
        </div>
        
        {/* Video placeholder text */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="bg-background/90 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-xs text-muted-foreground font-medium">
              Video Promocional
            </p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">
              Próximamente...
            </p>
          </div>
        </div>
      </div>

      <CardBody className="relative z-10 min-h-[140px] flex flex-col justify-between bg-transparent">
        <div className="flex-1 flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              ¡Entrena Hoy!
            </h3>
            <p className="text-sm text-muted-foreground">
              Es un buen día para mejorar 💪
            </p>
          </div>
        </div>
        
        <div className="flex justify-center mt-4">
          <Button 
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={onStartWorkout}
            className="shadow-lg"
          >
            Iniciar Entrenamiento
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default PromoVideoCard;
