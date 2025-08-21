import React, { useState, useEffect } from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlatIcon } from '@/components/ui/FlatIcon';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface FoodCategory {
  id: number;
  name: string;
  icon_name?: string;
  color_class?: string;
}

interface FilterSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategories: number[];
  onCategoriesChange: (categories: number[]) => void;
}

const FilterSlidePanel: React.FC<FilterSlidePanelProps> = ({
  isOpen,
  onClose,
  selectedCategories,
  onCategoriesChange
}) => {
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('food_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  const clearFilters = () => {
    onCategoriesChange([]);
  };

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
            <div className="space-y-4">
              {/* Clear filters */}
              {selectedCategories.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {selectedCategories.length} categoría(s) seleccionada(s)
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

              {/* Categories */}
              <div>
                <h3 className="text-sm font-medium mb-3">Categorías</h3>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-10 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => toggleCategory(category.id)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                          selectedCategories.includes(category.id)
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-background border-border hover:bg-muted"
                        )}
                      >
                        {category.icon_name && (
                          <FlatIcon 
                            name={category.icon_name} 
                            size={16}
                            className={category.color_class || "text-muted-foreground"}
                          />
                        )}
                        <span className="text-sm font-medium">{category.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button 
              onClick={onClose}
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