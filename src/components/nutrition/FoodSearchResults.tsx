import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FoodSearchItem from './FoodSearchItem';

interface FoodSearchResult {
  id: string;
  name: string;
  description: string;
  brand?: string;
  nutrition?: {
    calories: number;
    fat: number;
    carbs: number;
    protein: number;
    serving_size: string;
  };
}

interface FoodSearchResultsProps {
  results: FoodSearchResult[];
  isLoading: boolean;
  error: string | null;
  query: string;
  isUsingFallback?: boolean;
}

const FoodSearchResults: React.FC<FoodSearchResultsProps> = ({
  results,
  isLoading,
  error,
  query,
  isUsingFallback = false
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Buscando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error.includes('Missing credentials') ? 
            'Error de configuración de la API. Por favor, intenta de nuevo más tarde.' :
            error.includes('Edge function returned a non-2xx status') ?
            'Error de conexión. Verifica tu conexión a internet e intenta de nuevo.' :
            `Error al buscar alimentos: ${error}`
          }
        </AlertDescription>
      </Alert>
    );
  }

  if (results.length === 0 && query.trim()) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Sin resultados
        </h3>
        <p className="text-sm text-muted-foreground">
          No se encontraron alimentos para "{query}"
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {isUsingFallback && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Mostrando resultados de la base de datos local. La búsqueda completa no está disponible temporalmente.
          </AlertDescription>
        </Alert>
      )}
      
      <p className="text-sm text-muted-foreground mb-4">
        {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
        {isUsingFallback && ' (base de datos local)'}
      </p>
      
      {results.map((food) => (
        <FoodSearchItem
          key={food.id}
          food={food}
        />
      ))}
    </div>
  );
};

export default FoodSearchResults;