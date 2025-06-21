
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
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: `url('https://storage.googleapis.com/almacenamiento-app-gatofit/Recursos%20Branding%20APP/animaciones/gato%20banner.gif')`
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20" />
      
      {/* Content */}
      <CardBody className="py-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl drop-shadow-sm">🔥</div>
            <span className="text-3xl font-bold text-orange-500 drop-shadow-sm">
              {profile.current_streak || 0}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium drop-shadow-sm">Racha Actual</p>
            <p className="text-xs text-muted-foreground drop-shadow-sm">Días consecutivos</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default PublicProfileStreak;
