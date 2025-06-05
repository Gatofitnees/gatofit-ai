
import React from 'react';
import { Card, CardBody } from '@/components/Card';
import { PublicProfile } from '@/hooks/usePublicProfile';

interface PublicProfileStreakProps {
  profile: PublicProfile;
}

const PublicProfileStreak: React.FC<PublicProfileStreakProps> = ({ profile }) => {
  return (
    <Card className="mb-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-200/20">
      <CardBody className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🔥</div>
            <span className="text-3xl font-bold text-orange-500">
              {profile.current_streak || 0}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Racha Actual</p>
            <p className="text-xs text-muted-foreground">Días consecutivos</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default PublicProfileStreak;
