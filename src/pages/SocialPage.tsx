
import React, { useState } from 'react';
import { Card, CardBody } from '@/components/Card';
import { useProfile } from '@/hooks/useProfile';
import { useRankings } from '@/hooks/useRankings';
import { useNavigate } from 'react-router-dom';
import FollowersDialog from '@/components/social/FollowersDialog';
import { useFollowersList } from '@/hooks/useFollowersList';
import { useAuth } from '@/contexts/AuthContext';

const SocialPage: React.FC = () => {
  const { profile } = useProfile();
  const { rankings, loading } = useRankings();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showFollowersDialog, setShowFollowersDialog] = useState(false);
  const [showFollowingDialog, setShowFollowingDialog] = useState(false);
  const { followers, following, isLoading: followersLoading } = useFollowersList(user?.id);

  const handleUserClick = (userId: string) => {
    navigate(`/public-profile/${userId}`);
  };

  const handleShowFollowers = () => {
    setShowFollowersDialog(true);
  };

  const handleShowFollowing = () => {
    setShowFollowingDialog(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Social</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Social</h1>
      
      {/* User Stats */}
      {profile && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <div 
              className="cursor-pointer"
              onClick={handleShowFollowers}
            >
              <CardBody className="text-center py-4">
                <div className="text-2xl font-bold">{profile.followers_count || 0}</div>
                <div className="text-xs text-muted-foreground">Seguidores</div>
              </CardBody>
            </div>
          </Card>
          
          <Card>
            <div 
              className="cursor-pointer"
              onClick={handleShowFollowing}
            >
              <CardBody className="text-center py-4">
                <div className="text-2xl font-bold">{profile.following_count || 0}</div>
                <div className="text-xs text-muted-foreground">Siguiendo</div>
              </CardBody>
            </div>
          </Card>
        </div>
      )}
      
      {/* Rankings */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Ranking de usuarios</h2>
        
        {rankings.map((user, index) => (
          <Card 
            key={user.user_id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleUserClick(user.user_id)}
          >
            <CardBody className="flex items-center gap-4 py-4">
              <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-bold">
                #{index + 1}
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium">{user.username}</h3>
                <p className="text-sm text-muted-foreground">
                  Nivel {user.level || 1} • {user.total_workouts} entrenamientos
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-primary">
                  Nv. {user.level || 1}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user.experience_points} XP
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Followers Dialog */}
      <FollowersDialog
        isOpen={showFollowersDialog}
        onClose={() => setShowFollowersDialog(false)}
        followers={followers}
        isLoading={followersLoading}
        title="Seguidores"
      />

      {/* Following Dialog */}
      <FollowersDialog
        isOpen={showFollowingDialog}
        onClose={() => setShowFollowingDialog(false)}
        followers={following}
        isLoading={followersLoading}
        title="Siguiendo"
      />
    </div>
  );
};

export default SocialPage;
