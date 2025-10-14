import React from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface NutritionProgramHeaderProps {
  selectedDate: Date;
  onBack: () => void;
}

export const NutritionProgramHeader: React.FC<NutritionProgramHeaderProps> = ({
  selectedDate,
  onBack
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const formatDate = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM", { locale: es });
  };

  const getDateStatus = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return "Hoy";
    if (isYesterday) return "Ayer";
    if (isTomorrow) return "Mañana";
    return "";
  };

  const navigateToDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    navigate(`/nutrition-program?date=${dateString}`);
  };

  const navigateToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    navigateToDate(previousDay);
  };

  const navigateToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    navigateToDate(nextDay);
  };

  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border">
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/nutrition')}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateToPreviousDay}
            className="p-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="text-center min-w-0">
            <h1 className="text-lg font-semibold capitalize text-foreground">
              {formatDate(selectedDate)}
            </h1>
            {getDateStatus(selectedDate) && (
              <p className="text-sm text-primary font-medium">
                {getDateStatus(selectedDate)}
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={navigateToNextDay}
            className="p-2"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="w-9" />
      </div>
    </div>
  );
};