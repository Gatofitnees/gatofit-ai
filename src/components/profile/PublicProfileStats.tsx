
import React from 'react';
import { Users, UserPlus, Trophy } from 'lucide-react';
import { Card, CardBody } from '@/components/Card';
import { PublicProfile } from '@/hooks/usePublicProfile';

interface PublicProfileStatsProps {
  profile: PublicProfile;
}

const PublicProfileStats: React.FC<PublicProfileStatsProps> = ({ profile }) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <Card>
        <CardBody className="text-center py-4">
          <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
          <div className="text-2xl font-bold">{profile.followers_count || 0}</div>
          <div className="text-sm text-muted-foreground text-center">Seguidores</div>
        </CardBody>
      </Card>
      
      <Card>
        <CardBody className="text-center py-4">
          <UserPlus className="h-6 w-6 mx-auto mb-2 text-green-500" />
          <div className="text-2xl font-bold">{profile.following_count || 0}</div>
          <div className="text-sm text-muted-foreground text-center">Siguiendo</div>
        </CardBody>
      </Card>
      
      <Card>
        <CardBody className="text-center py-4">
          <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
          <div className="text-2xl font-bold">{profile.total_workouts || 0}</div>
          <div className="text-sm text-muted-foreground text-center">Entrenamientos</div>
        </CardBody>
      </Card>
    </div>
  );
};

export default PublicProfileStats;
