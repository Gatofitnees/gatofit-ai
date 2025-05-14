
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor ingresa tu email y contraseña");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { error, data } = await signIn(email, password);
      
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Email o contraseña incorrectos");
        } else if (error.message.includes("rate limit exceeded")) {
          setError("Has alcanzado el límite de intentos. Intenta de nuevo más tarde o utiliza Google para iniciar sesión.");
        } else {
          setError(error.message);
        }
      } else {
        // Successful login
        toast({
          title: "¡Bienvenido de nuevo!",
          description: "Has iniciado sesión exitosamente",
          variant: "success",
        });
        navigate("/onboarding/app-transition");
      }
    } catch (err: any) {
      setError(err.message || "Error iniciando sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        setError("Error al iniciar sesión con Google: " + error.message);
        setGoogleLoading(false);
      }
      // The redirect to Google's auth page will happen automatically
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión con Google");
      setGoogleLoading(false);
    }
  };

  const handleCreateAccount = () => {
    navigate("/onboarding/create-account");
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    toast({
      title: "Recuperación de contraseña",
      description: "Próximamente disponible",
    });
  };

  return (
    <OnboardingLayout currentStep={18} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-2">
        Inicia sesión en <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 animate-gradient">GatofitAI</span>
      </h1>
      
      <p className="text-muted-foreground mb-6">
        Continúa tu viaje fitness
      </p>

      <div className="space-y-4 w-full max-w-md mx-auto">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}

        <Button 
          variant="outline" 
          className="w-full py-6 h-auto flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
          ) : (
            <>
              <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Continuar con Google</span>
            </>
          )}
        </Button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-4 text-xs text-muted-foreground">o con tu email</span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <div className="relative">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
              className="neu-input pl-10"
              disabled={loading}
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium">Contraseña</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              className="neu-input pl-10"
              disabled={loading}
            />
            <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          <div className="flex justify-end">
            <button 
              onClick={handleForgotPassword}
              className="text-xs text-primary"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 w-full max-w-md mx-auto">
        <Button
          className="w-full py-6 h-auto flex items-center justify-center space-x-2"
          onClick={handleLogin}
          disabled={loading || !email || !password}
        >
          {loading ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : "Iniciar Sesión"}
        </Button>
        
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta? <button onClick={handleCreateAccount} className="text-primary">Crear cuenta</button>
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default Login;
