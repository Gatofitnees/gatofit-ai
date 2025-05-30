
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Share2, User, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile } from '@/hooks/useProfile';
import { useUserStats } from '@/hooks/useUserStats';
import { useAuth } from '@/contexts/AuthContext';
import ProfileStats from '@/components/profile/ProfileStats';
import AvatarUpload from '@/components/profile/AvatarUpload';
import { useToast } from '@/components/ui/use-toast';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading, updateProfile, checkUsernameAvailability } = useProfile();
  const { stats, loading: statsLoading } = useUserStats(user?.id);
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  const handleUsernameChange = async (value: string) => {
    setUsername(value);
    
    if (value && value !== profile?.username) {
      const available = await checkUsernameAvailability(value);
      setUsernameAvailable(available);
    } else {
      setUsernameAvailable(null);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    if (username && usernameAvailable === false) {
      toast({
        title: "Error",
        description: "El nombre de usuario no está disponible",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    const success = await updateProfile({
      full_name: fullName || null,
      username: username?.toLowerCase() || null
    });

    if (success) {
      // Update local state
      setFullName(fullName);
      setUsername(username);
      setUsernameAvailable(null);
    }
    setSaving(false);
  };

  const handleShare = async () => {
    if (!profile?.username) {
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
          title: `Perfil de ${profile.full_name || profile.username}`,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Cargando perfil...</div>
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

      {/* Avatar Section */}
      <div className="text-center mb-6">
        <AvatarUpload
          currentAvatar={profile?.avatar_url}
          userName={profile?.full_name || profile?.username || 'Usuario'}
          onAvatarUpdate={(newUrl) => updateProfile({ avatar_url: newUrl })}
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
          disabled={saving || usernameAvailable === false}
          className="w-full"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>

      {/* Stats */}
      <ProfileStats stats={stats} loading={statsLoading} />

      {/* Information Section */}
      <div className="mt-6 space-y-3">
        <h3 className="text-lg font-semibold">Información Personal</h3>
        
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => navigate('/profile/body-measurements')}
        >
          <User className="h-5 w-5 mr-3" />
          Medidas Corporales
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
