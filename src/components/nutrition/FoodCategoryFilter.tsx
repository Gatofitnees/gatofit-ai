import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FlatIcon } from '@/components/ui/FlatIcon';
import { cn } from '@/lib/utils';

interface FoodCategory {
  id: number;
  name: string;
  icon_name: string;
  color_class: string;
}

interface FoodCategoryFilterProps {
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
}

const FoodCategoryFilter: React.FC<FoodCategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange
}) => {
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
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
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 bg-muted animate-pulse rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => onCategoryChange(null)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
          selectedCategory === null
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        )}
      >
        Todos
      </button>
      
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(
            selectedCategory === category.id ? null : category.id
          )}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
            selectedCategory === category.id
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          <FlatIcon 
            name={category.icon_name} 
            size={14} 
            className={category.color_class}
          />
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default FoodCategoryFilter;