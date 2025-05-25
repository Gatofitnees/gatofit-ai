
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Flame, Plus, Minus, Zap, Wheat, Droplet, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Button from '@/components/Button';
import { cn } from '@/lib/utils';
import { FoodLogEntry, useFoodLog } from '@/hooks/useFoodLog';

interface FoodEditPageProps {
  onSave?: (entry: Partial<FoodLogEntry>) => void;
}

export const FoodEditPage: React.FC<FoodEditPageProps> = ({ onSave }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { initialData, imageUrl, isEditing } = location.state || {};
  const { addEntry, updateEntry } = useFoodLog();

  const [formData, setFormData] = useState({
    custom_food_name: '',
    quantity_consumed: 1,
    unit_consumed: 'porción',
    calories_consumed: 0,
    protein_g_consumed: 0,
    carbs_g_consumed: 0,
    fat_g_consumed: 0,
    healthScore: 7,
    notes: ''
  });

  const [editingMacro, setEditingMacro] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        custom_food_name: initialData.custom_food_name || '',
        quantity_consumed: initialData.quantity_consumed || 1,
        unit_consumed: initialData.unit_consumed || 'porción',
        calories_consumed: initialData.calories_consumed || 0,
        protein_g_consumed: initialData.protein_g_consumed || 0,
        carbs_g_consumed: initialData.carbs_g_consumed || 0,
        fat_g_consumed: initialData.fat_g_consumed || 0,
        healthScore: 7,
        notes: initialData.notes || ''
      });
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

  const getHealthScoreColor = (score: number) => {
    if (score >= 7) return 'bg-green-400';
    if (score >= 4) return 'bg-orange-400';
    return 'bg-red-400';
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
        notes: formData.notes,
        meal_type: 'snack1' as const
      };

      if (imageUrl) {
        saveData.photo_url = imageUrl;
      }

      let success = false;
      
      if (isEditing && initialData?.id) {
        // Update existing entry
        success = await updateEntry(initialData.id, saveData);
      } else {
        // Create new entry
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
    setEditingMacro(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Image */}
      <div className="relative h-64 bg-gradient-to-b from-primary/20 to-background">
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt="Food"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Back Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/nutrition')}
          className="absolute top-6 left-4 h-10 w-10 rounded-full p-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="px-4 -mt-8 relative z-10">
        {/* Food Name and Portion Controls */}
        <div className="neu-card p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 mr-4">
              <Input
                value={formData.custom_food_name}
                onChange={(e) => setFormData(prev => ({ ...prev, custom_food_name: e.target.value }))}
                placeholder="Nombre del alimento"
                className="text-lg font-medium border-none p-0 bg-transparent"
              />
            </div>
            
            {/* Portion Controls */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => adjustPortion(-0.5)}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <span className="text-sm font-medium min-w-[60px] text-center">
                {formData.quantity_consumed} {formData.unit_consumed}
              </span>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => adjustPortion(0.5)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Calories Card */}
        <div className="neu-card p-6 mb-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Flame className="h-8 w-8 text-orange-400" />
            <span className="text-3xl font-bold">{formData.calories_consumed}</span>
            <span className="text-lg text-muted-foreground">kcal</span>
          </div>
          <p className="text-sm text-muted-foreground">Calorías totales</p>
        </div>

        {/* Macronutrients Row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div 
            className="neu-card p-4 text-center cursor-pointer hover:bg-secondary/10 transition-colors"
            onClick={() => setEditingMacro('protein_g')}
          >
            <Zap className="h-5 w-5 text-blue-400 mx-auto mb-2" />
            <div className="text-lg font-bold">{formData.protein_g_consumed}g</div>
            <div className="text-xs text-muted-foreground">Proteína</div>
          </div>
          
          <div 
            className="neu-card p-4 text-center cursor-pointer hover:bg-secondary/10 transition-colors"
            onClick={() => setEditingMacro('carbs_g')}
          >
            <Wheat className="h-5 w-5 text-green-400 mx-auto mb-2" />
            <div className="text-lg font-bold">{formData.carbs_g_consumed}g</div>
            <div className="text-xs text-muted-foreground">Carbos</div>
          </div>
          
          <div 
            className="neu-card p-4 text-center cursor-pointer hover:bg-secondary/10 transition-colors"
            onClick={() => setEditingMacro('fat_g')}
          >
            <Droplet className="h-5 w-5 text-yellow-400 mx-auto mb-2" />
            <div className="text-lg font-bold">{formData.fat_g_consumed}g</div>
            <div className="text-xs text-muted-foreground">Grasas</div>
          </div>
        </div>

        {/* Health Score */}
        <div className="neu-card p-4 mb-4">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-red-400" />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Puntaje de salud</span>
                <span className="text-sm font-bold">{formData.healthScore}/10</span>
              </div>
              <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-300 rounded-full",
                    getHealthScoreColor(formData.healthScore)
                  )}
                  style={{ width: `${(formData.healthScore / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="neu-card p-4 mb-6">
          <label className="text-sm font-medium mb-2 block">Notas</label>
          <Input
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Agregar notas..."
            className="border-none bg-transparent p-0"
          />
        </div>

        {/* Save Button */}
        <Button
          variant="primary"
          fullWidth
          onClick={handleSave}
          className="mb-8"
          disabled={isSaving || !formData.custom_food_name.trim()}
        >
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>

      {/* Macro Editing Modal */}
      {editingMacro && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="neu-card p-6 w-full max-w-sm">
            <h3 className="text-lg font-medium mb-4">
              Editar {editingMacro === 'protein_g' ? 'Proteína' : editingMacro === 'carbs_g' ? 'Carbohidratos' : 'Grasas'}
            </h3>
            <Input
              type="number"
              defaultValue={formData[editingMacro as keyof typeof formData] as number}
              onChange={(e) => updateMacro(editingMacro.replace('_consumed', ''), Number(e.target.value))}
              className="mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingMacro(null)} className="flex-1">
                Cancelar
              </Button>
              <Button variant="primary" onClick={() => setEditingMacro(null)} className="flex-1">
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodEditPage;
