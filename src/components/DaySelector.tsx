
import React, { useState, useEffect, useRef } from "react";
import { format, addDays, subDays, isSameDay, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DateCardProps {
  date: Date;
  isSelected: boolean;
  hasRecords?: boolean;
  onClick: () => void;
  label?: string;
}

const DateCard: React.FC<DateCardProps> = ({ 
  date, 
  isSelected, 
  hasRecords = false, 
  onClick,
  label
}) => {
  const dayNumber = format(date, "dd");
  const dayName = format(date, "EEE", { locale: es }).toLowerCase();
  
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center h-20 min-w-16 p-2 rounded-xl transition-all cursor-pointer",
        isSelected 
          ? "bg-primary/20 text-primary border border-primary/30" 
          : "bg-background/30 text-muted-foreground hover:bg-secondary/10"
      )}
      onClick={onClick}
    >
      <span className={cn(
        "text-lg font-bold",
        isSelected ? "text-primary" : "text-foreground"
      )}>
        {dayNumber}
      </span>
      <span className={cn(
        "text-xs mt-1",
        isSelected ? "text-primary" : "text-muted-foreground"
      )}>
        {label || dayName}
      </span>
      {hasRecords && !isSelected && (
        <div className="w-1.5 h-1.5 mt-1 rounded-full bg-primary" />
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate range of dates (current day and 20 days after)
  useEffect(() => {
    const today = new Date();
    const range: Date[] = [];
    
    // Include 10 days before today and 20 days after
    for (let i = -10; i <= 20; i++) {
      range.push(addDays(today, i));
    }
    
    setDateRange(range);
    
    // Auto-scroll to position the current day on the left
    setTimeout(() => {
      if (scrollContainerRef.current) {
        const cardWidth = 64; // Width of each card
        scrollContainerRef.current.scrollLeft = 0; // Start with current day visible
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
    <div className="mb-5 animate-fade-in bg-background/10 p-2 rounded-lg">
      <div 
        className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory" 
        ref={scrollContainerRef}
        style={{ scrollBehavior: 'smooth' }}
      >
        {dateRange.map((date, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 mx-1 snap-start"
          >
            <DateCard 
              date={date}
              isSelected={isSameDay(date, selectedDate)}
              hasRecords={checkHasRecords(date)}
              onClick={() => handleSelectDate(date)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DaySelector;
