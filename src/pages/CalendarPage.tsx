
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCalendarData } from '@/hooks/useCalendarData';
import CalendarView from '@/components/calendar/CalendarView';
import DayActivitySummary from '@/components/calendar/DayActivitySummary';

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { monthData, selectedDayData, loading, selectDay } = useCalendarData(currentDate);

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleDaySelect = (dateStr: string) => {
    selectDay(dateStr);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="animate-fade-in space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 bg-gradient-to-br from-muted to-muted/50 rounded-xl animate-pulse shadow-neu-card"></div>
            <div className="h-8 bg-gradient-to-r from-muted to-muted/50 rounded-lg w-32 animate-pulse"></div>
            <div className="w-10"></div>
          </div>
          <div className="h-96 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl animate-pulse shadow-neu-card"></div>
          <div className="h-32 bg-gradient-to-br from-muted/40 to-muted/20 rounded-2xl animate-pulse shadow-neu-card"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto bg-gradient-to-br from-background via-background to-secondary/10 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile')}
          className="p-3 rounded-xl hover:bg-secondary/20 transition-all duration-300 hover:scale-105 shadow-neu-button hover:shadow-neu-button-active group"
        >
          <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-neu-card">
            <CalendarIcon className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Calendario
          </h1>
        </div>
        
        <div className="w-14"></div>
      </div>

      {/* Enhanced Calendar */}
      <div className="space-y-8">
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CalendarView
            currentDate={currentDate}
            onDateChange={handleDateChange}
            onDaySelect={handleDaySelect}
            monthData={monthData}
          />
        </div>

        {/* Day Activity Summary */}
        {selectedDayData && (
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <DayActivitySummary
              date={selectedDayData.date}
              workouts={selectedDayData.workouts}
              nutrition={selectedDayData.nutrition}
              experience_gained={selectedDayData.experience_gained}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
