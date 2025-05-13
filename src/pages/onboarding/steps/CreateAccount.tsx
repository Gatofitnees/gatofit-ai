
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { OnboardingContext } from "../OnboardingFlow";

const CreateAccount: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const context = useContext(OnboardingContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!context) {
    throw new Error("CreateAccount must be used within OnboardingContext");
  }

  const validateForm = () => {
    if (!email) return "Por favor ingresa tu email";
    if (!/\S+@\S+\.\S+/.test(email)) return "Por favor ingresa un email válido";
    if (!password) return "Por favor ingresa una contraseña";
    if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
    if (password !== confirmPassword) return "Las contraseñas no coinciden";
    if (!agreedToTerms) return "Debes aceptar los términos y condiciones";
    return null;
  };

  const handleCreateAccount = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { error, data } = await signUp(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        // Successful signup
        navigate("/onboarding/app-transition");
      }
    } catch (err: any) {
      setError(err.message || "Error creando la cuenta");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigate("/onboarding/login");
  };

  return (
    <OnboardingLayout currentStep={18} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-2">Crea tu Cuenta GatofitAI</h1>
      
      <p className="text-muted-foreground mb-6">
        Un paso más para comenzar tu viaje fitness
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
          <label className="text-sm font-medium">Contraseña</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña (mín. 6 caracteres)"
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
        
        <div className="space-y-1">
          <label className="text-sm font-medium">Confirmar Contraseña</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              className="neu-input pl-10"
              disabled={loading}
            />
            <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="terms" 
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
            disabled={loading}
          />
          <label
            htmlFor="terms"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Acepto los <span className="text-primary">Términos y Condiciones</span> y la <span className="text-primary">Política de Privacidad</span>
          </label>
        </div>
      </div>

      <div className="mt-6 w-full max-w-md mx-auto">
        <OnboardingNavigation 
          onNext={handleCreateAccount}
          nextDisabled={!email || !password || !confirmPassword || !agreedToTerms}
          nextLabel="Crear Mi Cuenta"
          loading={loading}
        />
        
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta? <button onClick={handleLogin} className="text-primary">Iniciar sesión</button>
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default CreateAccount;
