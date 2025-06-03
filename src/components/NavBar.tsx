
import React from "react";
import { Home, Dumbbell, Utensils, Users, Flame } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md z-50 p-1 animate-fade-in border-t border-white/5 shadow-neu-float">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "flex items-center justify-center p-2 rounded-lg transition-all duration-300",
                isActive 
                  ? "bg-primary/20 text-primary shadow-glow" 
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              )}
              style={{ width: '50px', height: '50px' }}
            >
              <item.icon className={cn(
                "h-5 w-5", 
                isActive ? "text-primary filter drop-shadow-[0_0_3px_rgba(59,130,246,0.8)]" : ""
              )} />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default NavBar;
