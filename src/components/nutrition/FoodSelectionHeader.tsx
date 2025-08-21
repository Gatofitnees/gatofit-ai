import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FoodSelectionHeaderProps {
  selectedCount: number;
  onSave: () => void;
  onClear: () => void;
  isSaving?: boolean;
}

const FoodSelectionHeader: React.FC<FoodSelectionHeaderProps> = ({
  selectedCount,
  onSave,
  onClear,
  isSaving = false
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className={cn(
      "flex items-center justify-between p-3 bg-primary/5 border-b",
      "animate-fade-in"
    )}>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {selectedCount === 1 ? 'alimento' : 'alimentos'}
        </span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        disabled={isSaving}
      >
        <X className="w-4 h-4 mr-1" />
        Limpiar
      </Button>
    </div>
  );
};

export default FoodSelectionHeader;