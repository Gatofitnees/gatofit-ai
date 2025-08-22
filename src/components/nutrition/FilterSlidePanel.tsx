import React, { useState } from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface MacroFilters {
  minCalories?: number;
  maxCalories?: number;
  minProtein?: number;
  maxProtein?: number;
  minCarbs?: number;
  maxCarbs?: number;
  minFat?: number;
  maxFat?: number;
}

interface FilterSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategories: number[];
  onCategoriesChange: (filters: MacroFilters) => void;
}

const FilterSlidePanel: React.FC<FilterSlidePanelProps> = ({
  isOpen,
  onClose,
  selectedCategories,
  onCategoriesChange
}) => {
  const [filters, setFilters] = useState<MacroFilters>({});

  const updateFilter = (key: keyof MacroFilters, value: string) => {
    const numValue = value ? parseFloat(value) : undefined;
    setFilters(prev => ({
      ...prev,
      [key]: numValue
    }));
  };

  const applyFilters = () => {
    onCategoriesChange(filters);
    onClose();
  };

  const clearFilters = () => {
    setFilters({});
    onCategoriesChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Slide Panel */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-80 bg-background border-l shadow-lg z-50 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Filtros</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {/* Clear filters */}
              {hasActiveFilters && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Filtros activos
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs"
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}

              {/* Calories Filter */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Calorías</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Mínimo</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.minCalories || ''}
                      onChange={(e) => updateFilter('minCalories', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Máximo</Label>
                    <Input
                      type="number"
                      placeholder="1000"
                      value={filters.maxCalories || ''}
                      onChange={(e) => updateFilter('maxCalories', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Protein Filter */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Proteína (g)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Mínimo</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.minProtein || ''}
                      onChange={(e) => updateFilter('minProtein', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Máximo</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={filters.maxProtein || ''}
                      onChange={(e) => updateFilter('maxProtein', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Carbs Filter */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Carbohidratos (g)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Mínimo</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.minCarbs || ''}
                      onChange={(e) => updateFilter('minCarbs', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Máximo</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={filters.maxCarbs || ''}
                      onChange={(e) => updateFilter('maxCarbs', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Fat Filter */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Grasas (g)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Mínimo</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.minFat || ''}
                      onChange={(e) => updateFilter('minFat', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Máximo</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={filters.maxFat || ''}
                      onChange={(e) => updateFilter('maxFat', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button 
              onClick={applyFilters}
              className="w-full"
            >
              Aplicar filtros
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSlidePanel;