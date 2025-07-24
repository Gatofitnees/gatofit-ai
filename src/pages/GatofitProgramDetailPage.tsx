import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Calendar, Clock, Target, User, CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGatofitProgramDetail, useGatofitPrograms } from "@/hooks/useGatofitPrograms";
import ProgramStartCalendar from "@/components/weekly-program/ProgramStartCalendar";

const GatofitProgramDetailPage: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const { program, weeks, exercises, loading } = useGatofitProgramDetail(programId);
  const { userProgress, startProgram } = useGatofitPrograms();
  const [showStartCalendar, setShowStartCalendar] = useState(false);

  const userInProgram = userProgress.find(p => p.program_id === programId && p.is_active);

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

  const getExercisesForWeekAndDay = (weekNumber: number, dayOfWeek: number) => {
    return exercises.filter(ex => ex.week_number === weekNumber && ex.day_of_week === dayOfWeek)
      .sort((a, b) => a.order_in_day - b.order_in_day);
  };

  const DAYS_OF_WEEK = [
    { id: 1, name: 'Lunes', short: 'L' },
    { id: 2, name: 'Martes', short: 'M' },
    { id: 3, name: 'Miércoles', short: 'X' },
    { id: 4, name: 'Jueves', short: 'J' },
    { id: 5, name: 'Viernes', short: 'V' },
    { id: 6, name: 'Sábado', short: 'S' },
    { id: 0, name: 'Domingo', short: 'D' },
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

        <TabsContent value="weekly" className="space-y-6">
          {weeks.map((week) => (
            <Card key={week.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {week.week_name || `Semana ${week.week_number}`}
                    </h3>
                    {week.week_description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {week.week_description}
                      </p>
                    )}
                  </div>
                  {userInProgram && (
                    <div className="flex items-center gap-2">
                      {userInProgram.current_week > week.week_number ? (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                          Completada
                        </Badge>
                      ) : userInProgram.current_week === week.week_number ? (
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
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const dayExercises = getExercisesForWeekAndDay(week.week_number, day.id);
                    
                    return (
                      <div key={day.id} className="text-center">
                        <div className="text-xs font-medium text-muted-foreground mb-2">
                          {day.short}
                        </div>
                        
                        <div className="space-y-1">
                          {dayExercises.length > 0 ? (
                            <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 min-h-[60px]">
                              <div className="text-xs text-primary font-medium">
                                {dayExercises.length} ejercicio{dayExercises.length !== 1 ? 's' : ''}
                              </div>
                              {dayExercises.slice(0, 2).map((exercise) => (
                                <div key={exercise.id} className="text-xs text-muted-foreground truncate">
                                  {exercise.exercise?.name}
                                </div>
                              ))}
                              {dayExercises.length > 2 && (
                                <div className="text-xs text-muted-foreground">
                                  +{dayExercises.length - 2} más
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-secondary/30 border border-secondary/50 rounded-lg p-2 min-h-[60px] flex items-center justify-center">
                              <div className="text-xs text-muted-foreground">
                                Descanso
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
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