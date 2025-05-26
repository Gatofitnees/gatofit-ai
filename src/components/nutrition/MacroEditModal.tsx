
import React from 'react';
import { Input } from '@/components/ui/input';
import Button from '@/components/Button';

interface MacroEditModalProps {
  editingMacro: string | null;
  currentValue: number;
  onClose: () => void;
  onUpdate: (type: string, value: number) => void;
}

export const MacroEditModal: React.FC<MacroEditModalProps> = ({
  editingMacro,
  currentValue,
  onClose,
  onUpdate
}) => {
  if (!editingMacro) return null;

  const getMacroLabel = (macro: string) => {
    switch (macro) {
      case 'protein_g': return 'Proteína';
      case 'carbs_g': return 'Carbohidratos';
      case 'fat_g': return 'Grasas';
      default: return '';
    }
  };

  const handleUpdate = (value: number) => {
    onUpdate(editingMacro.replace('_consumed', ''), value);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="neu-card p-6 w-full max-w-sm">
        <h3 className="text-lg font-medium mb-4">
          Editar {getMacroLabel(editingMacro)}
        </h3>
        <Input
          type="number"
          defaultValue={currentValue}
          onChange={(e) => handleUpdate(Number(e.target.value))}
          className="mb-4"
          autoFocus
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button variant="primary" onClick={onClose} className="flex-1">
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
};
