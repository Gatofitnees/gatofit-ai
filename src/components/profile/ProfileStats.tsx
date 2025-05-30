
import React from 'react';
import { UserStats } from '@/hooks/useUserStats';

interface ProfileStatsProps {
  stats: UserStats | null;
  loading?: boolean;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4 p-4 neu-card rounded-xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center animate-pulse">
            <div className="h-6 bg-muted/30 rounded mb-1"></div>
            <div className="h-4 bg-muted/20 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 p-4 neu-card rounded-xl">
      <div className="text-center">
        <p className="text-lg font-bold text-primary">
          {stats?.total_workouts || 0}
        </p>
        <p className="text-xs text-muted-foreground">Entrenamientos</p>
      </div>
      
      <div className="text-center">
        <p className="text-lg font-bold text-primary">
          {stats?.followers_count || 0}
        </p>
        <p className="text-xs text-muted-foreground">Seguidores</p>
      </div>
      
      <div className="text-center">
        <p className="text-lg font-bold text-primary">
          {stats?.following_count || 0}
        </p>
        <p className="text-xs text-muted-foreground">Siguiendo</p>
      </div>
    </div>
  );
};

export default ProfileStats;
