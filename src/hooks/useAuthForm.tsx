
import { useState } from "react";

interface UseAuthFormProps {
  validateForm?: (email: string, password: string, confirmPassword: string, agreedToTerms: boolean) => string | null;
}

export const useAuthForm = (props?: UseAuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = props?.validateForm || (() => null);

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    agreedToTerms,
    setAgreedToTerms,
    loading,
    setLoading,
    googleLoading,
    setGoogleLoading,
    error,
    setError,
    validateForm: () => validateForm(email, password, confirmPassword, agreedToTerms)
  };
};

export default useAuthForm;
