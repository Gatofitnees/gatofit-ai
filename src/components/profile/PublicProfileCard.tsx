
import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { Card, CardBody } from '@/components/Card';
import { Button } from '@/components/ui/button';
import Avatar from '@/components/Avatar';
import RankBadge from '@/components/RankBadge';
import { PublicProfile } from '@/hooks/usePublicProfile';
import { useSubscriptionCache } from '@/hooks/subscription/useSubscriptionCache';

interface PublicProfileCardProps {
  profile: PublicProfile;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onFollowToggle: () => void;
  followLoading: boolean;
}

const PublicProfileCard: React.FC<PublicProfileCardProps> = ({
  profile,
  isOwnProfile,
  isFollowing,
  onFollowToggle,
  followLoading
}) => {
  const { checkUserPremiumStatus } = useSubscriptionCache();
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const displayName = profile.username || profile.full_name || 'Usuario';
  
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!checkUserPremiumStatus) return;
      
      try {
        const premiumStatus = await checkUserPremiumStatus(profile.id);
        setIsPremiumUser(premiumStatus);
      } catch (error) {
        console.error('Error checking premium status:', error);
        setIsPremiumUser(false);
      }
    };

    checkPremiumStatus();
  }, [profile.id, checkUserPremiumStatus]);
  
  console.log('PublicProfileCard Debug:', {
    profileId: profile.id,
    username: profile.username,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    displayName,
    isPremiumUser
  });

  return (
    <Card className="mb-6">
      <CardBody className="text-center py-8">
        <Avatar
          name={displayName}
          size="lg"
          src={profile.avatar_url || undefined}
          className="mx-auto mb-4"
          isPremium={isPremiumUser}
        />
        
        <h2 className="text-xl font-bold mb-2">
          {displayName}
        </h2>
        
        <div className="flex justify-center mb-4">
          <RankBadge 
            level={profile.current_level || 1} 
            size="md"
            showLevelWithRank={true}
          />
        </div>
        
        {profile.bio && (
          <p className="text-muted-foreground mb-4 max-w-xs mx-auto">
            {profile.bio}
          </p>
        )}

        {!isOwnProfile && (
          <Button
            onClick={onFollowToggle}
            disabled={followLoading}
            variant={isFollowing ? "outline" : "default"}
            className="w-full max-w-xs"
          >
            {followLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            {isFollowing ? 'Dejar de seguir' : 'Seguir'}
          </Button>
        )}
      </CardBody>
    </Card>
  );
};

export default PublicProfileCard;
