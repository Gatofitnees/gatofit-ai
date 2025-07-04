
import React, { useState } from "react";
import { ArrowLeft, Play, Pause, Eye, Clock, Target, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useGatofitPrograms } from "@/hooks/useGatofitPrograms";
import ProgramStartCalendar from "@/components/weekly-program/ProgramStartCalendar";

const GatofitProgramsPage: React.FC = () => {
  const navigate = useNavigate();
  const { programs, userProgress, loading, startProgram, pauseProgram } = useGatofitPrograms();
  const [showStartCalendar, setShowStartCalendar] = useState<string | null>(null);

  const handleViewDetails = (programId: string) => {
    navigate(`/gatofit-programs/${programId}`);
  };

  const handleStartProgram = async (programId: string, startDate?: Date) => {
    await startProgram(programId, startDate);
    setShowStartCalendar(null);
  };

  const handlePauseProgram = async (progressId: string) => {
    await pauseProgram(progressId);
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

  const isUserInProgram = (programId: string) => {
    return userProgress.find(p => p.program_id === programId && p.is_active);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-4xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Cargando programas Gatofit...</p>
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
          onClick={() => navigate(-1)}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold text-2xl" style={{
            textShadow: '0 0 15px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4)'
          }}>
            Programas Gatofit
          </span>
          <p className="text-muted-foreground text-sm mt-1">
            Programas diseñados por expertos para maximizar tus resultados
          </p>
        </div>
      </div>

      {/* Active Programs */}
      {userProgress.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tus Programas Activos
          </h2>
          <div className="grid gap-4">
            {userProgress.map((progress) => (
              <Card key={progress.id} className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-900">{progress.program?.name}</h3>
                      <p className="text-sm text-blue-600">
                        Semana {progress.current_week} de {progress.program?.duration_weeks} • 
                        {Math.round(progress.completion_percentage)}% completado
                      </p>
                      {progress.last_workout_date && (
                        <p className="text-xs text-blue-500">
                          Último entrenamiento: {new Date(progress.last_workout_date).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(progress.program_id)}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePauseProgram(progress.id)}
                        className="border-orange-300 text-orange-700 hover:bg-orange-100"
                      >
                        <Pause className="h-4 w-4 mr-1" />
                        Pausar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Programs */}
      <div className="grid gap-6">
        {programs.map((program) => {
          const userInProgram = isUserInProgram(program.id);
          
          return (
            <div
              key={program.id}
              className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 min-h-[200px] group"
            >
              {/* Background image */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                style={{ backgroundImage: `url(${program.cover_image_url})` }}
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              {/* Content */}
              <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{program.name}</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">{program.description}</p>
                    </div>
                    {userInProgram && (
                      <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium border border-green-500/30">
                        Activo
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1 text-gray-300">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{program.duration_weeks} semanas</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-300">
                      <Target className="h-4 w-4" />
                      <span className="text-sm">{program.program_type}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(program.difficulty_level)}`}>
                      {program.difficulty_level}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(program.id)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </Button>
                  
                  {userInProgram ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePauseProgram(userInProgram.id)}
                      className="bg-orange-500/20 border-orange-500/30 text-orange-400 hover:bg-orange-500/30"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Pausar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setShowStartCalendar(program.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Start Calendar Modal */}
      {showStartCalendar && (
        <ProgramStartCalendar
          isOpen={!!showStartCalendar}
          onClose={() => setShowStartCalendar(null)}
          onStartProgram={(startDate) => handleStartProgram(showStartCalendar, startDate)}
          programName={programs.find(p => p.id === showStartCalendar)?.name || ""}
        />
      )}
    </div>
  );
};

export default GatofitProgramsPage;
