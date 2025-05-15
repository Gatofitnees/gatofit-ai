
import React, { useState } from "react";
import { Mail, LockKeyhole, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface AccountFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  showPassword: boolean;
  setShowPassword: (showPassword: boolean) => void;
  agreedToTerms: boolean;
  setAgreedToTerms: (agreedToTerms: boolean) => void;
  loading: boolean;
  error: string | null;
}

const AccountForm: React.FC<AccountFormProps> = ({
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
  error
}) => {
  return (
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
  );
};

export default AccountForm;
