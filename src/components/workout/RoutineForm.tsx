
import React from "react";
import { Card, CardBody } from "@/components/Card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";

export interface RoutineFormData {
  name: string;
  type: string;
  description: string;
}

interface RoutineFormProps {
  initialData?: RoutineFormData;
  onFormChange: (data: RoutineFormData) => void;
  isDisabled?: boolean;
}

const RoutineForm: React.FC<RoutineFormProps> = ({ 
  initialData = { name: "", type: "", description: "" }, 
  onFormChange,
  isDisabled = false
}) => {
  const { control, watch } = useForm<RoutineFormData>({
    defaultValues: initialData
  });

  // Watch form values and notify parent component on changes
  React.useEffect(() => {
    const subscription = watch((data) => {
      onFormChange(data as RoutineFormData);
    });
    return () => subscription.unsubscribe();
  }, [watch, onFormChange]);

  return (
    <Card className="mb-6">
      <CardBody>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de la Rutina</label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input 
                  type="text" 
                  placeholder="Ej: Día de Pierna" 
                  disabled={isDisabled}
                  {...field}
                />
              )}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Rutina</label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                  disabled={isDisabled}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="strength">Fuerza</SelectItem>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="flexibility">Flexibilidad</SelectItem>
                      <SelectItem value="mixed">Mixto</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea 
                  rows={3}
                  placeholder="Describe brevemente esta rutina..." 
                  className="resize-none"
                  disabled={isDisabled}
                  {...field}
                />
              )}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default RoutineForm;
