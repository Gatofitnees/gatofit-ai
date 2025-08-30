
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar, Clock, Dumbbell, Target, X, Check, AlertCircle, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { WeeklyProgram, WeeklyProgramRoutine } from "@/hooks/useWeeklyPrograms";
import { GatofitProgram } from "@/hooks/useGatofitPrograms";
import { AdminProgram } from "@/hooks/useActiveProgramUnified";
import { supabase } from "@/integrations/supabase/client";

interface ProgrammedRoutinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProgram: WeeklyProgram | GatofitProgram | AdminProgram | null;
  todayRoutines: any[];
  onStartRoutine: (routineId: number) => void;
  isCurrentDay: boolean;
  isCompleted: boolean;
  selectedDate: Date;
  programType?: 'weekly' | 'gatofit' | 'admin';
}

const ProgrammedRoutinesModal: React.FC<ProgrammedRoutinesModalProps> = ({
  isOpen,
  onClose,
  activeProgram,
  todayRoutines: initialRoutines,
  onStartRoutine,
  isCurrentDay: initialIsCurrentDay,
  isCompleted: initialIsCompleted,
  selectedDate: initialSelectedDate,
  programType = 'weekly'
}) => {
  const [navigatedDate, setNavigatedDate] = useState<Date>(initialSelectedDate);
  const [currentRoutines, setCurrentRoutines] = useState<any[]>(initialRoutines);
  const [loading, setLoading] = useState(false);
  const [completionStatus, setCompletionStatus] = useState<boolean>(initialIsCompleted);

  const formatDayOfWeek = (date: Date) => {
    return date.toLocaleDateString('es-ES', { weekday: 'long' });
  };

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDateStatus = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return "Hoy";
    if (isYesterday) return "Ayer";
    if (isTomorrow) return "Mañana";
    return "";
  };

  const isCurrentDay = navigatedDate.toDateString() === new Date().toDateString();

  // Fetch routines for the navigated date
  const fetchRoutinesForDate = async (date: Date) => {
    if (!activeProgram) return;
    
    setLoading(true);
    try {
      const user = (await (supabase as any).auth.getUser()).data.user;
      if (!user) return;

      let routines = [];
      let isCompleted = false;

      if (programType === 'weekly') {
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const { data: weeklyRoutines } = await (supabase as any)
          .from('weekly_program_routines')
          .select('*, routine:routines(*)')
          .eq('program_id', activeProgram.id)
          .eq('day_of_week', dayOfWeek);
        
        routines = weeklyRoutines || [];
      } else if (programType === 'gatofit') {
        // For Gatofit programs, use the already loaded routines from activeProgram
        console.log('Using activeProgram routines:', (activeProgram as any).routines);
        routines = (activeProgram as any).routines || [];
      } else if (programType === 'admin') {
        // For admin programs
        const dayOfWeek = date.getDay();
        const dayOfWeekAdjusted = dayOfWeek === 0 ? 7 : dayOfWeek;
        
        const { data: adminRoutines } = await (supabase as any)
          .from('admin_program_routines')
          .select('*, routine:routines(*)')
          .eq('program_id', activeProgram.id)
          .eq('day_of_week', dayOfWeekAdjusted);
        
        routines = adminRoutines || [];
      }

      // Check if workouts are completed for this date
      if (routines.length > 0) {
        const { data: workoutLogs } = await (supabase as any)
          .from('workout_logs')
          .select('id')
          .eq('user_id', user.id)
          .eq('date', date.toISOString().split('T')[0]);
        
        isCompleted = (workoutLogs?.length || 0) > 0;
      }

      setCurrentRoutines(routines);
      setCompletionStatus(isCompleted);
    } catch (error) {
      console.error('Error fetching routines:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const navigateToPreviousDay = () => {
    const previousDay = new Date(navigatedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    setNavigatedDate(previousDay);
  };

  const navigateToNextDay = () => {
    const nextDay = new Date(navigatedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setNavigatedDate(nextDay);
  };

  const handleViewRoutine = (routineId: number) => {
    // Navigate to routine detail page
    window.location.href = `/routine/${routineId}`;
  };

  // Effect to fetch routines when navigated date changes
  useEffect(() => {
    if (isOpen && activeProgram) {
      fetchRoutinesForDate(navigatedDate);
    }
  }, [navigatedDate, isOpen, activeProgram]);

  // Reset to initial date when modal opens
  useEffect(() => {
    if (isOpen) {
      setNavigatedDate(initialSelectedDate);
      setCurrentRoutines(initialRoutines);
      setCompletionStatus(initialIsCompleted);
    }
  }, [isOpen, initialSelectedDate, initialRoutines, initialIsCompleted]);

  if (!isOpen || !activeProgram) {
    return null;
  }

  // Helper functions
  const handleStartRoutine = (routineId: number) => {
    onStartRoutine(routineId);
    onClose();
  };

  const getDayMessage = () => {
    if (completionStatus) {
      return "Entrenamientos completados para este día";
    }
    let programTypeName = 'Rutinas programadas';
    if (programType === 'gatofit') programTypeName = 'Programa Gatofit';
    if (programType === 'admin') programTypeName = 'Programa Asignado';
    
    const dateStatus = getDateStatus(navigatedDate);
    if (dateStatus === "Hoy") {
      return `${programTypeName} para hoy`;
    } else if (dateStatus === "Ayer") {
      return `${programTypeName} de ayer`;
    } else if (dateStatus === "Mañana") {
      return `${programTypeName} para mañana`;
    } else {
      return `${programTypeName} para este día`;
    }
  };

  const getMessageIcon = () => {
    if (completionStatus) {
      return <Check className="h-4 w-4 text-green-600" />;
    }
    if (!isCurrentDay) {
      return <AlertCircle className="h-4 w-4 text-orange-600" />;
    }
    return <Calendar className="h-4 w-4 text-blue-600" />;
  };

  const getMessageColor = () => {
    if (completionStatus) {
      return "bg-green-50 text-green-900";
    }
    if (!isCurrentDay) {
      return "bg-orange-50 text-orange-900";
    }
    return "bg-blue-50 text-blue-900";
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative z-10 w-full max-w-md animate-scale-in">
        <Card className="shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto border-0 bg-background">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <h3 className="text-lg font-semibold">Rutinas Programadas</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <CardBody className="pt-0 space-y-4">
            {/* Integrated Header with Day Navigator and Program Info */}
            <div 
              className="relative rounded-lg overflow-hidden"
              style={{
                backgroundImage: programType === 'gatofit' && (activeProgram as GatofitProgram)?.cover_image_url 
                  ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${(activeProgram as GatofitProgram).cover_image_url})`
                  : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className={`p-4 ${programType === 'gatofit' && (activeProgram as GatofitProgram)?.cover_image_url ? 'text-white' : 'bg-secondary/20'}`}>
                {/* Day Navigator */}
                <div className="flex items-center justify-between mb-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={navigateToPreviousDay}
                    className={`h-8 w-8 p-0 ${programType === 'gatofit' && (activeProgram as GatofitProgram)?.cover_image_url ? 'text-white hover:bg-white/20' : ''}`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-sm font-medium capitalize">{formatDayOfWeek(navigatedDate)}</p>
                    <p className="text-xs opacity-90">{formatShortDate(navigatedDate)}</p>
                    {getDateStatus(navigatedDate) && (
                      <p className="text-xs font-medium">{getDateStatus(navigatedDate)}</p>
                    )}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={navigateToNextDay}
                    className={`h-8 w-8 p-0 ${programType === 'gatofit' && (activeProgram as GatofitProgram)?.cover_image_url ? 'text-white hover:bg-white/20' : ''}`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Program info */}
                <div className="flex items-center gap-2">
                  {programType === 'admin' ? (
                    <i className="fi fi-sr-apple-dumbbell text-lg" />
                  ) : (
                    getMessageIcon()
                  )}
                  <div>
                    <p className="text-sm font-medium">{activeProgram.name}</p>
                    <p className="text-xs opacity-90">{getDayMessage()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Cargando rutinas...</span>
              </div>
            )}

            {/* Current date routines */}
            {!loading && (
              <div className="space-y-3">
                {currentRoutines.map((programRoutine, index) => (
                  <div
                    key={programRoutine.id}
                    className="p-4 border border-border/50 rounded-lg hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-base">
                        {programRoutine.routine?.name || `Rutina ID: ${programRoutine.routine_id}`}
                      </h4>
                      <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                        #{index + 1}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      {programRoutine.routine?.estimated_duration_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{programRoutine.routine.estimated_duration_minutes} min</span>
                        </div>
                      )}
                      {programRoutine.routine?.type && (
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          <span className="capitalize">{programRoutine.routine.type}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewRoutine(programRoutine.routine_id)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button
                        onClick={() => handleStartRoutine(programRoutine.routine_id)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                        size="sm"
                        disabled={completionStatus}
                      >
                        <Dumbbell className="h-4 w-4 mr-2" />
                        {completionStatus ? "Completado" : "Iniciar Rutina"}
                      </Button>
                    </div>
                  </div>
                ))}
                
                {currentRoutines.length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No hay rutinas programadas para este día</p>
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );

  // Always show the modal with day navigator
  return createPortal(modalContent, document.body);
};

export default ProgrammedRoutinesModal;
