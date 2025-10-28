import React, { useState, useEffect, useRef } from "react";
import { format, addDays, subDays, isSameDay, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useLocalTimezone } from "@/hooks/useLocalTimezone";
import { useBranding } from "@/contexts/BrandingContext";

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
  const { branding } = useBranding();

  const selectedStyles = branding.hasCoach && isSelected ? {
    backgroundColor: `${branding.primaryButtonColor}20`,
    color: branding.primaryButtonColor,
    borderColor: `${branding.primaryButtonColor}30`,
    boxShadow: `0 0 10px ${branding.primaryButtonColor}40`
  } : {};

  const dotStyles = branding.hasCoach && hasRecords && !isSelected ? {
    backgroundColor: branding.primaryButtonColor
  } : {};
  
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center h-20 min-w-16 p-2 rounded-xl transition-all cursor-pointer",
        isSelected 
          ? branding.hasCoach ? "border" : "bg-primary/20 text-primary border border-primary/30 shadow-glow"
          : "bg-background/30 text-muted-foreground hover:bg-secondary/10"
      )}
      onClick={onClick}
      style={selectedStyles}
    >
      <span className={cn(
        "text-lg font-bold",
        isSelected && !branding.hasCoach ? "text-primary" : "text-foreground"
      )}>
        {dayNumber}
      </span>
      <span className={cn(
        "text-xs mt-1",
        isSelected && !branding.hasCoach ? "text-primary" : ""
      )}>
        {label || dayName}
      </span>
      {hasRecords && !isSelected && (
        <div 
          className={branding.hasCoach ? "w-1.5 h-1.5 mt-1 rounded-full" : "w-1.5 h-1.5 mt-1 rounded-full bg-primary"}
          style={dotStyles}
        />
      )}
    </div>
  );
};

interface DaySelectorProps {
  onSelectDate: (date: Date) => void;
  datesWithRecords?: Date[];
  selectedDate?: Date;
}

const DaySelector: React.FC<DaySelectorProps> = ({ 
  onSelectDate,
  datesWithRecords = [],
  selectedDate: propSelectedDate
}) => {
  const [selectedDate, setSelectedDate] = useState(propSelectedDate || new Date());
  const [dateRange, setDateRange] = useState<Date[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { getCurrentLocalDate, getLocalDateString } = useLocalTimezone();
  
  // Update local state when prop changes
  useEffect(() => {
    if (propSelectedDate) {
      setSelectedDate(propSelectedDate);
    }
  }, [propSelectedDate]);
  
  // Generate range of dates (past and future dates) usando fecha local
  useEffect(() => {
    const today = new Date();
    const range: Date[] = [];
    
    // Include 30 days before today and one day after
    for (let i = -30; i <= 1; i++) {
      range.push(addDays(today, i));
    }
    
    setDateRange(range);
    
    // Auto-scroll on component mount to show current day in the proper position
    setTimeout(() => {
      if (scrollContainerRef.current) {
        // Calculate scroll position to put today as the second-to-last item visible
        const cardWidth = 72; // approximate width of each card + gap (64px + 8px)
        const containerWidth = scrollContainerRef.current.clientWidth;
        const todayIndex = 30; // Index of today in our dateRange (since we have 30 days before)
        const itemsInView = Math.floor(containerWidth / cardWidth);
        
        // Calculate position to show today as the second-to-last item
        const scrollPosition = Math.max(0, (todayIndex - itemsInView + 2) * cardWidth);
        
        scrollContainerRef.current.scrollLeft = scrollPosition;
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

  const isDateToday = (date: Date) => {
    // Usar comparación con fecha local del usuario
    const dateString = getLocalDateString(date);
    const todayString = getCurrentLocalDate();
    return dateString === todayString;
  };

  return (
    <div className="mb-5 animate-fade-in bg-card/30 p-2 rounded-lg shadow-neu-card">
      <div 
        className="flex overflow-x-auto hide-scrollbar gap-2"
        ref={scrollContainerRef}
        style={{ scrollBehavior: 'smooth' }}
      >
        {dateRange.map((date, index) => (
          <div 
            key={index} 
            className="flex-shrink-0"
          >
            <DateCard 
              date={date}
              isSelected={isSameDay(date, selectedDate)}
              hasRecords={checkHasRecords(date)}
              onClick={() => handleSelectDate(date)}
              label={isDateToday(date) ? "Hoy" : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DaySelector;
