
import React from 'react';
import { Card, CardBody } from '@/components/Card';
import { PublicProfile } from '@/hooks/usePublicProfile';

interface PublicProfileStreakProps {
  profile: PublicProfile;
}

const PublicProfileStreak: React.FC<PublicProfileStreakProps> = ({ profile }) => {
  return (
    <Card className="mb-6 relative overflow-hidden border-orange-200/20">
      {/* Animated GIF Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://storage.googleapis.com/almacenamiento-app-gatofit/Recursos%20Branding%20APP/animaciones/gato%20banner.gif')`
        }}
      />
      
      {/* Content */}
      <CardBody className="py-4 relative z-10">
        <div className="flex flex-col items-start ml-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl drop-shadow-lg filter brightness-125">🔥</div>
            <span className="text-3xl font-bold text-orange-500 drop-shadow-lg filter brightness-125">
              {profile.current_streak || 0}
            </span>
          </div>
          <span className="text-lg font-semibold text-orange-400 drop-shadow-lg filter brightness-125">
            Racha Actual
          </span>
        </div>
      </CardBody>
    </Card>
  );
};

export default PublicProfileStreak;
