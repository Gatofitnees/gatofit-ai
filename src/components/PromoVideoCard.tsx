
import React from "react";
import { Card, CardBody } from "./Card";
import { useBranding } from "@/contexts/BrandingContext";
import { Skeleton } from "./ui/skeleton";

interface PromoVideoCardProps {
  onStartWorkout: () => void;
  adaptToWorkoutCards?: boolean;
}

const PromoVideoCard: React.FC<PromoVideoCardProps> = ({ 
  onStartWorkout, 
  adaptToWorkoutCards = false 
}) => {
  const { branding, loading } = useBranding();

  if (loading) {
    return (
      <Card className="relative overflow-hidden">
        <CardBody className={`relative z-10 flex flex-col justify-end bg-transparent p-4 ${
          adaptToWorkoutCards ? 'min-h-[140px]' : 'min-h-[140px]'
        }`}>
          <Skeleton className="w-full h-full" />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Banner del Coach o Gatofit */}
      <div className="absolute inset-0">
        <img 
          src={branding.bannerImageUrl}
          alt={`${branding.companyName} Banner`}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay to ensure button visibility */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      <CardBody className={`relative z-10 flex flex-col justify-end bg-transparent p-4 ${
        adaptToWorkoutCards ? 'min-h-[140px]' : 'min-h-[140px]'
      }`}>
        {/* Empty content but satisfies the children requirement */}
        <div></div>
      </CardBody>
    </Card>
  );
};

export default PromoVideoCard;
