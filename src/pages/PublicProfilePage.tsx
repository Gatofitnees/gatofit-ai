
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { useFollows } from '@/hooks/useFollows';
import { useAuth } from '@/contexts/AuthContext';
import { PublicProfileHeader } from '@/components/profile/PublicProfileHeader';
import PublicProfileCard from '@/components/profile/PublicProfileCard';
import PublicProfileStats from '@/components/profile/PublicProfileStats';
import PublicProfileStreak from '@/components/profile/PublicProfileStreak';
import PublicProfileRoutines from '@/components/profile/PublicProfileRoutines';

const PublicProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { profile, isLoading, error } = usePublicProfile(userId);
  const { 
    isFollowing, 
    followUser, 
    unfollowUser, 
    isLoading: followLoading 
  } = useFollows();

  const handleBack = () => {
    navigate(-1);
  };

  const handleFollowToggle = async () => {
    if (!userId) return;
    
    if (isFollowing(userId)) {
      await unfollowUser(userId);
    } else {
      await followUser(userId);
    }
  };

  const isOwnProfile = currentUser?.id === userId;

  console.log('PublicProfilePage render:', { userId, isLoading, error, profile });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <PublicProfileHeader profile={profile || { username: '', full_name: '', bio: '', avatar_url: '' }} />
        
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <PublicProfileHeader profile={profile || { username: '', full_name: '', bio: '', avatar_url: '' }} />
        
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">
            {error || 'No se pudo cargar el perfil'}
          </p>
          <Button variant="outline" onClick={() => navigate('/social')}>
            Volver a Social
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <PublicProfileHeader profile={profile} />

      <PublicProfileCard
        profile={profile}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing(userId!)}
        onFollowToggle={handleFollowToggle}
        followLoading={followLoading}
      />

      <PublicProfileStats profile={profile} />

      <PublicProfileStreak profile={profile} />

      <PublicProfileRoutines userId={userId!} />
    </div>
  );
};

export default PublicProfilePage;
