
import React from 'react';
import { PremiumAvatar } from '@/components/premium/PremiumAvatar';

interface PublicProfileHeaderProps {
  profile: {
    username?: string;
    full_name?: string;
    bio?: string;
    avatar_url?: string;
  };
}

export const PublicProfileHeader: React.FC<PublicProfileHeaderProps> = ({ profile }) => {
  return (
    <div className="text-center space-y-4 mb-6">
      <PremiumAvatar
        src={profile.avatar_url || undefined}
        alt={profile.username || profile.full_name || 'Usuario'}
        fallback={profile.username?.charAt(0).toUpperCase() || profile.full_name?.charAt(0).toUpperCase() || 'U'}
        size="xl"
        className="mx-auto"
      />
      
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">
          {profile.username || profile.full_name || 'Usuario'}
        </h1>
        
        {profile.bio && (
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            {profile.bio}
          </p>
        )}
      </div>
    </div>
  );
};
