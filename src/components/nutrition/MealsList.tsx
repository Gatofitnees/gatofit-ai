
import React from 'react';
import { FoodLogEntry } from '@/hooks/useFoodLog';
import { ProcessingFood } from '@/hooks/useFoodProcessing';
import { ProcessingFoodCard } from './ProcessingFoodCard';
import { FoodPreviewCard } from './FoodPreviewCard';
import { EmptyMealsState } from './EmptyMealsState';
import { useNavigate } from 'react-router-dom';

interface MealsListProps {
  entries: FoodLogEntry[];
  isLoading: boolean;
  processingFoods: ProcessingFood[];
  isToday: boolean;
  isSelectedDay: boolean;
  deleteEntry: (entryId: number) => Promise<boolean>;
  handleRetryAnalysis: (foodId: string) => Promise<void>;
  handleCancelProcessing: (foodId: string) => void;
}

export const MealsList: React.FC<MealsListProps> = ({
  entries,
  isLoading,
  processingFoods,
  isToday,
  isSelectedDay,
  deleteEntry,
  handleRetryAnalysis,
  handleCancelProcessing,
}) => {
  const navigate = useNavigate();

  const handleEditEntry = (entry: FoodLogEntry) => {
    navigate('/food-edit', {
      state: {
        initialData: entry,
        imageUrl: entry.photo_url || "",
        isEditing: true
      }
    });
  };

  const handleDeleteEntry = async (entryId: number) => {
    await deleteEntry(entryId);
  };
  
  if (isLoading && processingFoods.length === 0 && entries.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground mt-2">Cargando comidas...</p>
      </div>
    );
  }

  const hasContent = entries.length > 0 || processingFoods.length > 0;

  return (
    <div className="space-y-3">
      {processingFoods.map((food) => (
        <div key={food.id} className="animate-fade-in">
          <ProcessingFoodCard 
            imageUrl={food.imageSrc} 
            error={food.error}
            isCompleting={(food as any).isCompleting}
            isCancelling={(food as any).isCancelling}
            onRetry={() => handleRetryAnalysis(food.id)}
            onCancel={() => handleCancelProcessing(food.id)}
          />
        </div>
      ))}
      
      {entries.map((entry) => (
        <div key={entry.id} className="animate-fade-in">
          <FoodPreviewCard
            imageUrl={entry.photo_url || "/placeholder.svg"}
            name={entry.custom_food_name}
            calories={entry.calories_consumed}
            protein={entry.protein_g_consumed}
            carbs={entry.carbs_g_consumed}
            fat={entry.fat_g_consumed}
            loggedAt={entry.logged_at}
            onClick={() => handleEditEntry(entry)}
            onDelete={isToday ? () => handleDeleteEntry(entry.id!) : undefined}
          />
        </div>
      ))}

      {!hasContent && (
        <EmptyMealsState isSelectedDay={isSelectedDay} isToday={isToday} />
      )}
    </div>
  );
};
