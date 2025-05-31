
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import RankBadge from './RankBadge';
import { RankingUser } from '@/hooks/useRankings';

interface RankingListProps {
  users: RankingUser[];
  type: 'streak' | 'experience';
  isLoading: boolean;
}

const RankingList: React.FC<RankingListProps> = ({ users, type, isLoading }) => {
  const navigate = useNavigate();

  const handleUserClick = (userId: string) => {
    navigate(`/public-profile/${userId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded-full" />
              <div className="space-y-1">
                <div className="w-20 h-3 bg-muted rounded" />
                <div className="w-16 h-2 bg-muted rounded" />
              </div>
            </div>
            <div className="w-12 h-4 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No hay usuarios en la clasificación aún</p>
        <p className="text-xs mt-2">Los rankings se actualizan cuando los usuarios completan entrenamientos o registran comidas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user, index) => (
        <div 
          key={user.user_id} 
          className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
          onClick={() => handleUserClick(user.user_id)}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 min-w-[24px]">
              <span className="text-sm font-bold text-muted-foreground">
                #{index + 1}
              </span>
            </div>
            
            <Avatar
              name={user.username || 'Usuario'}
              size="sm"
              src={user.avatar_url}
            />
            
            <div>
              <p className="font-medium text-sm">
                {user.username || `Usuario #${user.user_id.substring(0, 8)}`}
              </p>
              <RankBadge level={user.current_level} size="sm" />
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-bold text-primary">
              {type === 'streak' ? user.current_streak : user.total_experience}
            </div>
            <div className="text-xs text-muted-foreground">
              {type === 'streak' ? 'días' : 'XP'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RankingList;
