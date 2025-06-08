
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Share2, User, Calendar, TrendingUp, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfileContext } from '@/contexts/ProfileContext';
import { useUserStats } from '@/hooks/useUserStats';
import { useAuth } from '@/contexts/AuthContext';
import ProfileStats from '@/components/profile/ProfileStats';
import AvatarUpload from '@/components/profile/AvatarUpload';
import BodyMeasurements from '@/components/profile/BodyMeasurements';
import UserInformation from '@/components/profile/UserInformation';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import { useToast } from '@/components/ui/use-toast';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading, updating, updateProfile } = useProfileContext();
  const { stats, loading: statsLoading } = useUserStats(user?.id);
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Update form state when profile loads, with Google data as fallback
  useEffect(() => {
    if (profile || user) {
      // Use profile data first, fall back to Google metadata
      const googleName = user?.user_metadata?.name || user?.user_metadata?.full_name;
      const googleEmail = user?.email?.split('@')[0];
      
      setFullName(profile?.full_name || googleName || '');
      setUsername(profile?.username || googleEmail || '');
    }
  }, [profile, user]);

  const checkUsernameAvailability = async (value: string) => {
    // Esta función debería implementarse en el hook useProfile
    // Por ahora simulamos la validación
    setUsernameAvailable(true);
  };

  const handleUsernameChange = async (value: string) => {
    setUsername(value);
    
    if (value && value !== profile?.username) {
      await checkUsernameAvailability(value);
    } else {
      setUsernameAvailable(null);
    }
  };

  const handleSave = async () => {
    if (!profile && !user) return;

    if (username && usernameAvailable === false) {
      toast({
        title: "Error",
        description: "El nombre de usuario no está disponible",
        variant: "destructive"
      });
      return;
    }

    const success = await updateProfile({
      full_name: fullName || null,
      username: username?.toLowerCase() || null
    });

    if (success) {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  const handleAvatarUpdate = async (newUrl: string) => {
    await updateProfile({ avatar_url: newUrl });
  };

  const handleShare = async () => {
    const profileUsername = profile?.username || username;
    if (!profileUsername) {
      toast({
        title: "Error",
        description: "Necesitas un nombre de usuario para compartir tu perfil",
        variant: "destructive"
      });
      return;
    }

    const profileUrl = `${window.location.origin}/public-profile/${user?.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Perfil de ${profile?.full_name || fullName || profileUsername}`,
          url: profileUrl
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(profileUrl);
      toast({
        title: "Enlace copiado",
        description: "El enlace de tu perfil se copió al portapapeles"
      });
    }
  };

  // Show skeleton while loading
  if (loading) {
    return <ProfileSkeleton />;
  }

  // Use fallback data for display
  const displayName = fullName || profile?.full_name || user?.user_metadata?.name || 'Usuario';
  const displayAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/home')}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <h1 className="text-xl font-bold">Mi Perfil</h1>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="p-2"
            disabled={updating}
          >
            <Share2 className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/settings')}
            className="p-2"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">Cambios guardados correctamente</span>
        </div>
      )}

      {/* Avatar Section */}
      <div className="text-center mb-6">
        <AvatarUpload
          currentAvatar={displayAvatar}
          userName={displayName}
          onAvatarUpdate={handleAvatarUpdate}
        />
      </div>

      {/* Profile Form */}
      <div className="space-y-4 mb-6">
        <div>
          <Label htmlFor="fullName">Nombre completo</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre completo"
            disabled={updating}
          />
        </div>

        <div>
          <Label htmlFor="username">Nombre de usuario</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              @
            </span>
            <Input
              id="username"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="nombreusuario"
              className="pl-8"
              disabled={updating}
            />
          </div>
          {usernameAvailable === false && (
            <p className="text-sm text-destructive mt-1">
              Este nombre de usuario no está disponible
            </p>
          )}
          {usernameAvailable === true && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Nombre de usuario disponible
            </p>
          )}
        </div>

        <Button 
          onClick={handleSave}
          disabled={updating || usernameAvailable === false}
          className="w-full"
        >
          {updating ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>

      {/* Body Measurements Section */}
      <div className="mb-6">
        <BodyMeasurements profile={profile} />
      </div>

      {/* User Information Section */}
      <div className="mb-6">
        <UserInformation profile={profile} />
      </div>

      {/* Stats */}
      <ProfileStats stats={stats} loading={statsLoading} />

      {/* Navigation Buttons */}
      <div className="mt-6 space-y-3">
        <h3 className="text-lg font-semibold">Gestionar Información</h3>
        
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => navigate('/profile/body-measurements')}
        >
          <User className="h-5 w-5 mr-3" />
          Editar Medidas Corporales
        </Button>
        
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => navigate('/profile/user-information')}
        >
          <Info className="h-5 w-5 mr-3" />
          Editar Información del Usuario
        </Button>
        
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => navigate('/profile/calendar')}
        >
          <Calendar className="h-5 w-5 mr-3" />
          Calendario
        </Button>
        
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => navigate('/profile/progress')}
        >
          <TrendingUp className="h-5 w-5 mr-3" />
          Progreso
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
