
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingNavigationProps {
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
  loading?: boolean;
}

const OnboardingNavigation: React.FC<OnboardingNavigationProps> = ({
  onNext,
  onBack,
  nextLabel = "Continuar",
  nextDisabled = false,
  showBack = true,
  loading = false,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    }
  };

  return (
    <div className="mt-auto pt-6 flex flex-col space-y-4">
      <Button
        onClick={handleNext}
        disabled={nextDisabled || loading}
        className="w-full py-2 px-4 h-auto font-medium bg-primary hover:bg-primary/90 text-white rounded-xl neu-button"
      >
        {loading ? "Cargando..." : nextLabel}
      </Button>

      {showBack && (
        <button
          onClick={handleBack}
          className="flex items-center justify-center py-2 text-sm text-muted-foreground"
        >
          <ArrowLeft size={16} className="mr-2" />
          Atrás
        </button>
      )}
    </div>
  );
};

export default OnboardingNavigation;
