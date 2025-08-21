import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import FoodSearchResults from '@/components/nutrition/FoodSearchResults';
import { useFatSecretSearch } from '@/hooks/useFatSecretSearch';

const FoodSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 500);
  const { searchFoods, results, isLoading, error, isUsingFallback } = useFatSecretSearch();

  useEffect(() => {
    if (debouncedQuery.trim()) {
      searchFoods(debouncedQuery);
    }
  }, [debouncedQuery, searchFoods]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-10">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">Buscar Comidas</h1>
        </div>
        
        {/* Search Input */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar alimentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {!searchQuery.trim() ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Busca alimentos
            </h3>
            <p className="text-sm text-muted-foreground">
              Escribe el nombre de un alimento para encontrar información nutricional
            </p>
          </div>
        ) : (
          <FoodSearchResults
            results={results}
            isLoading={isLoading}
            error={error}
            query={searchQuery}
            isUsingFallback={isUsingFallback}
          />
        )}
      </div>
    </div>
  );
};

export default FoodSearchPage;