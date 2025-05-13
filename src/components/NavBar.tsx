
import React from "react";
import { Home, Dumbbell, Utensils } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  path: string;
}

const navItems: NavItem[] = [
  {
    id: "home",
    label: "Inicio",
    icon: Home,
    path: "/",
  },
  {
    id: "workout",
    label: "Entrenamiento",
    icon: Dumbbell,
    path: "/workout",
  },
  {
    id: "nutrition",
    label: "Nutrición",
    icon: Utensils,
    path: "/nutrition",
  },
];

const NavBar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-blur z-50 px-4 py-2 animate-fade-in">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-300 relative",
                isActive ? "neu-button-active" : "neu-button"
              )}
              style={{ minWidth: "80px" }}
            >
              <item.icon className={cn("h-5 w-5 mb-1", isActive ? "text-white" : "text-gray-400")} />
              <span className={cn("text-xs font-medium", isActive ? "text-white" : "text-gray-400")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default NavBar;
