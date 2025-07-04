
import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useWeeklyPrograms } from "@/hooks/useWeeklyPrograms";
import { useToast } from "@/hooks/use-toast";
import WeeklyProgramCalendar from "@/components/weekly-program/WeeklyProgramCalendar";

const CreateWeeklyProgramPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createProgram } = useWeeklyPrograms();
  const { toast } = useToast();
  
  const programType = (searchParams.get('type') as 'simple' | 'advanced') || 'simple';
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [totalWeeks, setTotalWeeks] = useState(1);
  const [createdProgramId, setCreatedProgramId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la programación es requerido",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    
    try {
      const program = await createProgram(
        name.trim(), 
        description.trim() || undefined, 
        programType,
        programType === 'advanced' ? totalWeeks : 1
      );
      
      if (program) {
        setCreatedProgramId(program.id);
        toast({
          title: "¡Programación creada!",
          description: `Tu programación ${programType === 'simple' ? 'simple' : 'avanzada'} ha sido creada correctamente`,
        });
      }
    } catch (error) {
      console.error("Error creating program:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = () => {
    navigate('/workout/programs');
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-2xl mx-auto">
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
          <h1 className="text-2xl font-bold">
            Nueva Programación {programType === 'simple' ? 'Simple' : 'Avanzada'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {programType === 'simple' 
              ? 'Crea una programación semanal básica'
              : 'Crea una programación con múltiples semanas'
            }
          </p>
        </div>
      </div>

      {!createdProgramId ? (
        /* Program Creation Form */
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Programación *</Label>
              <Input
                id="name"
                placeholder="Ej: Rutina de Fuerza Semanal"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Describe el objetivo de esta programación..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {programType === 'advanced' && (
              <div className="space-y-2">
                <Label htmlFor="weeks">Número de Semanas</Label>
                <Input
                  id="weeks"
                  type="number"
                  min="1"
                  max="52"
                  value={totalWeeks}
                  onChange={(e) => setTotalWeeks(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <p className="text-xs text-muted-foreground">
                  Podrás configurar rutinas diferentes para cada semana
                </p>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">
                {programType === 'simple' ? '📋 Programación Simple' : '⚡ Programación Avanzada'}
              </h4>
              <p className="text-sm text-blue-700">
                {programType === 'simple' 
                  ? 'Perfecta para rutinas que se repiten cada semana. Ideal para mantener consistencia.'
                  : 'Permite progresión semanal con rutinas diferentes. Ideal para planes de entrenamiento estructurados.'
                }
              </p>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={saving || !name.trim()}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Creando..." : "Crear Programación"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Program Configuration */
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">¡Programación Creada!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Tu programación "{name}" ha sido creada correctamente. 
                Ahora puedes configurar las rutinas para cada día.
              </p>
              
              <div className="flex gap-2">
                <Button onClick={handleFinish} className="flex-1">
                  Finalizar
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/workout/programs/edit/${createdProgramId}`)}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Configurar Rutinas
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Calendar Preview */}
          <WeeklyProgramCalendar 
            programId={createdProgramId}
            readonly={true}
          />
        </div>
      )}
    </div>
  );
};

export default CreateWeeklyProgramPage;
