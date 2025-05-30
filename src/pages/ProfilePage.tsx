
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Settings, Share, Edit3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useUserStats } from '@/hooks/useUserStats';
import { useStreaks } from '@/hooks/useStreaks';
import { Card, CardBody } from '@/components/Card';
import { Button } from '@/components/ui/button';
import Avatar from '@/components/Avatar';
import RankBadge from '@/components/RankBadge';
import ProfileStats from '@/components/ProfileStats';
import { useToast } from '@/hooks/use-toast';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const { stats, isLoading: statsLoading } = useUserStats(user?.id);
  const { streakData } = useStreaks();
  const { toast } = useToast();

  const handleShareProfile = () => {
    if (profile?.username) {
      const profileUrl = `${window.location.origin}/public-profile/${user?.id}`;
      navigator.clipboard.writeText(profileUrl);
      toast({
        title: "Enlace copiado",
        description: "El enlace de tu perfil se ha copiado al portapapeles",
      });
    }
  };

  const handleEditPhoto = () => {
    toast({
      title: "Cambiar foto",
      description: "Función de cámara próximamente disponible",
    });
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <div className="animate-pulse">
          <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4" />
          <div className="w-32 h-6 bg-muted rounded mx-auto mb-2" />
          <div className="w-24 h-4 bg-muted rounded mx-auto mb-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header with action buttons */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Mi Perfil</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareProfile}
            className="p-2"
          >
            <Share className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/settings')}
            className="p-2"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Profile Section */}
      <Card className="mb-6">
        <CardBody className="text-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <Avatar
              name={profile?.full_name || profile?.username || 'Usuario'}
              size="lg"
              src={profile?.avatar_url}
              className="mx-auto"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditPhoto}
              className="absolute -bottom-1 -right-1 rounded-full h-8 w-8 p-0"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>

          {/* User Info */}
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-1">
              {profile?.full_name || 'Sin nombre'}
            </h2>
            <p className="text-muted-foreground mb-2">
              @{profile?.username || 'sin_usuario'}
            </p>
            
            {streakData && (
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">Nivel {streakData.current_level}</span>
                <RankBadge level={streakData.current_level} size="sm" />
              </div>
            )}

            {profile?.bio && (
              <p className="text-sm text-muted-foreground mt-2">{profile.bio}</p>
            )}
          </div>

          {/* Stats */}
          <ProfileStats stats={stats} isLoading={statsLoading} />
        </CardBody>
      </Card>

      {/* Information Section */}
      <Card>
        <CardBody>
          <h3 className="font-semibold mb-4">Información Personal</h3>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => navigate('/profile/body-measurements')}
            >
              <span>Medidas Corporales</span>
              <Edit3 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => navigate('/profile/calendar')}
            >
              <span>Calendario</span>
              <Edit3 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => navigate('/profile/progress')}
            >
              <span>Progreso</span>
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ProfilePage;
