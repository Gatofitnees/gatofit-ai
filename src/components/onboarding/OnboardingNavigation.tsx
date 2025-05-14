
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background z-10">
      <div className="max-w-md mx-auto space-y-4">
        <button
          onClick={handleNext}
          disabled={nextDisabled || loading}
          className="w-full py-3 px-4 h-auto font-medium bg-primary hover:bg-primary/90 text-white rounded-xl neu-button disabled:opacity-50 disabled:pointer-events-none transition-all"
        >
          {loading ? "Cargando..." : nextLabel}
        </button>

        {showBack && (
          <button
            onClick={handleBack}
            className="flex items-center justify-center py-2 w-full text-sm text-muted-foreground"
          >
            <ArrowLeft size={16} className="mr-2" />
            Atrás
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingNavigation;
