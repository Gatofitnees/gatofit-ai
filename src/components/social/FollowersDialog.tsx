
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Avatar from '@/components/Avatar';
import { Button } from '@/components/ui/button';
import { useFollows } from '@/hooks/useFollows';
import { useAuth } from '@/contexts/AuthContext';

interface FollowerUser {
  user_id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface FollowersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  followers: FollowerUser[];
  isLoading: boolean;
  title: string;
}

const FollowersDialog: React.FC<FollowersDialogProps> = ({
  isOpen,
  onClose,
  followers,
  isLoading,
  title
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFollowing, followUser, unfollowUser, isLoading: followLoading } = useFollows();

  const handleUserClick = (userId: string) => {
    navigate(`/public-profile/${userId}`);
    onClose();
  };

  const handleFollowToggle = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isFollowing(userId)) {
      await unfollowUser(userId);
    } else {
      await followUser(userId);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        {followers.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            {title === 'Seguidores' ? 'No hay seguidores aún' : 'No sigue a nadie aún'}
          </p>
        ) : (
          <div className="space-y-3">
            {followers.map((follower) => (
              <div 
                key={follower.user_id} 
                className="flex items-center gap-3 cursor-pointer hover:bg-muted/20 rounded-lg p-2 -m-2"
                onClick={() => handleUserClick(follower.user_id)}
              >
                <Avatar
                  name={follower.username}
                  size="sm"
                  src={follower.avatar_url}
                />
                
                <div className="flex-1">
                  <p className="font-medium text-sm">{follower.username}</p>
                  {follower.full_name && (
                    <p className="text-xs text-muted-foreground">{follower.full_name}</p>
                  )}
                </div>

                {user && user.id !== follower.user_id && (
                  <Button
                    size="sm"
                    variant={isFollowing(follower.user_id) ? "outline" : "default"}
                    onClick={(e) => handleFollowToggle(follower.user_id, e)}
                    disabled={followLoading}
                    className="text-xs"
                  >
                    {isFollowing(follower.user_id) ? 'Siguiendo' : 'Seguir'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FollowersDialog;
