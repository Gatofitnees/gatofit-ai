
import React, { useState, useEffect } from "react";
import {
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useExerciseHistory } from "@/hooks/useExerciseHistory";
import { DateNavigator } from "./DateNavigator";
import { SessionStats } from "./SessionStats";
import { ProgressChart } from "./ProgressChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ExerciseStatisticsProps {
  exerciseId: number;
  exerciseName: string;
  showStatsDialog: boolean;
  onCloseDialog: () => void;
}

export const ExerciseStatistics: React.FC<ExerciseStatisticsProps> = ({ 
  exerciseId,
  exerciseName,
  showStatsDialog,
  onCloseDialog
}) => {
  const { stats, loading } = useExerciseHistory({ exerciseId });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Auto-select first date when sessions are loaded and reset when dialog opens
  useEffect(() => {
    if (showStatsDialog && stats.sessions.length > 0) {
      console.log('Setting initial selected date to:', stats.sessions[0].date);
      setSelectedDate(stats.sessions[0].date);
    }
  }, [stats.sessions, showStatsDialog]);

  // Reset selected date when dialog closes
  useEffect(() => {
    if (!showStatsDialog) {
      console.log('Dialog closed, clearing selected date');
      setSelectedDate(null);
    }
  }, [showStatsDialog]);
  
  // Handle date selection with cleanup
  const handleDateSelect = (date: string) => {
    console.log('Date selected:', date);
    console.log('Previous selected date:', selectedDate);
    setSelectedDate(date);
  };
  
  // Find the session for the selected date
  const selectedSession = selectedDate 
    ? stats.sessions.find(session => session.date === selectedDate)
    : null;
  
  const sessionDates = stats.sessions.map(session => session.date);
  
  console.log('ExerciseStatistics - sessions:', stats.sessions.length);
  console.log('ExerciseStatistics - sessionDates:', sessionDates);
  console.log('ExerciseStatistics - selectedDate:', selectedDate);
  console.log('ExerciseStatistics - selectedSession:', selectedSession);

  return (
    <Dialog open={showStatsDialog} onOpenChange={onCloseDialog}>
      <DialogContent className="bg-background border border-white/5 sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Estadísticas: {exerciseName}</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Cargando estadísticas...</p>
          </div>
        ) : (
          <div className="py-4 space-y-6">
            {/* Best Marks */}
            <div className="bg-secondary/20 rounded-lg p-4">
              <h4 className="font-medium mb-3">Mejores marcas</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Peso máximo</p>
                  <p className="text-lg font-bold text-primary">
                    {stats.maxWeight ? `${stats.maxWeight} kg` : '-'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Reps máximas</p>
                  <p className="text-lg font-bold text-primary">
                    {stats.maxReps || '-'}
                  </p>
                </div>
              </div>
            </div>
            
            {stats.sessions.length > 0 ? (
              <Tabs defaultValue="history" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="history">Historial</TabsTrigger>
                  <TabsTrigger value="progress">Progreso</TabsTrigger>
                </TabsList>
                
                <TabsContent value="history" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">Historial reciente</h4>
                    <DateNavigator
                      dates={sessionDates}
                      selectedDate={selectedDate}
                      onDateSelect={handleDateSelect}
                    />
                  </div>
                  
                  {selectedSession ? (
                    <div className="bg-secondary/10 rounded-lg p-4">
                      <div className="mb-2">
                        <p className="text-sm text-muted-foreground">
                          Mostrando series del {selectedSession.date}
                        </p>
                      </div>
                      <SessionStats
                        sets={selectedSession.sets}
                        maxWeight={selectedSession.maxWeight}
                        totalReps={selectedSession.totalReps}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        Selecciona una fecha para ver las series
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="progress" className="space-y-4">
                  <ProgressChart data={stats.progressData} />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No hay entrenamientos registrados para este ejercicio
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
