
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { OnboardingContext } from "../OnboardingFlow";
import { cn } from "@/lib/utils";

const BirthDate: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);
  
  if (!context) {
    throw new Error("BirthDate must be used within OnboardingContext");
  }

  const { data, updateData } = context;
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      updateData({ dateOfBirth: date });
      setIsCalendarOpen(false);
    }
  };

  const handleNext = () => {
    navigate("/onboarding/main-goal");
  };

  // Calculate max date (must be at least 16 years old)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 16);
  
  // Calculate min date (limit to 100 years old)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 100);

  return (
    <OnboardingLayout currentStep={7} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-8">¿Cuál es tu fecha de nacimiento?</h1>

      <div className="w-full max-w-xs mx-auto">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "w-full py-3 px-4 rounded-xl bg-secondary/20 text-left flex items-center justify-between neu-button",
                !data.dateOfBirth && "text-muted-foreground"
              )}
            >
              {data.dateOfBirth ? (
                format(data.dateOfBirth, "PPP", { locale: es })
              ) : (
                "Seleccionar fecha"
              )}
              <CalendarIcon className="h-4 w-4 opacity-50" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-background border-muted">
            <Calendar
              mode="single"
              selected={data.dateOfBirth || undefined}
              onSelect={handleSelect}
              disabled={(date) => 
                date > maxDate || 
                date < minDate
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {data.dateOfBirth && (
          <div className="mt-8 text-center p-4 rounded-xl bg-secondary/20 neu-card">
            <p className="text-sm text-muted-foreground mb-1">Tu edad</p>
            <p className="text-3xl font-bold text-primary">
              {new Date().getFullYear() - data.dateOfBirth.getFullYear()} años
            </p>
          </div>
        )}
      </div>

      <OnboardingNavigation 
        onNext={handleNext}
        nextDisabled={!data.dateOfBirth}
      />
    </OnboardingLayout>
  );
};

export default BirthDate;
