
import React, { useState, useEffect, useRef } from "react";
import { format, addDays, subDays, isSameDay, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useOptimizedTimezone } from "@/hooks/useOptimizedTimezone";

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
          ? "bg-primary/20 text-primary border border-primary/30 shadow-glow" 
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
  selectedDate?: Date;
}

const DaySelector: React.FC<DaySelectorProps> = ({ 
  onSelectDate,
  datesWithRecords = [],
  selectedDate: propSelectedDate
}) => {
  const { getUserCurrentDate, timezoneInfo } = useOptimizedTimezone();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationExecutedRef = useRef(false);
  
  // Always start with user's current date
  const userCurrentDate = getUserCurrentDate();
  const [selectedDate, setSelectedDate] = useState(propSelectedDate || userCurrentDate);
  const [dateRange, setDateRange] = useState<Date[]>([]);
  
  // Update local state when prop changes, but prefer current date if no prop
  useEffect(() => {
    if (propSelectedDate) {
      setSelectedDate(propSelectedDate);
    } else {
      setSelectedDate(userCurrentDate);
    }
  }, [propSelectedDate, userCurrentDate]);
  
  // Generate range of dates based on user's timezone
  useEffect(() => {
    if (!timezoneInfo) return;
    
    const range: Date[] = [];
    
    // Include 30 days before today and one day after
    for (let i = -30; i <= 1; i++) {
      range.push(addDays(userCurrentDate, i));
    }
    
    setDateRange(range);
    
    // Reset animation flag when date range changes
    animationExecutedRef.current = false;
  }, [userCurrentDate, timezoneInfo]);

  // Force scroll animation every time component mounts or dateRange changes
  useEffect(() => {
    if (!dateRange.length || !scrollContainerRef.current || animationExecutedRef.current) return;
    
    const executeScrollAnimation = () => {
      if (!scrollContainerRef.current) return;
      
      // Calculate scroll position to put today as the second-to-last item visible
      const cardWidth = 72; // approximate width of each card + gap (64px + 8px)
      const containerWidth = scrollContainerRef.current.clientWidth;
      const todayIndex = 30; // Index of today in our dateRange (since we have 30 days before)
      const itemsInView = Math.floor(containerWidth / cardWidth);
      
      // Calculate position to show today as the second-to-last item
      const scrollPosition = Math.max(0, (todayIndex - itemsInView + 2) * cardWidth);
      
      // Smooth scroll to position
      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      
      animationExecutedRef.current = true;
    };

    // Use timeout to ensure the component is fully rendered
    const timeoutId = setTimeout(executeScrollAnimation, 300);
    
    return () => clearTimeout(timeoutId);
  }, [dateRange]);

  // Reset animation flag when component unmounts or route changes
  useEffect(() => {
    return () => {
      animationExecutedRef.current = false;
    };
  }, []);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    onSelectDate(date);
  };

  const checkHasRecords = (date: Date) => {
    return datesWithRecords.some(recordDate => isSameDay(recordDate, date));
  };

  // Check if date is today based on user's timezone
  const isUserToday = (date: Date) => {
    if (!timezoneInfo) return false;
    return isSameDay(date, userCurrentDate);
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
            key={`${date.toISOString()}-${index}`} 
            className="flex-shrink-0"
          >
            <DateCard 
              date={date}
              isSelected={isSameDay(date, selectedDate)}
              hasRecords={checkHasRecords(date)}
              onClick={() => handleSelectDate(date)}
              label={isUserToday(date) ? "Hoy" : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DaySelector;
