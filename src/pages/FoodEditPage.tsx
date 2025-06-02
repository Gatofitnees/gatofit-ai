
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FoodLogEntry, useFoodLog } from '@/hooks/useFoodLog';
import { FoodHeader } from '@/components/nutrition/FoodHeader';
import { FoodNameAndPortion } from '@/components/nutrition/FoodNameAndPortion';
import { CaloriesDisplay } from '@/components/nutrition/CaloriesDisplay';
import { MacronutrientsGrid } from '@/components/nutrition/MacronutrientsGrid';
import { HealthScoreCard } from '@/components/nutrition/HealthScoreCard';
import { IngredientsSection } from '@/components/nutrition/IngredientsSection';
import { ActionButtons } from '@/components/nutrition/ActionButtons';
import { MacroEditModal } from '@/components/nutrition/MacroEditModal';
import { ChangeResultsDialog } from '@/components/nutrition/ChangeResultsDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface FoodEditPageProps {
  onSave?: (entry: Partial<FoodLogEntry>) => void;
}

export const FoodEditPage: React.FC<FoodEditPageProps> = ({ onSave }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { initialData, imageUrl, isEditing, hasAnalysisError } = location.state || {};
  const { addEntry, updateEntry } = useFoodLog();

  const [formData, setFormData] = useState({
    custom_food_name: '',
    quantity_consumed: 1,
    unit_consumed: 'porción',
    calories_consumed: 0,
    protein_g_consumed: 0,
    carbs_g_consumed: 0,
    fat_g_consumed: 0,
    healthScore: 7
  });

  const [editingMacro, setEditingMacro] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [showChangeResults, setShowChangeResults] = useState(false);
  const [ingredients, setIngredients] = useState([
    { name: 'Pechuga de pollo', grams: 150, calories: 248, protein: 46, carbs: 0, fat: 5 },
    { name: 'Arroz integral', grams: 100, calories: 111, protein: 3, carbs: 23, fat: 1 },
    { name: 'Verduras mixtas', grams: 80, calories: 20, protein: 2, carbs: 4, fat: 0 }
  ]);

  useEffect(() => {
    if (initialData) {
      console.log('Loading initial data:', initialData);
      
      setFormData({
        custom_food_name: initialData.custom_food_name || '',
        quantity_consumed: initialData.quantity_consumed || 1,
        unit_consumed: initialData.unit_consumed || 'porción',
        calories_consumed: initialData.calories_consumed || 0,
        protein_g_consumed: initialData.protein_g_consumed || 0,
        carbs_g_consumed: initialData.carbs_g_consumed || 0,
        fat_g_consumed: initialData.fat_g_consumed || 0,
        healthScore: initialData.healthScore || initialData.health_score || 7
      });

      // Update ingredients from database or webhook analysis
      if (initialData.ingredients && initialData.ingredients.length > 0) {
        console.log('Loading ingredients from data:', initialData.ingredients);
        setIngredients(initialData.ingredients);
        setShowIngredients(true);
      }
    }
  }, [initialData]);

  const adjustPortion = (delta: number) => {
    const newQuantity = Math.max(0.5, formData.quantity_consumed + delta);
    const ratio = newQuantity / formData.quantity_consumed;
    
    setFormData(prev => ({
      ...prev,
      quantity_consumed: newQuantity,
      calories_consumed: Math.round(prev.calories_consumed * ratio),
      protein_g_consumed: Math.round(prev.protein_g_consumed * ratio),
      carbs_g_consumed: Math.round(prev.carbs_g_consumed * ratio),
      fat_g_consumed: Math.round(prev.fat_g_consumed * ratio)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const saveData: Partial<FoodLogEntry> = {
        custom_food_name: formData.custom_food_name,
        quantity_consumed: formData.quantity_consumed,
        unit_consumed: formData.unit_consumed,
        calories_consumed: formData.calories_consumed,
        protein_g_consumed: formData.protein_g_consumed,
        carbs_g_consumed: formData.carbs_g_consumed,
        fat_g_consumed: formData.fat_g_consumed,
        health_score: formData.healthScore,
        ingredients: ingredients,
        meal_type: 'snack1' as const
      };

      if (imageUrl) {
        saveData.photo_url = imageUrl;
      }

      console.log('Saving food data:', saveData);

      let success = false;
      
      if (isEditing && initialData?.id) {
        success = await updateEntry(initialData.id, saveData);
      } else {
        const result = await addEntry(saveData as Omit<FoodLogEntry, 'id' | 'logged_at' | 'log_date'>);
        success = result !== null;
      }

      if (success) {
        console.log('Food entry saved successfully');
        if (onSave) {
          onSave(saveData);
        }
        navigate('/nutrition');
      } else {
        console.error('Failed to save food entry');
      }
    } catch (error) {
      console.error('Error saving food entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateMacro = (type: string, value: number) => {
    setFormData(prev => ({ ...prev, [`${type}_consumed`]: value }));
  };

  const handleChangeResults = (request: string) => {
    console.log('AI change request:', request);
    // TODO: Implement AI integration
  };

  // Create the food data object with all current state including ingredients
  const currentFoodData = {
    custom_food_name: formData.custom_food_name,
    quantity_consumed: formData.quantity_consumed,
    unit_consumed: formData.unit_consumed,
    calories_consumed: formData.calories_consumed,
    protein_g_consumed: formData.protein_g_consumed,
    carbs_g_consumed: formData.carbs_g_consumed,
    fat_g_consumed: formData.fat_g_consumed,
    healthScore: formData.healthScore,
    ingredients: ingredients
  };

  return (
    <div className="min-h-screen bg-background">
      <FoodHeader imageUrl={imageUrl} />

      <div className="px-4 -mt-8 relative z-10">
        {/* Analysis Error Alert */}
        {hasAnalysisError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              ¡Hey eso no se come! Parece que no se a detectado ninguna comida
            </AlertDescription>
          </Alert>
        )}

        <FoodNameAndPortion
          foodName={formData.custom_food_name}
          quantity={formData.quantity_consumed}
          onFoodNameChange={(name) => setFormData(prev => ({ ...prev, custom_food_name: name }))}
          onQuantityChange={adjustPortion}
        />

        <CaloriesDisplay calories={formData.calories_consumed} />

        <MacronutrientsGrid
          protein={formData.protein_g_consumed}
          carbs={formData.carbs_g_consumed}
          fat={formData.fat_g_consumed}
          onMacroEdit={setEditingMacro}
        />

        <HealthScoreCard healthScore={formData.healthScore} />

        <IngredientsSection
          ingredients={ingredients}
          showIngredients={showIngredients}
          onToggleShow={() => setShowIngredients(!showIngredients)}
          onIngredientUpdate={handleIngredientUpdate}
        />

        <ActionButtons
          isSaving={isSaving}
          isFormValid={!!formData.custom_food_name.trim()}
          onChangeResults={() => setShowChangeResults(true)}
          onSave={handleSave}
        />
      </div>

      <MacroEditModal
        editingMacro={editingMacro}
        currentValue={editingMacro ? formData[editingMacro as keyof typeof formData] as number : 0}
        onClose={() => setEditingMacro(null)}
        onUpdate={updateMacro}
      />

      <ChangeResultsDialog
        isOpen={showChangeResults}
        onClose={() => setShowChangeResults(false)}
        onSubmit={handleChangeResults}
        foodData={currentFoodData}
      />
    </div>
  );
};

export default FoodEditPage;
