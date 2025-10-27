
import React, { useState } from 'react';
import { Flame } from 'lucide-react';
import { Card, CardBody } from '@/components/Card';
import { Button } from '@/components/ui/button';
import RankingList from '@/components/RankingList';
import { useStreaks } from '@/hooks/useStreaks';
import { useRankings, RankingType } from '@/hooks/useRankings';
import { useBranding } from '@/contexts/BrandingContext';
import { Skeleton } from '@/components/ui/skeleton';

const RankingPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<RankingType>('streak');
  const { streakData, isLoading: streakLoading } = useStreaks();
  const { rankings, isLoading: rankingsLoading, fetchRankings } = useRankings(20); // Límite de 20 usuarios
  const { branding, loading: brandingLoading } = useBranding();

  const handleTypeChange = (type: RankingType) => {
    setSelectedType(type);
    fetchRankings(type, 20); // Asegurar límite de 20
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-6">Ranking</h1>
      
      {/* Compact Streak Card with Animated Background */}
      <Card className="mb-6 relative overflow-hidden border-orange-200/20">
        {brandingLoading ? (
          <CardBody className="py-4">
            <Skeleton className="w-full h-20" />
          </CardBody>
        ) : (
          <>
            {/* Animated GIF Background */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${branding.rankingImageUrl}')`
              }}
            />
            
            {/* Content */}
            <CardBody className="py-4 relative z-10">
              <div className="flex flex-col items-start ml-4">
                <div className="flex items-center gap-3 mb-2">
                  <Flame className="h-8 w-8 text-orange-500 drop-shadow-lg filter brightness-125" />
                  <span className="text-3xl font-bold text-orange-500 drop-shadow-lg filter brightness-125">
                    {streakLoading ? '...' : streakData?.current_streak || 0}
                  </span>
                </div>
                <span className="text-lg font-semibold text-orange-400 drop-shadow-lg filter brightness-125">
                  Racha Actual
                </span>
              </div>
            </CardBody>
          </>
        )}
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
                ? 'Top 20 usuarios con las rachas más largas' 
                : 'Top 20 usuarios con más experiencia acumulada'
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
    </div>
  );
};

export default RankingPage;
