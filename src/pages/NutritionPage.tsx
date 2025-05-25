import React, { useState } from "react";
import { Camera, Plus, Utensils } from "lucide-react";
import { Card, CardHeader, CardBody } from "../components/Card";
import Button from "../components/Button";
import ProgressRing from "../components/ProgressRing";
import MacroProgress from "../components/MacroProgress";
import { CameraCapture } from "../components/nutrition/CameraCapture";
import { FoodPreviewCard } from "../components/nutrition/FoodPreviewCard";
import { useFoodLog, FoodLogEntry } from "../hooks/useFoodLog";
import { useFoodAnalysis } from "../hooks/useFoodAnalysis";
import { useFoodCapture } from "../hooks/useFoodCapture";
import { useNavigate } from "react-router-dom";

const NutritionPage: React.FC = () => {
  const [showCamera, setShowCamera] = useState(false);
  const navigate = useNavigate();

  const { entries, addEntry, deleteEntry, isLoading } = useFoodLog();
  const { analyzeFood, isAnalyzing } = useFoodAnalysis();
  const { captureFromCamera } = useFoodCapture();

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
    // Analyze the food image
    const analysis = await analyzeFood(imageUrl);
    if (analysis) {
      const pendingFoodData = {
        custom_food_name: analysis.name,
        quantity_consumed: analysis.servingSize,
        unit_consumed: analysis.servingUnit,
        calories_consumed: analysis.calories,
        protein_g_consumed: analysis.protein,
        carbs_g_consumed: analysis.carbs,
        fat_g_consumed: analysis.fat,
        photo_url: imageUrl
      };
      
      // Navigate to the full-screen edit page
      navigate('/food-edit', {
        state: {
          initialData: pendingFoodData,
          imageUrl: imageUrl,
          isEditing: false
        }
      });
    }
  };

  const handleCameraCapture = async () => {
    const result = await captureFromCamera();
    if (result) {
      await handleImageCaptured(result.imageUrl);
    }
  };

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
            onClick={handleCameraCapture}
          >
            Añadir
          </Button>
        </div>
        
        <div className="space-y-3">
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
                onDelete={() => handleDeleteEntry(entry.id!)}
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
          onClick={handleCameraCapture}
        />
      </div>

      {/* Camera Capture */}
      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onImageCaptured={handleImageCaptured}
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
