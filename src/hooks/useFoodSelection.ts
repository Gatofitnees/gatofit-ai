import { useState, useCallback } from 'react';

interface FoodSearchResult {
  id: string;
  name: string;
  description: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  categoryIcon?: string;
  categoryColor?: string;
  nutrition?: {
    calories: number;
    fat: number;
    carbs: number;
    protein: number;
    serving_size: string;
  };
}

export const useFoodSelection = () => {
  const [selectedFoods, setSelectedFoods] = useState<FoodSearchResult[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const toggleFoodSelection = useCallback((food: FoodSearchResult) => {
    setSelectedFoods(prev => {
      const isSelected = prev.some(f => f.id === food.id);
      if (isSelected) {
        // Remove from selection
        setQuantities(prev => {
          const newQuantities = { ...prev };
          delete newQuantities[food.id];
          return newQuantities;
        });
        return prev.filter(f => f.id !== food.id);
      } else {
        // Add to selection with default quantity of 100g
        setQuantities(prev => ({
          ...prev,
          [food.id]: 100
        }));
        return [...prev, food];
      }
    });
  }, []);

  const updateQuantity = useCallback((foodId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [foodId]: quantity
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFoods([]);
    setQuantities({});
  }, []);

  const isSelected = useCallback((foodId: string) => {
    return selectedFoods.some(f => f.id === foodId);
  }, [selectedFoods]);

  const getQuantity = useCallback((foodId: string) => {
    return quantities[foodId] || 100;
  }, [quantities]);

  return {
    selectedFoods,
    quantities,
    toggleFoodSelection,
    updateQuantity,
    clearSelection,
    isSelected,
    getQuantity,
  };
};