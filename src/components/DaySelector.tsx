
import React, { useState, useEffect, useRef } from "react";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";

interface DateCardProps {
  date: Date;
  isSelected: boolean;
  hasRecords?: boolean;
  onClick: () => void;
}

const DateCard: React.FC<DateCardProps> = ({ date, isSelected, hasRecords = false, onClick }) => {
  const formattedDate = format(date, "dd MMM", { locale: es }).toUpperCase();
  
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center h-20 min-w-16 mx-1 p-2 rounded-xl transition-all cursor-pointer relative",
        isSelected 
          ? "neu-card border border-primary/20" 
          : "neu-button hover:bg-secondary/20"
      )}
      onClick={onClick}
    >
      <span className={cn(
        "text-sm font-medium",
        isSelected ? "text-primary" : "text-muted-foreground"
      )}>
        {formattedDate.split(' ')[0]}
      </span>
      <span className="text-xs mt-1">
        {formattedDate.split(' ')[1]}
      </span>
      {hasRecords && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
      )}
    </div>
  );
};

interface DaySelectorProps {
  onSelectDate: (date: Date) => void;
  datesWithRecords?: Date[];
}

const DaySelector: React.FC<DaySelectorProps> = ({ 
  onSelectDate,
  datesWithRecords = [] 
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<Date[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generar rango de fechas (10 días antes y después de la fecha actual)
  useEffect(() => {
    const today = new Date();
    const range: Date[] = [];
    
    for (let i = -10; i <= 10; i++) {
      range.push(i < 0 ? subDays(today, Math.abs(i)) : addDays(today, i));
    }
    
    setDateRange(range.sort((a, b) => a.getTime() - b.getTime()));
    
    // Auto-scroll to today's date
    setTimeout(() => {
      const todayIndex = range.findIndex(date => 
        isSameDay(date, today)
      );
      
      if (scrollRef.current && todayIndex >= 0) {
        const cardWidth = 64; // 16px × 4 (min-w-16)
        const cardMargin = 8; // 2px × 4 (mx-1)
        const totalCardWidth = cardWidth + cardMargin;
        
        // Calculate position to show current date as the second item
        const scrollPosition = Math.max(0, (todayIndex - 1) * totalCardWidth);
        scrollRef.current.scrollLeft = scrollPosition;
      }
    }, 100);
  }, []);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    onSelectDate(date);
  };

  const checkHasRecords = (date: Date) => {
    return datesWithRecords.some(recordDate => isSameDay(recordDate, date));
  };

  return (
    <div className="mb-5 animate-fade-in">
      <ScrollArea className="w-full overflow-x-auto">
        <div className="flex p-2 w-max" ref={scrollRef}>
          {dateRange.map((date, index) => (
            <DateCard 
              key={index}
              date={date}
              isSelected={isSameDay(date, selectedDate)}
              hasRecords={checkHasRecords(date)}
              onClick={() => handleSelectDate(date)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default DaySelector;
