
import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { PremiumAvatar } from '@/components/premium/PremiumAvatar';
import RankBadge from './RankBadge';

interface RankingUser {
  user_id: string;
  username: string;
  avatar_url: string;
  current_level: number;
  total_experience: number;
  current_streak: number;
  rank_name: string;
  total_workouts: number;
}

interface RankingListProps {
  users: RankingUser[];
  currentUserId?: string;
}

const RankingList: React.FC<RankingListProps> = ({ users, currentUserId }) => {
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{position}</span>;
    }
  };

  return (
    <div className="space-y-3">
      {users.map((user, index) => {
        const position = index + 1;
        const isCurrentUser = user.user_id === currentUserId;
        
        return (
          <div
            key={user.user_id}
            className={`neu-card p-4 ${
              isCurrentUser ? 'ring-2 ring-primary/50 bg-primary/5' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8">
                  {getPositionIcon(position)}
                </div>
                
                <PremiumAvatar
                  src={user.avatar_url}
                  alt={user.username}
                  fallback={user.username.charAt(0).toUpperCase()}
                  size="md"
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${isCurrentUser ? 'text-primary' : ''}`}>
                      {user.username}
                    </h3>
                    {isCurrentUser && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                        Tú
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>Nivel {user.current_level}</span>
                    <span>•</span>
                    <span>{user.total_experience} XP</span>
                    <span>•</span>
                    <span>{user.current_streak} días</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <RankBadge 
                  rank={user.rank_name}
                  level={user.current_level}
                  size="sm"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {user.total_workouts} entrenamientos
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RankingList;
