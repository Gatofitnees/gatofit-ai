
import React, { useState } from "react";
import { ArrowLeft, Plus, Calendar, Zap, Dumbbell, Play, Pause, Edit, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useWeeklyPrograms } from "@/hooks/useWeeklyPrograms";
import { useGatofitPrograms } from "@/hooks/useGatofitPrograms";
import ProgramTypeSelector from "@/components/weekly-program/ProgramTypeSelector";
import ProgramStartCalendar from "@/components/weekly-program/ProgramStartCalendar";
import AdvancedProgramBuilder from "@/components/weekly-program/AdvancedProgramBuilder";

const WeeklyProgramsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    programs, 
    loading, 
    setActiveProgram, 
    pauseProgram, 
    deleteProgram,
    getCurrentWeekForProgram 
  } = useWeeklyPrograms();
  const { userProgress: gatofitProgress } = useGatofitPrograms();
  
  const [selectedType, setSelectedType] = useState<'simple' | 'advanced'>('simple');
  const [showStartCalendar, setShowStartCalendar] = useState<string | null>(null);
  const [showAdvancedBuilder, setShowAdvancedBuilder] = useState<string | null>(null);

  // Filter programs by type
  const simplePrograms = programs.filter(p => p.program_type === 'simple');
  const advancedPrograms = programs.filter(p => p.program_type === 'advanced');
  const currentPrograms = selectedType === 'simple' ? simplePrograms : advancedPrograms;

  const handleCreateProgram = () => {
    navigate(`/workout/programs/create?type=${selectedType}`);
  };

  const handleStartProgram = async (programId: string, startDate?: Date) => {
    await setActiveProgram(programId, startDate);
    setShowStartCalendar(null);
  };

  const handlePauseProgram = async (programId: string) => {
    await pauseProgram(programId);
  };

  const handleDeleteProgram = async (programId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta programación?')) {
      await deleteProgram(programId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

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
          <h1 className="text-2xl font-bold">Mis Programaciones</h1>
          <p className="text-muted-foreground text-sm">
            Organiza tus entrenamientos semanales
          </p>
        </div>
      </div>

      {/* Program Type Selector */}
      <ProgramTypeSelector 
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />

      {/* Active Gatofit Programs */}
      {gatofitProgress.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🌟 Programas Gatofit Activos
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {gatofitProgress.map((progress) => (
                <div key={progress.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{progress.program?.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Semana {progress.current_week} • {progress.completion_percentage}% completado
                    </p>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => navigate('/gatofit-programs')}
                  >
                    Ver Detalles
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Program List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Cargando programaciones...</p>
          </div>
        ) : currentPrograms.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mb-4">
                {selectedType === 'simple' ? (
                  <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground" />
                ) : (
                  <Zap className="h-12 w-12 mx-auto text-muted-foreground" />
                )}
              </div>
              <h3 className="text-lg font-medium mb-2">
                No tienes programaciones {selectedType === 'simple' ? 'simples' : 'avanzadas'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {selectedType === 'simple' 
                  ? 'Crea tu primera programación semanal' 
                  : 'Crea tu primera programación con múltiples semanas'
                }
              </p>
              <Button onClick={handleCreateProgram}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Programación {selectedType === 'simple' ? 'Simple' : 'Avanzada'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {currentPrograms.map((program) => (
              <Card key={program.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{program.name}</h3>
                        {program.is_active && (
                          <Badge variant="default">
                            Activa
                          </Badge>
                        )}
                        {program.program_type === 'advanced' && (
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                            Avanzada
                          </span>
                        )}
                      </div>
                      
                      {program.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {program.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Creada {formatDate(program.created_at)}</span>
                        {program.program_type === 'advanced' && (
                          <span>{program.total_weeks} semanas</span>
                        )}
                        {program.is_active && program.start_date && (
                          <span>
                            Inicio: {formatDate(program.start_date)}
                            {program.program_type === 'advanced' && (
                              <span className="ml-2">
                                (Semana {getCurrentWeekForProgram(program)})
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {program.program_type === 'advanced' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAdvancedBuilder(program.id)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/workout/programs/edit/${program.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      {program.is_active ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePauseProgram(program.id)}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Pausar
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            if (program.program_type === 'advanced') {
                              setShowStartCalendar(program.id);
                            } else {
                              handleStartProgram(program.id);
                            }
                          }}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Iniciar
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProgram(program.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Create Button */}
            <Button 
              onClick={handleCreateProgram}
              className="w-full"
              variant="default"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Nueva Programación {selectedType === 'simple' ? 'Simple' : 'Avanzada'}
            </Button>
          </>
        )}
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

      {/* Advanced Program Builder Modal */}
      {showAdvancedBuilder && (
        <AdvancedProgramBuilder
          programId={showAdvancedBuilder}
          onClose={() => setShowAdvancedBuilder(null)}
        />
      )}
    </div>
  );
};

export default WeeklyProgramsPage;
