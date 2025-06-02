
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { useAuth } from "@/contexts/AuthContext";
import { OnboardingContext } from "../OnboardingFlow";
import { useOnboardingPersistence } from "@/hooks/useOnboardingPersistence";
import { toast } from "@/hooks/use-toast";
import GatofitAILogo from "@/components/GatofitAILogo";
import AccountForm from "@/components/onboarding/auth/AccountForm";
import AuthButtons from "@/components/onboarding/auth/AuthButtons";
import BackButton from "@/components/onboarding/auth/BackButton";
import useAuthForm from "@/hooks/useAuthForm";

const CreateAccount: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();
  const context = useContext(OnboardingContext);
  const { saveOnboardingToProfile } = useOnboardingPersistence();

  const { 
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    agreedToTerms, setAgreedToTerms,
    loading, setLoading,
    googleLoading, setGoogleLoading,
    error, setError
  } = useAuthForm({
    validateForm: (email, password, confirmPassword, agreedToTerms) => {
      if (!email) return "Por favor ingresa tu email";
      if (!/\S+@\S+\.\S+/.test(email)) return "Por favor ingresa un email válido";
      if (!password) return "Por favor ingresa una contraseña";
      if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
      if (password !== confirmPassword) return "Las contraseñas no coinciden";
      if (!agreedToTerms) return "Debes aceptar los términos y condiciones";
      return null;
    }
  });

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
        if (error.message.includes("rate limit exceeded")) {
          setError("Has alcanzado el límite de envío de correos. Intenta de nuevo más tarde o utiliza Google para registrarte.");
        } else {
          setError(error.message);
        }
      } else {
        // Save onboarding data to profile after successful signup
        setTimeout(async () => {
          await saveOnboardingToProfile(context.data);
        }, 1000);
        
        toast.success({
          title: "¡Cuenta creada!",
          description: "Te hemos enviado un email de verificación"
        });
        navigate("/onboarding/app-transition");
      }
    } catch (err: any) {
      setError(err.message || "Error creando la cuenta");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
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

  const handleLogin = () => {
    navigate("/onboarding/login");
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <OnboardingLayout currentStep={18} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-2">
        Crea tu Cuenta <GatofitAILogo size="lg" className="inline-block" />
      </h1>
      
      <p className="text-muted-foreground mb-6">
        Un paso más para comenzar tu viaje fitness
      </p>

      <AccountForm 
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        agreedToTerms={agreedToTerms}
        setAgreedToTerms={setAgreedToTerms}
        loading={loading}
        error={error}
        showConfirmPassword={true}
        showTermsAgreement={true}
      />

      <AuthButtons 
        handleCreateAccount={handleCreateAccount}
        handleGoogleSignUp={handleGoogleSignUp}
        handleLogin={handleLogin}
        loading={loading}
        googleLoading={googleLoading}
        isDisabled={!email || !password || !confirmPassword || !agreedToTerms}
      />

      <BackButton onBack={handleBack} />
    </OnboardingLayout>
  );
};

export default CreateAccount;
