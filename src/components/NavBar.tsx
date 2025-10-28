import React from "react";
import { Home, Dumbbell, Utensils, Users, Flame } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useBranding } from "@/contexts/BrandingContext";

interface NavItem {
  id: string;
  icon: React.FC<{ className?: string }>;
  path: string;
}

const navItems: NavItem[] = [
  {
    id: "home",
    icon: Home,
    path: "/home",
  },
  {
    id: "workout",
    icon: Dumbbell,
    path: "/workout",
  },
  {
    id: "nutrition",
    icon: Utensils,
    path: "/nutrition",
  },
  {
    id: "ranking",
    icon: Flame,
    path: "/ranking",
  },
  {
    id: "social",
    icon: Users,
    path: "/social",
  }
];

const NavBar: React.FC = () => {
  const location = useLocation();
  const { branding } = useBranding();

  // Generar estilos dinámicos para el item activo
  const getActiveStyles = (isActive: boolean) => {
    if (!isActive) return {};
    
    if (branding.hasCoach) {
      return {
        backgroundColor: `${branding.primaryButtonColor}20`,
        color: branding.primaryButtonColor,
        boxShadow: `0 0 10px ${branding.primaryButtonColor}40`
      };
    }
    
    return {};
  };

  const getIconStyles = (isActive: boolean) => {
    if (!isActive) return {};
    
    if (branding.hasCoach) {
      return {
        color: branding.primaryButtonColor,
        filter: `drop-shadow(0 0 3px ${branding.primaryButtonColor}80)`
      };
    }
    
    return {};
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md z-50 p-1 animate-fade-in border-t border-white/5 shadow-neu-float"
      style={{
        paddingBottom: `calc(0.25rem + var(--safe-area-inset-bottom))`,
        paddingLeft: `var(--safe-area-inset-left)`,
        paddingRight: `var(--safe-area-inset-right)`,
      }}
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const activeStyles = getActiveStyles(isActive);
          const iconStyles = getIconStyles(isActive);
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "flex items-center justify-center p-2 rounded-lg transition-all duration-300",
                isActive 
                  ? branding.hasCoach ? "" : "bg-primary/20 text-primary shadow-glow"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              )}
              style={{ 
                width: '50px', 
                height: '50px',
                ...activeStyles,
                ...iconStyles
              }}
            >
              <item.icon 
                className={cn(
                  "h-5 w-5", 
                  isActive && !branding.hasCoach ? "text-primary filter drop-shadow-[0_0_3px_rgba(59,130,246,0.8)]" : ""
                )}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default NavBar;
