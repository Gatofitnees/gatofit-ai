
import React, { useState } from "react";
import { Camera, Plus, Utensils } from "lucide-react";
import { Card, CardHeader, CardBody, CardFooter } from "../components/Card";
import Button from "../components/Button";
import ProgressRing from "../components/ProgressRing";
import MacroProgress from "../components/MacroProgress";
import { FoodScanDialog } from "../components/nutrition/FoodScanDialog";
import { FoodPreviewCard } from "../components/nutrition/FoodPreviewCard";
import { FoodEditDialog } from "../components/nutrition/FoodEditDialog";
import { useFoodLog, FoodLogEntry } from "../hooks/useFoodLog";
import { useFoodAnalysis } from "../hooks/useFoodAnalysis";

const NutritionPage: React.FC = () => {
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [editingEntry, setEditingEntry] = useState<FoodLogEntry | null>(null);
  const [pendingFoodData, setPendingFoodData] = useState<any>(null);

  const { entries, addEntry, updateEntry, isLoading } = useFoodLog();
  const { analyzeFood, isAnalyzing } = useFoodAnalysis();

  // Calculate today's totals from actual entries
  const todayTotals = entries.reduce(
    (totals, entry) => ({
      calories: totals.calories + entry.calories_consumed,
      protein: totals.protein + entry.protein_g_consumed,
      carbs: totals.carbs + entry.carbs_g_consumed,
      fat: totals.fat + entry.fat_g_consumed
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Mock targets - in a real app these would come from user profile
  const macros = {
    calories: { current: todayTotals.calories, target: 2000, unit: "kcal" },
    protein: { current: todayTotals.protein, target: 120 },
    carbs: { current: todayTotals.carbs, target: 200 },
    fats: { current: todayTotals.fat, target: 65 }
  };
  
  const calorieProgress = Math.round((macros.calories.current / macros.calories.target) * 100);

  const handleImageCaptured = async (imageUrl: string) => {
    setCurrentImageUrl(imageUrl);
    
    // Analyze the food image
    const analysis = await analyzeFood(imageUrl);
    if (analysis) {
      setPendingFoodData({
        custom_food_name: analysis.name,
        quantity_consumed: analysis.servingSize,
        unit_consumed: analysis.servingUnit,
        calories_consumed: analysis.calories,
        protein_g_consumed: analysis.protein,
        carbs_g_consumed: analysis.carbs,
        fat_g_consumed: analysis.fat,
        photo_url: imageUrl
      });
      setShowEditDialog(true);
    }
  };

  const handleSaveFood = async (foodData: Partial<FoodLogEntry>) => {
    if (editingEntry) {
      // Update existing entry
      await updateEntry(editingEntry.id!, foodData);
    } else {
      // Add new entry
      await addEntry({
        ...foodData,
        meal_type: 'snack1' // Default meal type
      } as Omit<FoodLogEntry, 'id' | 'logged_at' | 'log_date'>);
    }
    
    // Reset state
    setEditingEntry(null);
    setPendingFoodData(null);
    setCurrentImageUrl("");
  };

  const handleEditEntry = (entry: FoodLogEntry) => {
    setEditingEntry(entry);
    setCurrentImageUrl(entry.photo_url || "");
    setShowEditDialog(true);
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">Nutrición</h1>
      
      {/* Calories Summary */}
      <div className="flex items-center justify-center mb-8 animate-fade-in">
        <div className="relative flex items-center justify-center">
          <ProgressRing progress={calorieProgress} size={130} strokeWidth={8} className="text-primary" />
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-xl font-bold">{macros.calories.current}</span>
            <span className="text-xs text-muted-foreground">/ {macros.calories.target}</span>
            <span className="text-xs mt-1">kcal</span>
          </div>
        </div>
      </div>
      
      {/* Macros Summary */}
      <Card className="mb-6">
        <CardHeader 
          title="Macronutrientes" 
          subtitle="Resumen diario" 
        />
        <CardBody>
          <div className="space-y-4">
            <MacroProgress 
              label="Proteínas" 
              current={macros.protein.current} 
              target={macros.protein.target}
              color="protein" 
            />
            <MacroProgress 
              label="Carbohidratos" 
              current={macros.carbs.current} 
              target={macros.carbs.target}
              color="carbs" 
            />
            <MacroProgress 
              label="Grasas" 
              current={macros.fats.current} 
              target={macros.fats.target}
              color="fat" 
            />
          </div>
        </CardBody>
      </Card>
      
      {/* Meals */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Comidas de Hoy</h2>
          <Button 
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowScanDialog(true)}
          >
            Añadir
          </Button>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground mt-2">Cargando comidas...</p>
            </div>
          ) : entries.length > 0 ? (
            entries.map((entry) => (
              <FoodPreviewCard
                key={entry.id}
                imageUrl={entry.photo_url || "/placeholder.svg"}
                name={entry.custom_food_name}
                calories={entry.calories_consumed}
                protein={entry.protein_g_consumed}
                carbs={entry.carbs_g_consumed}
                fat={entry.fat_g_consumed}
                loggedAt={entry.logged_at}
                onClick={() => handleEditEntry(entry)}
              />
            ))
          ) : (
            <Card>
              <CardBody>
                <div className="text-center py-8">
                  <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No has registrado comidas hoy
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Usa el botón de cámara para empezar
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
      
      {/* Add Food Button */}
      <div className="fixed bottom-24 right-4 animate-fade-in">
        <Button 
          className="h-14 w-14 rounded-full shadow-neu-button"
          leftIcon={<Camera className="h-6 w-6" />}
          variant="primary"
          onClick={() => setShowScanDialog(true)}
        />
      </div>

      {/* Dialogs */}
      <FoodScanDialog
        isOpen={showScanDialog}
        onClose={() => setShowScanDialog(false)}
        onImageCaptured={handleImageCaptured}
      />

      <FoodEditDialog
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditingEntry(null);
          setPendingFoodData(null);
          setCurrentImageUrl("");
        }}
        onSave={handleSaveFood}
        initialData={editingEntry || pendingFoodData}
        imageUrl={currentImageUrl}
      />

      {/* Loading overlay for analysis */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="neu-card p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
            <p className="text-sm font-medium">Analizando alimento...</p>
            <p className="text-xs text-muted-foreground mt-1">Esto puede tomar unos segundos</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionPage;
