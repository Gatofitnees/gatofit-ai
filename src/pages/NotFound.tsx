
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Button from "../components/Button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md w-full neu-card p-8">
        <h1 className="text-4xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl mb-6">Página no encontrada</p>
        <p className="text-muted-foreground mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Link to="/">
          <Button 
            variant="primary"
            fullWidth
            leftIcon={<Home className="h-5 w-5" />}
          >
            Volver al Inicio
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
