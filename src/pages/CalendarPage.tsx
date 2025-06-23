
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-32"></div>
          <div className="h-80 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile')}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <h1 className="text-xl font-bold">Calendario</h1>
        
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
