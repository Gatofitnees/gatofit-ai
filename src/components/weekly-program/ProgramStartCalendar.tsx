
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Play } from "lucide-react";

interface ProgramStartCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  onStartProgram: (startDate: Date) => void;
  programName: string;
}

const ProgramStartCalendar: React.FC<ProgramStartCalendarProps> = ({
  isOpen,
  onClose,
  onStartProgram,
  programName
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();

  // Helper function to get the Monday of the selected week
  const getMondayOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const monday = getMondayOfWeek(date);
      setSelectedDate(monday);
    }
  };

  const handleStartProgram = () => {
    if (selectedDate) {
      onStartProgram(selectedDate);
      onClose();
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Fecha de Inicio
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Selecciona cuándo quieres comenzar "{programName}"
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => date < new Date()}
            initialFocus
            className="rounded-md border"
          />
          
          {selectedDate && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">
                Inicio programado para:
              </p>
              <p className="text-sm text-blue-600">
                {formatDate(selectedDate)}
              </p>
              <p className="text-xs text-blue-500 mt-1">
                * El programa siempre inicia en lunes para mantener la progresión semanal
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleStartProgram}
              disabled={!selectedDate}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgramStartCalendar;
