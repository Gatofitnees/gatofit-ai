
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/Button";

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

  return (
    <div className="mt-auto pt-6 flex flex-col space-y-4">
      <Button
        variant="primary"
        fullWidth
        onClick={onNext}
        disabled={nextDisabled || loading}
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
