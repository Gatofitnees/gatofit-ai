import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Users, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/Card';
import Avatar from '@/components/Avatar';
import RankBadge from '@/components/RankBadge';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { useUserStats } from '@/hooks/useUserStats';
import { useFollows } from '@/hooks/useFollows';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import PublicRoutinesCarousel from '@/components/PublicRoutinesCarousel';

const PublicProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Usar hook personalizado para perfil público
  const { profile, loading: profileLoading } = usePublicProfile(userId);
  const { stats, loading: statsLoading } = useUserStats(userId);
  const { isFollowing, loading: followLoading, toggleFollow, canFollow } = useFollows(userId);

  const isOwnProfile = user?.id === userId;

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/public-profile/${userId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Perfil de ${profile?.full_name || profile?.username}`,
          url: profileUrl
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(profileUrl);
      toast({
        title: "Enlace copiado",
        description: "El enlace del perfil se copió al portapapeles"
      });
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Cargando perfil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="text-center py-8">
          <p className="text-muted-foreground">Perfil no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <h1 className="text-xl font-bold">Perfil</h1>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="p-2"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Profile Info */}
      <div className="text-center mb-6">
        <Avatar
          name={profile.full_name || profile.username || 'Usuario'}
          size="lg"
          src={profile.avatar_url}
          className="mx-auto mb-4"
        />
        
        <h2 className="text-xl font-bold mb-1">
          {profile.full_name || profile.username || 'Usuario'}
        </h2>
        
        {profile.username && (
          <p className="text-muted-foreground mb-2">@{profile.username}</p>
        )}
        
        <RankBadge level={stats?.current_level || 1} size="lg" />
        
        {profile.bio && (
          <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
            {profile.bio}
          </p>
        )}
      </div>

      {/* Follow Button */}
      {canFollow && (
        <div className="mb-6">
          <Button
            onClick={toggleFollow}
            disabled={followLoading}
            className="w-full"
            variant={isFollowing ? "outline" : "default"}
          >
            {followLoading ? 'Cargando...' : isFollowing ? 'Siguiendo' : 'Seguir'}
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-2xl font-bold">{stats?.total_workouts || 0}</div>
            <div className="text-sm text-muted-foreground">Entrenos</div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-2xl font-bold">{stats?.followers_count || 0}</div>
            <div className="text-sm text-muted-foreground">Seguidores</div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-2xl font-bold">{stats?.following_count || 0}</div>
            <div className="text-sm text-muted-foreground">Siguiendo</div>
          </CardBody>
        </Card>
      </div>

      {/* Workout Hours */}
      <Card className="mb-6">
        <CardBody className="text-center py-4">
          <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold">
            {Math.round((stats?.total_workout_hours || 0) * 10) / 10}h
          </div>
          <div className="text-sm text-muted-foreground">
            Horas totales de entrenamiento
          </div>
        </CardBody>
      </Card>

      {/* Public Routines Section */}
      <Card>
        <CardBody>
          <h3 className="font-semibold mb-4">Rutinas Públicas</h3>
          <PublicRoutinesCarousel userId={userId!} />
        </CardBody>
      </Card>
    </div>
  );
};

export default PublicProfilePage;
