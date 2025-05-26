
import React from 'react';
import Button from '@/components/Button';
import { GalacticButton } from './GalacticButton';

interface ActionButtonsProps {
  isSaving: boolean;
  isFormValid: boolean;
  onChangeResults: () => void;
  onSave: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isSaving,
  isFormValid,
  onChangeResults,
  onSave
}) => {
  return (
    <div className="flex gap-3 mb-8">
      <GalacticButton
        onClick={onChangeResults}
        className="flex-1"
      >
        Cambiar resultados
      </GalacticButton>
      
      <Button
        variant="primary"
        onClick={onSave}
        className="flex-1"
        disabled={isSaving || !isFormValid}
      >
        {isSaving ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </div>
  );
};
