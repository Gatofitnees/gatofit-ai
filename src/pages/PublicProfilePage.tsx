
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, UserPlus, Trophy } from 'lucide-react';
import { Card, CardBody } from '@/components/Card';
import { Button } from '@/components/ui/button';
import Avatar from '@/components/Avatar';
import RankBadge from '@/components/RankBadge';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { useFollows } from '@/hooks/useFollows';
import { useAuth } from '@/contexts/AuthContext';

const PublicProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { profile, isLoading, error, refetch } = usePublicProfile(userId || '');
  const { 
    isFollowing, 
    followUser, 
    unfollowUser, 
    isLoading: followLoading 
  } = useFollows();

  useEffect(() => {
    if (userId) {
      refetch();
    }
  }, [userId, refetch]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Perfil</h1>
        </div>
        
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
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Perfil</h1>
      </div>

      {/* Profile Card */}
      <Card className="mb-6">
        <CardBody className="text-center py-8">
          <Avatar
            name={profile.username || profile.full_name || 'Usuario'}
            size="lg"
            src={profile.avatar_url}
            className="mx-auto mb-4"
          />
          
          <h2 className="text-xl font-bold mb-2">
            {profile.username || profile.full_name || 'Usuario'}
          </h2>
          
          <div className="flex justify-center mb-4">
            <RankBadge 
              level={profile.current_level || 1} 
              size="md"
              showLevelNumber={true}
            />
          </div>
          
          {profile.bio && (
            <p className="text-muted-foreground mb-4 max-w-xs mx-auto">
              {profile.bio}
            </p>
          )}

          {!isOwnProfile && (
            <Button
              onClick={handleFollowToggle}
              disabled={followLoading}
              variant={isFollowing(userId!) ? "outline" : "default"}
              className="w-full max-w-xs"
            >
              {followLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              {isFollowing(userId!) ? 'Dejar de seguir' : 'Seguir'}
            </Button>
          )}
        </CardBody>
      </Card>

      {/* Stats Grid */}
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

      {/* Streak Card */}
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

      {/* Rutinas Públicas - será implementado en el futuro */}
      <Card>
        <CardBody>
          <h3 className="font-semibold mb-4">Rutinas Públicas</h3>
          <div className="text-center py-8 text-muted-foreground">
            <p>Próximamente podrás ver las rutinas públicas de este usuario</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default PublicProfilePage;
