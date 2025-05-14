
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { OnboardingContext } from "../OnboardingFlow";
import WheelSelector from "@/components/onboarding/WheelSelector";

const BirthDate: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);
  
  if (!context) {
    throw new Error("BirthDate must be used within OnboardingContext");
  }

  const { data, updateData } = context;
  
  // Calculate min/max dates (16-100 years old range)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 16);
  
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 100);

  // Initialize with current date or existing data
  const initialDate = data.dateOfBirth || new Date(maxDate.getFullYear() - 9, 5, 15);
  
  const [day, setDay] = useState(initialDate.getDate());
  const [month, setMonth] = useState(initialDate.getMonth());
  const [year, setYear] = useState(initialDate.getFullYear());

  // Generate days (1-31)
  const daysValues = Array.from({ length: 31 }, (_, i) => ({
    label: `${i + 1}`,
    value: i + 1
  }));

  // Generate months (names)
  const monthsValues = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun", 
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  ].map((name, index) => ({
    label: name,
    value: index
  }));

  // Generate years (100 years ago to 16 years ago)
  const yearsValues = Array.from(
    { length: maxDate.getFullYear() - minDate.getFullYear() + 1 }, 
    (_, i) => ({
      label: `${maxDate.getFullYear() - i}`,
      value: maxDate.getFullYear() - i
    })
  );

  // Update context when date values change
  useEffect(() => {
    try {
      // Validate day based on month/year
      let adjustedDay = day;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      if (day > daysInMonth) {
        adjustedDay = daysInMonth;
      }
      
      const birthDate = new Date(year, month, adjustedDay);
      
      // Validate date is within range
      if (birthDate > maxDate) {
        return; // Too young
      }
      
      if (birthDate < minDate) {
        return; // Too old
      }
      
      updateData({ dateOfBirth: birthDate });
    } catch (e) {
      console.error("Invalid date:", e);
    }
  }, [day, month, year, maxDate, minDate, updateData]);

  // Calculate age based on birth date
  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleNext = () => {
    navigate("/onboarding/main-goal");
  };

  return (
    <OnboardingLayout currentStep={7} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-8">¿Cuál es tu fecha de nacimiento?</h1>

      <div className="w-full max-w-sm mx-auto">
        <div className="flex space-x-2 h-[240px] mb-8">
          <div className="w-1/3">
            <WheelSelector
              values={daysValues}
              onChange={(value) => setDay(value)}
              initialValue={day}
              className="h-full"
              labelClassName="text-xl"
            />
          </div>
          <div className="w-1/3">
            <WheelSelector
              values={monthsValues}
              onChange={(value) => setMonth(value)}
              initialValue={month}
              className="h-full"
              labelClassName="text-xl"
            />
          </div>
          <div className="w-1/3">
            <WheelSelector
              values={yearsValues}
              onChange={(value) => setYear(value)}
              initialValue={year}
              className="h-full"
              labelClassName="text-xl"
            />
          </div>
        </div>

        {data.dateOfBirth && (
          <div className="mt-8 text-center p-6 rounded-xl bg-secondary/20 neu-card">
            <p className="text-sm text-muted-foreground mb-1">Tu edad</p>
            <p className="text-3xl font-bold text-primary">
              {calculateAge(data.dateOfBirth)} años
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {format(data.dateOfBirth, "PPP", { locale: es })}
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
