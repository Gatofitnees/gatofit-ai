
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DateNavigatorProps {
  dates: string[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({
  dates,
  selectedDate,
  onDateSelect
}) => {
  const selectedIndex = selectedDate ? dates.indexOf(selectedDate) : -1;
  
  const goToPrevious = () => {
    if (selectedIndex < dates.length - 1) {
      const newDate = dates[selectedIndex + 1];
      console.log('Navigating to previous date:', newDate);
      onDateSelect(newDate);
    }
  };
  
  const goToNext = () => {
    if (selectedIndex > 0) {
      const newDate = dates[selectedIndex - 1];
      console.log('Navigating to next date:', newDate);
      onDateSelect(newDate);
    }
  };
  
  if (dates.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-4">
        No hay entrenamientos registrados
      </div>
    );
  }
  
  console.log('DateNavigator - dates:', dates);
  console.log('DateNavigator - selectedDate:', selectedDate);
  console.log('DateNavigator - selectedIndex:', selectedIndex);
  
  return (
    <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
      <Button
        variant="ghost"
        size="sm"
        onClick={goToPrevious}
        disabled={selectedIndex >= dates.length - 1}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex-1 text-center">
        <div className="text-sm font-medium">
          {selectedDate || dates[0]}
        </div>
        <div className="text-xs text-muted-foreground">
          {selectedIndex + 1} de {dates.length}
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={goToNext}
        disabled={selectedIndex <= 0}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
