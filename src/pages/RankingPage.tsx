
import React, { useState } from 'react';
import { Flame } from 'lucide-react';
import { Card, CardBody } from '@/components/Card';
import { Button } from '@/components/ui/button';
import RankingList from '@/components/RankingList';
import { useStreaks } from '@/hooks/useStreaks';
import { useRankings, RankingType } from '@/hooks/useRankings';

const RankingPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<RankingType>('streak');
  const { streakData, isLoading: streakLoading } = useStreaks();
  const { rankings, isLoading: rankingsLoading, fetchRankings } = useRankings();

  const handleTypeChange = (type: RankingType) => {
    setSelectedType(type);
    fetchRankings(type);
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">Ranking</h1>
      
      {/* Compact Streak Card */}
      <Card className="mb-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-200/20">
        <CardBody className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className="h-8 w-8 text-orange-500" />
              <span className="text-3xl font-bold text-orange-500">
                {streakLoading ? '...' : streakData?.current_streak || 0}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Racha Actual</p>
              <p className="text-xs text-muted-foreground">Días consecutivos</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Classification Selector */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={selectedType === 'streak' ? 'default' : 'outline'}
          onClick={() => handleTypeChange('streak')}
          className="flex-1"
          size="sm"
        >
          <Flame className="h-4 w-4 mr-2" />
          Rachas
        </Button>
        <Button
          variant={selectedType === 'experience' ? 'default' : 'outline'}
          onClick={() => handleTypeChange('experience')}
          className="flex-1"
          size="sm"
        >
          ⭐ Experiencia
        </Button>
      </div>

      {/* Rankings List */}
      <Card>
        <CardBody>
          <div className="mb-4">
            <h3 className="font-semibold">
              {selectedType === 'streak' ? 'Mejores Rachas' : 'Mayor Experiencia'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedType === 'streak' 
                ? 'Usuarios con las rachas más largas' 
                : 'Usuarios con más experiencia acumulada'
              }
            </p>
          </div>
          
          <RankingList 
            users={rankings}
            type={selectedType}
            isLoading={rankingsLoading}
          />
        </CardBody>
      </Card>

      {/* How it Works */}
      <Card className="mt-6">
        <CardBody>
          <h3 className="font-semibold mb-4">¿Cómo funciona?</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-500 text-sm font-bold">25</span>
              </div>
              <div>
                <p className="text-sm font-medium">Completa un entrenamiento</p>
                <p className="text-xs text-muted-foreground">
                  Obtén 25 XP por entrenamiento (máximo 1 al día)
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-500 text-sm font-bold">10</span>
              </div>
              <div>
                <p className="text-sm font-medium">Registra una comida</p>
                <p className="text-xs text-muted-foreground">
                  Obtén 10 XP por comida (máximo 3 al día = 30 XP)
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-500 text-sm font-bold">⚡</span>
              </div>
              <div>
                <p className="text-sm font-medium">Sube de nivel</p>
                <p className="text-xs text-muted-foreground">
                  Cada 100 XP subes un nivel y desbloqueas nuevos rangos
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default RankingPage;
