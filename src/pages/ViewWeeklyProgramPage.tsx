
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit3, Play, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/Card";
import WeeklyProgramCalendar from "@/components/weekly-program/WeeklyProgramCalendar";
import { useWeeklyPrograms } from "@/hooks/useWeeklyPrograms";
import { useWeeklyProgramRoutines } from "@/hooks/useWeeklyProgramRoutines";

const ViewWeeklyProgramPage: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const { programs, setActiveProgram } = useWeeklyPrograms();
  const { routines, loading } = useWeeklyProgramRoutines(programId);

  const program = programs.find(p => p.id === programId);

  const handleEdit = () => {
    navigate(`/workout/programs/edit/${programId}`);
  };

  const handleActivate = async () => {
    if (programId) {
      await setActiveProgram(programId);
    }
  };

  if (!program) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Programación no encontrada</p>
          <Button 
            variant="outline" 
            onClick={() => navigate("/workout/programs")}
            className="mt-4"
          >
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const totalRoutines = routines.length;
  const daysWithRoutines = new Set(routines.map(r => r.day_of_week)).size;
  const totalDuration = routines.reduce((sum, r) => 
    sum + (r.routine?.estimated_duration_minutes || 0), 0
  );

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{program.name}</h1>
            <div className="flex items-center gap-2">
              {program.is_active && (
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-600 rounded-full font-medium">
                  Activa
                </span>
              )}
              <p className="text-sm text-muted-foreground">
                {totalRoutines} rutinas en {daysWithRoutines} días
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {!program.is_active && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleActivate}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Program Info */}
      {(program.description || totalDuration > 0) && (
        <Card className="mb-6">
          <CardBody>
            {program.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {program.description}
              </p>
            )}
            
            {totalDuration > 0 && (
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Duración total: </span>
                  <span className="font-medium">{formatDuration(totalDuration)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Promedio por día: </span>
                  <span className="font-medium">
                    {formatDuration(Math.round(totalDuration / Math.max(daysWithRoutines, 1)))}
                  </span>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Weekly Calendar */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Cargando programación...</p>
        </div>
      ) : (
        <WeeklyProgramCalendar
          routines={routines}
          onAddRoutine={() => {}}
          onRemoveRoutine={() => {}}
          readOnly={true}
        />
      )}
    </div>
  );
};

export default ViewWeeklyProgramPage;
