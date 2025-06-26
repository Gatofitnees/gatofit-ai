
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
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto bg-background">
        <div className="animate-fade-in space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 bg-secondary rounded-xl animate-pulse"></div>
            <div className="h-8 bg-secondary rounded-lg w-32 animate-pulse"></div>
            <div className="w-10"></div>
          </div>
          <div className="h-96 bg-secondary rounded-2xl animate-pulse"></div>
          <div className="h-32 bg-secondary rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile')}
          className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/20">
            <CalendarIcon className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Calendario
          </h1>
        </div>
        
        <div className="w-10"></div>
      </div>

      {/* Calendar */}
      <div className="space-y-6">
        <CalendarView
          currentDate={currentDate}
          onDateChange={handleDateChange}
          onDaySelect={handleDaySelect}
          monthData={monthData}
        />

        {/* Day Activity Summary */}
        {selectedDayData && (
          <DayActivitySummary
            date={selectedDayData.date}
            workouts={selectedDayData.workouts}
            nutrition={selectedDayData.nutrition}
            experience_gained={selectedDayData.experience_gained}
          />
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
