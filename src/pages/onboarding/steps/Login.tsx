
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor ingresa email y contraseña");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { error, data } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        // Successful login
        navigate("/onboarding/app-transition");
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    navigate("/onboarding/create-account");
  };

  return (
    <OnboardingLayout currentStep={19} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-2">Iniciar Sesión</h1>
      
      <p className="text-muted-foreground mb-6">
        Accede a tu cuenta GatofitAI
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
          <div className="flex justify-between">
            <label className="text-sm font-medium">Contraseña</label>
            <button className="text-xs text-primary">¿Olvidaste tu contraseña?</button>
          </div>
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
        </div>
      </div>

      <div className="mt-6 w-full max-w-md mx-auto">
        <OnboardingNavigation 
          onNext={handleLogin}
          nextDisabled={!email || !password}
          nextLabel="Iniciar Sesión"
          loading={loading}
        />
        
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
