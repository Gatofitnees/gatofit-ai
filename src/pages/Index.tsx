
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, redirect to home
        navigate("/home", { replace: true });
      } else {
        // User is not authenticated, redirect to onboarding
        navigate("/onboarding/welcome", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <h1 className="text-2xl font-semibold mb-2">Cargando...</h1>
          <p className="text-gray-600">Verificando tu sesión</p>
        </div>
      </div>
    );
  }

  // This should rarely be seen since we redirect immediately
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Redirigiendo...</h1>
      </div>
    </div>
  );
};

export default Index;
