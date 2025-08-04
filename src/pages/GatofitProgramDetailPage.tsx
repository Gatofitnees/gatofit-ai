import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Calendar, Clock, Target, User, CheckCircle, Circle, ChevronLeft, ChevronRight, Dumbbell, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGatofitProgramDetail, useGatofitPrograms } from "@/hooks/useGatofitPrograms";
import ProgramStartCalendar from "@/components/weekly-program/ProgramStartCalendar";

const GatofitProgramDetailPage: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const { program, weeks, exercises, routines, loading } = useGatofitProgramDetail(programId);
  const { userProgress, startProgram } = useGatofitPrograms();
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(1);

  const userInProgram = userProgress.find(p => p.program_id === programId && p.is_active);
  
  // Set initial selected week to current user week or first week
  React.useEffect(() => {
    if (userInProgram && userInProgram.current_week) {
      setSelectedWeek(userInProgram.current_week);
    } else if (weeks.length > 0) {
      setSelectedWeek(weeks[0].week_number);
    }
  }, [userInProgram, weeks]);

  const handleStartProgram = async (startDate?: Date) => {
    if (programId) {
      await startProgram(programId, startDate);
      setShowStartCalendar(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'principiante':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'intermedio':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'avanzado':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getActivitiesForWeekAndDay = (weekNumber: number, dayOfWeek: number) => {
    const dayExercises = exercises.filter(ex => ex.week_number === weekNumber && ex.day_of_week === dayOfWeek);
    const dayRoutines = routines.filter(r => r.week_number === weekNumber && r.day_of_week === dayOfWeek);
    
    // Debug logs
    console.log(`Buscando actividades para semana ${weekNumber}, día ${dayOfWeek}`);
    console.log('Ejercicios encontrados:', dayExercises);
    console.log('Rutinas encontradas:', dayRoutines);
    
    // Combine and sort by order_in_day
    return [...dayExercises, ...dayRoutines].sort((a, b) => a.order_in_day - b.order_in_day);
  };

  const DAYS_OF_WEEK = [
    { id: 0, name: 'Lunes', short: 'L' },
    { id: 1, name: 'Martes', short: 'M' },
    { id: 2, name: 'Miércoles', short: 'X' },
    { id: 3, name: 'Jueves', short: 'J' },
    { id: 4, name: 'Viernes', short: 'V' },
    { id: 5, name: 'Sábado', short: 'S' },
    { id: 6, name: 'Domingo', short: 'D' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-4xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Cargando detalles del programa...</p>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-4xl mx-auto">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Programa no encontrado</h2>
          <p className="text-muted-foreground mb-4">No se pudo cargar el programa solicitado.</p>
          <Button onClick={() => navigate('/gatofit-programs')}>
            Volver a programas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/gatofit-programs')}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{program.name}</h1>
          <p className="text-muted-foreground text-sm">{program.description}</p>
        </div>
      </div>

      {/* Program Hero Card */}
      <Card className="mb-6 overflow-hidden">
        <div 
          className="h-48 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${program.cover_image_url})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getDifficultyColor(program.difficulty_level)}>
                {program.difficulty_level}
              </Badge>
              {userInProgram && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                  Programa Activo
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Duración</p>
              <p className="font-semibold">{program.duration_weeks} semanas</p>
            </div>
            <div className="text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Tipo</p>
              <p className="font-semibold">{program.program_type}</p>
            </div>
            <div className="text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Sesiones/semana</p>
              <p className="font-semibold">{program.estimated_sessions_per_week || 3}</p>
            </div>
            <div className="text-center">
              <User className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Audiencia</p>
              <p className="font-semibold">{program.target_audience || 'General'}</p>
            </div>
          </div>

          {userInProgram ? (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="font-medium text-green-800">
                  Semana {userInProgram.current_week} de {program.duration_weeks}
                </p>
                <p className="text-sm text-green-600">
                  {Math.round(userInProgram.completion_percentage)}% completado
                </p>
              </div>
              <Button onClick={() => navigate('/workout')}>
                Continuar Entrenamiento
              </Button>
            </div>
          ) : (
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => setShowStartCalendar(true)}
            >
              <Play className="h-5 w-5 mr-2" />
              Iniciar Programa
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Program Structure */}
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="weekly">Por Semanas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Estructura del Programa</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weeks Overview */}
                <div>
                  <h4 className="font-medium mb-3">Progresión por Semanas</h4>
                  <div className="space-y-2">
                    {weeks.map((week) => (
                      <div key={week.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                          {week.week_number}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {week.week_name || `Semana ${week.week_number}`}
                          </p>
                          {week.week_description && (
                            <p className="text-xs text-muted-foreground">
                              {week.week_description}
                            </p>
                          )}
                        </div>
                        {userInProgram && userInProgram.current_week > week.week_number ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Program Stats */}
                <div>
                  <h4 className="font-medium mb-3">Estadísticas del Programa</h4>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        {exercises.length}
                      </p>
                      <p className="text-sm text-muted-foreground">Total de ejercicios</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        {program.duration_weeks * (program.estimated_sessions_per_week || 3)}
                      </p>
                      <p className="text-sm text-muted-foreground">Sesiones totales</p>
                    </div>

                    {weeks.length > 0 && (
                      <div className="p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {weeks.length}
                        </p>
                        <p className="text-sm text-muted-foreground">Semanas estructuradas</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          {/* Week Navigator */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                  disabled={selectedWeek <= 1 || weeks.length === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold">
                    {weeks.find(w => w.week_number === selectedWeek)?.week_name || `Semana ${selectedWeek}`}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedWeek} de {program?.duration_weeks || weeks.length}
                  </p>
                  {weeks.find(w => w.week_number === selectedWeek)?.week_description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {weeks.find(w => w.week_number === selectedWeek)?.week_description}
                    </p>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedWeek(Math.min(program?.duration_weeks || weeks.length, selectedWeek + 1))}
                  disabled={selectedWeek >= (program?.duration_weeks || weeks.length)}
                  className="flex items-center gap-2"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              {userInProgram && (
                <div className="flex justify-center mt-3">
                  {userInProgram.current_week > selectedWeek ? (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                      Semana Completada
                    </Badge>
                  ) : userInProgram.current_week === selectedWeek ? (
                    <Badge variant="default">
                      Semana Actual
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      Próximamente
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Week Content - Vertical Layout */}
          <div className="space-y-3">
            {DAYS_OF_WEEK.map((day) => {
              const dayActivities = getActivitiesForWeekAndDay(selectedWeek, day.id);
              
              return (
                <Card key={day.id} className="overflow-hidden">
                  <div className="flex">
                    {/* Day Label */}
                    <div className="bg-primary/10 p-4 border-r flex flex-col items-center justify-center min-w-[80px]">
                      <div className="text-sm font-medium text-primary">{day.short}</div>
                      <div className="text-xs text-muted-foreground text-center">{day.name}</div>
                    </div>
                    
                    {/* Day Content */}
                    <div className="flex-1 p-4">
                      {dayActivities.length > 0 ? (
                        <div className="space-y-3">
                          {dayActivities.map((activity, index) => (
                            <div key={activity.id} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                              <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">{index + 1}</span>
                              </div>
                              
                               <div className="flex-1">
                                 {'exercise_id' in activity ? (
                                   // Individual Exercise
                                   <div className="flex items-start gap-2">
                                     <Dumbbell className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                     <div className="flex-1">
                                       <h4 className="font-medium text-sm text-foreground">
                                         {(activity as any).exercise?.name || 'Ejercicio'}
                                       </h4>
                                       
                                       <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                         {(activity as any).sets && (
                                           <span>{(activity as any).sets} serie{(activity as any).sets !== 1 ? 's' : ''}</span>
                                         )}
                                         {(activity as any).reps_min && (activity as any).reps_max && (
                                           <span>
                                             {(activity as any).reps_min === (activity as any).reps_max 
                                               ? `${(activity as any).reps_min} reps` 
                                               : `${(activity as any).reps_min}-${(activity as any).reps_max} reps`
                                             }
                                           </span>
                                         )}
                                         {(activity as any).rest_seconds && (
                                           <span className="flex items-center gap-1">
                                             <Timer className="h-3 w-3" />
                                             {(activity as any).rest_seconds}s descanso
                                           </span>
                                         )}
                                         {(activity as any).exercise?.equipment_required && (
                                           <span className="text-primary">
                                             {(activity as any).exercise.equipment_required}
                                           </span>
                                         )}
                                       </div>
                                       
                                       {activity.notes && (
                                         <p className="text-xs text-muted-foreground mt-1 italic">
                                           {activity.notes}
                                         </p>
                                       )}
                                     </div>
                                   </div>
                                 ) : (
                                   // Complete Routine  
                                   <div className="flex items-start gap-2">
                                     <Badge variant="default" className="text-xs mt-0.5">
                                       Rutina
                                     </Badge>
                                     <div className="flex-1">
                                       <h4 className="font-medium text-sm text-foreground">
                                         {(activity as any).routine?.name || 'Rutina'}
                                       </h4>
                                       
                                       <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                         {(activity as any).routine?.type && (
                                           <span>Tipo: {(activity as any).routine.type}</span>
                                         )}
                                         {(activity as any).routine?.estimated_duration_minutes && (
                                           <span className="flex items-center gap-1">
                                             <Timer className="h-3 w-3" />
                                             {(activity as any).routine.estimated_duration_minutes} min
                                           </span>
                                         )}
                                       </div>
                                       
                                       {(activity as any).routine?.description && (
                                         <p className="text-xs text-muted-foreground mt-1">
                                           {(activity as any).routine.description}
                                         </p>
                                       )}
                                       
                                       {activity.notes && (
                                         <p className="text-xs text-muted-foreground mt-1 italic border-t border-border/30 pt-1">
                                           Nota: {activity.notes}
                                         </p>
                                       )}
                                     </div>
                                   </div>
                                 )}
                               </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-8 text-center">
                          <div>
                            <Circle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground font-medium">Día de Descanso</p>
                            <p className="text-xs text-muted-foreground">No hay ejercicios programados</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Start Calendar Modal */}
      {showStartCalendar && (
        <ProgramStartCalendar
          isOpen={showStartCalendar}
          onClose={() => setShowStartCalendar(false)}
          onStartProgram={handleStartProgram}
          programName={program.name}
        />
      )}
    </div>
  );
};

export default GatofitProgramDetailPage;