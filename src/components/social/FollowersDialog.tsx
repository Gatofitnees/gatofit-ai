
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Avatar from '@/components/Avatar';

interface FollowerUser {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface FollowersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  followers: FollowerUser[];
  title: string;
  isLoading?: boolean;
}

const FollowersDialog: React.FC<FollowersDialogProps> = ({
  open,
  onOpenChange,
  followers,
  title,
  isLoading = false
}) => {
  const navigate = useNavigate();

  const handleUserClick = (userId: string) => {
    navigate(`/public-profile/${userId}`);
    onOpenChange(false);
  };

  const getDisplayName = (user: FollowerUser) => {
    return user.username || user.full_name || `Usuario #${user.id.substring(0, 8)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="max-h-96 overflow-y-auto">
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
              {followers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-muted/20 rounded-lg p-2 -m-2 transition-colors"
                  onClick={() => handleUserClick(user.id)}
                >
                  <Avatar
                    name={getDisplayName(user)}
                    size="sm"
                    src={user.avatar_url}
                  />
                  
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {getDisplayName(user)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersDialog;
