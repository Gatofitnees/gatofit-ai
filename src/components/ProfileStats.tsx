
import React from 'react';
import { UserStats } from '@/hooks/useUserStats';

interface ProfileStatsProps {
  stats: UserStats | null;
  isLoading: boolean;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-around py-4 border-y border-muted/20">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="text-center">
            <div className="w-8 h-6 bg-muted animate-pulse rounded mb-1" />
            <div className="w-16 h-4 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex justify-around py-4 border-y border-muted/20">
      <div className="text-center">
        <p className="text-2xl font-bold text-primary">
          {stats?.total_workouts || 0}
        </p>
        <p className="text-sm text-muted-foreground">Entrenos</p>
      </div>
      
      <div className="text-center">
        <p className="text-2xl font-bold text-primary">
          {stats?.followers_count || 0}
        </p>
        <p className="text-sm text-muted-foreground">Seguidores</p>
      </div>
      
      <div className="text-center">
        <p className="text-2xl font-bold text-primary">
          {stats?.following_count || 0}
        </p>
        <p className="text-sm text-muted-foreground">Siguiendo</p>
      </div>
    </div>
  );
};

export default ProfileStats;
