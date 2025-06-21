
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody } from '@/components/Card';
import Avatar from '@/components/Avatar';
import { useBatchPremiumCheck } from '@/hooks/useBatchPremiumCheck';

interface FollowerUser {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface FollowersInlineListProps {
  followers: FollowerUser[];
  title: string;
  isLoading?: boolean;
}

const FollowersInlineList: React.FC<FollowersInlineListProps> = ({
  followers,
  title,
  isLoading = false
}) => {
  const navigate = useNavigate();
  
  // Extraer IDs de usuarios para verificación premium
  const userIds = followers.map(user => user.id);
  const { premiumStatuses, isLoading: premiumLoading } = useBatchPremiumCheck(userIds);

  const handleUserClick = (userId: string) => {
    navigate(`/public-profile/${userId}`);
  };

  const getDisplayName = (user: FollowerUser) => {
    return user.username || user.full_name || `Usuario #${user.id.substring(0, 8)}`;
  };

  return (
    <Card>
      <CardBody>
        <h3 className="font-semibold mb-4">{title}</h3>
        
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="w-24 h-3 bg-muted rounded mb-1" />
                  <div className="w-16 h-2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : followers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay usuarios para mostrar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {followers.map((user) => {
              const isPremium = premiumStatuses[user.id] || false;
              
              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-muted/20 rounded-lg p-2 -m-2 transition-all duration-200 hover:scale-[1.02] animate-fade-in"
                  onClick={() => handleUserClick(user.id)}
                >
                  <Avatar
                    name={getDisplayName(user)}
                    size="sm"
                    src={user.avatar_url}
                    isPremium={isPremium}
                  />
                  
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {getDisplayName(user)}
                    </p>
                    {isPremium && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs text-yellow-500 font-medium">Premium</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default FollowersInlineList;
