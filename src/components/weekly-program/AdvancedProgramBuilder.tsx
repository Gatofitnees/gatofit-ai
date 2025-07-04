import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Calendar } from "lucide-react";
import { useAdvancedPrograms } from "@/hooks/useAdvancedPrograms";
import { useWeeklyProgramRoutines } from "@/hooks/useWeeklyProgramRoutines";

interface AdvancedProgramBuilderProps {
  programId: string;
  onClose: () => void;
}

const AdvancedProgramBuilder: React.FC<AdvancedProgramBuilderProps> = ({
  programId,
  onClose
}) => {
  const { weeks, createWeek, updateProgramTotalWeeks } = useAdvancedPrograms(programId);
  const [newWeekName, setNewWeekName] = useState("");
  const [newWeekDescription, setNewWeekDescription] = useState("");

  const handleAddWeek = async () => {
    if (!newWeekName) return;

    const weekNumber = weeks.length + 1;
    const success = await createWeek(weekNumber, newWeekName, newWeekDescription);
    
    if (success) {
      setNewWeekName("");
      setNewWeekDescription("");
      await updateProgramTotalWeeks(weekNumber);
    }
  };

  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Constructor de Programación Avanzada
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Add New Week */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agregar Nueva Semana</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Nombre de la semana (ej: Semana de Fuerza)"
                value={newWeekName}
                onChange={(e) => setNewWeekName(e.target.value)}
              />
              <Textarea
                placeholder="Descripción de la semana (opcional)"
                value={newWeekDescription}
                onChange={(e) => setNewWeekDescription(e.target.value)}
                rows={2}
              />
              <Button onClick={handleAddWeek} disabled={!newWeekName}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Semana {weeks.length + 1}
              </Button>
            </CardContent>
          </Card>

          {/* Existing Weeks */}
          <div className="space-y-4">
            {weeks.map((week) => (
              <Card key={week.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Semana {week.week_number}: {week.week_name}</span>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  {week.week_description && (
                    <p className="text-sm text-muted-foreground">
                      {week.week_description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {dayNames.map((day, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs font-medium mb-2">{day}</div>
                        <div className="min-h-[60px] border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button onClick={onClose}>
              Guardar Cambios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedProgramBuilder;
