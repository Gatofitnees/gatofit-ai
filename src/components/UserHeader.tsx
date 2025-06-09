
import React, { useState } from "react";
import Avatar from "./Avatar";
import RankBadge from "./RankBadge";
import ExperienceBar from "./ExperienceBar";
import AIChat from "./AIChat";
import { Settings, LogOut, Globe, CreditCard, RefreshCw, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileContext } from "@/contexts/ProfileContext";
import { useStreaks } from "@/hooks/useStreaks";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { getExperienceProgress } from "@/utils/rankSystem";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";

interface UserHeaderProps {
  username?: string;
  progress?: number;
}

const UserHeader: React.FC<UserHeaderProps> = ({
  progress = 75
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfileContext();
  const { streakData } = useStreaks();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setShowMenu(false);
  };

  const handleProfileClick = () => {
    setShowMenu(false);
    navigate('/profile');
  };

  const handleChangeAccount = async () => {
    try {
      await signOut();
      // Redirect to login with account selector
      window.location.href = '/onboarding/login';
    } catch (error) {
      console.error('Error changing account:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar de cuenta",
        variant: "destructive"
      });
    }
    setShowMenu(false);
  };

  // Get experience progress
  const experienceProgress = streakData ? getExperienceProgress(streakData.total_experience) : null;
  const currentLevel = streakData?.current_level || 1;

  // ONLY use profile data - never fallback to user metadata
  const displayName = profileLoading ? "" : (profile?.full_name || profile?.username || "Usuario");
  const avatarUrl = profileLoading ? "" : profile?.avatar_url;

  // Show loading state while profile is loading
  if (profileLoading) {
    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="ml-4">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-2 w-32" />
          </div>
        </div>
        <AIChat />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => setShowMenu(!showMenu)}
        >
          <Avatar 
            name={displayName} 
            progress={experienceProgress?.progress || progress} 
            size="md"
            src={avatarUrl}
          />
          <div className="ml-4">
            <h1 className="text-xl font-bold">
              ¡Hola, <span className="text-gradient">{displayName}</span>!
            </h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Nivel {currentLevel}</span>
              <span className="text-muted-foreground">•</span>
              <RankBadge level={currentLevel} size="sm" showIcon={false} />
            </div>
            {experienceProgress && (
              <ExperienceBar 
                totalExperience={streakData?.total_experience || 0} 
                className="mt-2 w-32"
              />
            )}
          </div>
        </div>

        <AIChat />
      </div>

      {/* Menú desplegable */}
      {showMenu && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 p-4 neu-card rounded-xl animate-fade-in">
          <div className="mb-4 pb-2 border-b border-muted/30">
            <div className="flex items-center">
              <Avatar 
                name={displayName} 
                progress={experienceProgress?.progress || progress} 
                size="sm" 
                src={avatarUrl}
              />
              <div className="ml-2">
                <p className="font-medium text-sm">{displayName}</p>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-muted-foreground">Nivel {currentLevel}</p>
                  <span className="text-xs text-muted-foreground">•</span>
                  <RankBadge level={currentLevel} size="sm" showIcon={false} />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Peso</p>
                <p className="text-sm font-medium">{profile?.current_weight_kg || '--'} kg</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Altura</p>
                <p className="text-sm font-medium">{profile?.height_cm || '--'} cm</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">% Graso</p>
                <p className="text-sm font-medium">{profile?.body_fat_percentage || '--'}%</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              className="justify-start"
              onClick={handleProfileClick}
            >
              <User className="h-4 w-4 mr-2" />
              Ver perfil
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm" 
              className="justify-start"
              onClick={() => toast({
                title: "Cambiar idioma",
                description: "Función próximamente disponible",
              })}
            >
              <Globe className="h-4 w-4 mr-2" />
              Cambiar idioma
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm" 
              className="justify-start"
              onClick={() => toast({
                title: "Gestionar plan de pago",
                description: "Función próximamente disponible",
              })}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Gestionar plan de pago
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm" 
              className="justify-start"
              onClick={handleChangeAccount}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Cambiar cuenta
            </Button>
            
            <Button 
              variant="destructive" 
              size="sm" 
              className="justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHeader;
