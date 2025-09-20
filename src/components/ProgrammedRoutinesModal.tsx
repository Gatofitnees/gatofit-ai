
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar, Clock, Dumbbell, Target, X, Check, AlertCircle, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { WeeklyProgram, WeeklyProgramRoutine } from "@/hooks/useWeeklyPrograms";
import { GatofitProgram } from "@/hooks/useGatofitPrograms";
import { AdminProgram, UnifiedProgramData } from "@/hooks/useActiveProgramUnified";
import { supabase } from "@/integrations/supabase/client";

interface ProgrammedRoutinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProgram: UnifiedProgramData | null;
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
  const [nutritionPlans, setNutritionPlans] = useState<any[]>([]);
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
          .eq('program_id', activeProgram.program.id)
          .eq('day_of_week', dayOfWeek);
        
        routines = weeklyRoutines || [];
      } else if (programType === 'gatofit') {
        // For Gatofit programs, we need to recalculate the day for the navigated date
        // since activeProgram.routines are filtered for the initial selected date only
        console.log('Fetching Gatofit routines for navigated date:', date.toDateString());
        
        if (activeProgram.userProgress) {
          const userProgress = activeProgram.userProgress;
          
          // Calculate the program day for the navigated date
          const startDate = new Date(userProgress.started_at);
          const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff >= 0) {
            // For today, use current progress; for other dates, calculate
            const today = new Date();
            const isToday = date.toDateString() === today.toDateString();
            
            let weekNumber, dayOfWeek;
            
            if (isToday) {
              weekNumber = userProgress.current_week;
              const jsDay = date.getDay();
              dayOfWeek = jsDay === 0 ? 6 : jsDay - 1; // Convert to Monday-first (0=Monday)
            } else {
              weekNumber = Math.floor(daysDiff / 7) + 1;
              const jsDay = date.getDay();
              dayOfWeek = jsDay === 0 ? 6 : jsDay - 1; // Convert to Monday-first (0=Monday)
            }
            
            console.log('Calculated day for Gatofit:', { weekNumber, dayOfWeek, daysDiff, isToday });
            
            // Fetch routines for this specific day
            const { data: gatofitRoutines } = await (supabase as any)
              .from('gatofit_program_routines')
              .select(`
                *,
                routine:routine_id (
                  id,
                  name,
                  type,
                  estimated_duration_minutes
                )
              `)
              .eq('program_id', activeProgram.program.id)
              .eq('week_number', weekNumber)
              .eq('day_of_week', dayOfWeek)
              .order('order_in_day');
            
            console.log('Fetched Gatofit routines for day:', gatofitRoutines);
            routines = gatofitRoutines || [];
          }
        }
      } else if (programType === 'admin') {
        // For admin programs
        const currentDate = new Date(date);
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
        // Convert to Monday=0, Sunday=6 format for admin programs
        const dayOfWeekAdjusted = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        
        // First fetch admin program routines
        const { data: adminRoutines } = await (supabase as any)
          .from('admin_program_routines')
          .select('routine_id, order_in_day, notes')
          .eq('program_id', activeProgram.program.id)
          .eq('week_number', 1)
          .eq('day_of_week', dayOfWeekAdjusted)
          .order('order_in_day');
        
        if (adminRoutines && adminRoutines.length > 0) {
          // Get unique routine IDs
          const routineIds = adminRoutines.map((r: any) => r.routine_id);
          
          // Fetch routine details separately
          const { data: routineDetails, error: routineDetailsError } = await (supabase as any)
            .from('routines')
            .select('id, name, description, estimated_duration_minutes, difficulty_level, type')
            .in('id', routineIds);
          
          if (routineDetailsError) {
            console.error('Error fetching routine details:', routineDetailsError);
          }
          
          // Create a map for easy lookup
          const routineMap = new Map(routineDetails?.map((r: any) => [r.id, r]) || []);
          
          // Log missing routines for debugging
          const missingRoutines = routineIds.filter(id => !routineMap.has(id));
          if (missingRoutines.length > 0) {
            console.warn('⚠️ Missing routine details for IDs:', missingRoutines);
          }
          
          // Combine the data with better fallback for missing routines
          routines = adminRoutines.map((item: any) => {
            const routineDetail = routineMap.get(item.routine_id);
            return {
              id: item.routine_id,
              routine_id: item.routine_id,
              routine: routineDetail || { 
                id: item.routine_id, 
                name: `Rutina no encontrada (ID: ${item.routine_id})`,
                description: 'Esta rutina no está disponible en el sistema',
                estimated_duration_minutes: 60,
                difficulty_level: 'medium',
                type: 'strength',
                is_missing: true
              },
              notes: item.notes,
              order_in_day: item.order_in_day,
            };
          });
        }

        // Fetch nutrition plans for admin programs
        const { data: adminNutritionPlans } = await (supabase as any)
          .from('admin_program_nutrition_plans')
          .select('nutrition_plan_id, order_in_day, notes')
          .eq('program_id', activeProgram.program.id)
          .eq('week_number', 1)
          .eq('day_of_week', dayOfWeekAdjusted)
          .order('order_in_day');

        if (adminNutritionPlans && adminNutritionPlans.length > 0) {
          // Get unique nutrition plan IDs
          const planIds = adminNutritionPlans.map((p: any) => p.nutrition_plan_id);
          
          // Fetch nutrition plan details separately
          const { data: planDetails } = await (supabase as any)
            .from('nutrition_plans')
            .select('id, name, description, target_calories, target_protein_g, target_carbs_g, target_fats_g')
            .in('id', planIds);
          
          // Create a map for easy lookup
          const planMap = new Map(planDetails?.map((p: any) => [p.id, p]) || []);
          
          setNutritionPlans(adminNutritionPlans.map((item: any) => {
            const planDetail = planMap.get(item.nutrition_plan_id) as any;
            return {
              id: item.nutrition_plan_id,
              name: planDetail?.name || `Plan ${item.nutrition_plan_id}`,
              description: planDetail?.description,
              target_calories: planDetail?.target_calories,
              target_protein_g: planDetail?.target_protein_g,
              target_carbs_g: planDetail?.target_carbs_g,
              target_fats_g: planDetail?.target_fats_g,
              notes: item.notes
            };
          }));
        } else {
          setNutritionPlans([]);
        }
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
      
      // Reset nutrition plans if not admin program
      if (programType !== 'admin') {
        setNutritionPlans([]);
      }
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
      setNutritionPlans([]);
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
            <h3 className="text-lg font-semibold">{programType === 'admin' ? 'Programa' : 'Rutinas Programadas'}</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <CardBody className="pt-0 space-y-4">
            {/* Integrated Header with Day Navigator and Program Info */}
            <div 
              className="relative rounded-lg overflow-hidden"
              style={{
                backgroundImage: programType === 'gatofit' && (activeProgram.program as GatofitProgram)?.cover_image_url 
                  ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${(activeProgram.program as GatofitProgram).cover_image_url})`
                  : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className={`p-4 ${programType === 'gatofit' && (activeProgram.program as GatofitProgram)?.cover_image_url ? 'text-white' : 'bg-secondary/20'}`}>
                {/* Day Navigator */}
                <div className="flex items-center justify-between mb-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={navigateToPreviousDay}
                    className={`h-8 w-8 p-0 ${programType === 'gatofit' && (activeProgram.program as GatofitProgram)?.cover_image_url ? 'text-white hover:bg-white/20' : ''}`}
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
                    className={`h-8 w-8 p-0 ${programType === 'gatofit' && (activeProgram.program as GatofitProgram)?.cover_image_url ? 'text-white hover:bg-white/20' : ''}`}
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
                    <p className="text-sm font-medium">{activeProgram.program.name}</p>
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

            {/* Content */}
            {!loading && (
              <div className="space-y-6">
                {currentRoutines.length === 0 && nutritionPlans.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No hay contenido programado para este día
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Rutinas Section */}
                    {currentRoutines.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-3">Entrenamiento</h3>
                        <div className="space-y-3">
                          {currentRoutines.map((programRoutine, index) => (
                            <div
                              key={programRoutine.id}
                              className="p-4 border border-border/50 rounded-lg hover:bg-secondary/30 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-base">
                                    {programRoutine.routine?.name || `Rutina ID: ${programRoutine.routine_id}`}
                                  </h4>
                                  {programRoutine.routine?.is_missing && (
                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                      No disponible
                                    </span>
                                  )}
                                </div>
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
                                  disabled={programRoutine.routine?.is_missing}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver
                                </Button>
                                <Button
                                  onClick={() => handleStartRoutine(programRoutine.routine_id)}
                                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
                                  size="sm"
                                  disabled={completionStatus || programRoutine.routine?.is_missing}
                                >
                                  <Dumbbell className="h-4 w-4 mr-2" />
                                  {programRoutine.routine?.is_missing 
                                    ? "No disponible" 
                                    : completionStatus 
                                      ? "Completado" 
                                      : "Iniciar Rutina"
                                  }
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Nutrition Section */}
                    {nutritionPlans.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-3">Alimentación</h3>
                        <div className="space-y-3">
                          {nutritionPlans.map((plan, index) => (
                            <div
                              key={`${plan.id}-${index}`}
                              className="p-4 border border-border/50 rounded-lg bg-card"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-base mb-1">
                                    Plan de alimentación ({plan.name})
                                  </h4>
                                  <div className="flex gap-4 text-sm text-muted-foreground">
                                    <span>🔥 {plan.target_calories} kcal</span>
                                    <span>🥩 {plan.target_protein_g}g</span>
                                    <span>🌾 {plan.target_carbs_g}g</span>
                                    <span>🥑 {plan.target_fats_g}g</span>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => {
                                    const dateString = navigatedDate.toISOString().split('T')[0];
                                    window.location.href = `/nutrition-program?date=${dateString}`;
                                  }}
                                  variant="outline"
                                  size="sm"
                                >
                                  Ver Plan
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
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
