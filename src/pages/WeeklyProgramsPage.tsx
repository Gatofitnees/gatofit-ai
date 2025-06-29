
import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Play, Edit3, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { useWeeklyPrograms } from "@/hooks/useWeeklyPrograms";
import { cn } from "@/lib/utils";

const WeeklyProgramsPage: React.FC = () => {
  const navigate = useNavigate();
  const { programs, loading, deleteProgram, setActiveProgram } = useWeeklyPrograms();

  const handleCreateProgram = () => {
    navigate("/workout/programs/create");
  };

  const handleViewProgram = (programId: string) => {
    navigate(`/workout/programs/view/${programId}`);
  };

  const handleEditProgram = (programId: string) => {
    navigate(`/workout/programs/edit/${programId}`);
  };

  const handleDeleteProgram = async (programId: string, programName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la programación "${programName}"?`)) {
      await deleteProgram(programId);
    }
  };

  const handleActivateProgram = async (programId: string) => {
    await setActiveProgram(programId);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Cargando programaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Mis Programaciones</h1>
          <p className="text-sm text-muted-foreground">
            Organiza tus rutinas semanalmente
          </p>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={handleCreateProgram}
          className="bg-purple-500 hover:bg-purple-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva
        </Button>
      </div>

      {/* Programs List */}
      {programs.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin programaciones</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Crea tu primera programación semanal para organizar tus entrenamientos
          </p>
          <Button
            onClick={handleCreateProgram}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Programación
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {programs.map((program) => (
            <Card key={program.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base">{program.name}</h3>
                      {program.is_active && (
                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-600 rounded-full font-medium">
                          Activa
                        </span>
                      )}
                    </div>
                    {program.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {program.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Creada el {new Date(program.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardBody className="pt-0">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewProgram(program.id)}
                    className="flex-1"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditProgram(program.id)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  
                  {!program.is_active && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleActivateProgram(program.id)}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteProgram(program.id, program.name)}
                    className="text-red-500 border-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed right-4 bottom-20 z-30">
        <Button
          onClick={handleCreateProgram}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-purple-500 hover:bg-purple-600 text-white"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default WeeklyProgramsPage;
