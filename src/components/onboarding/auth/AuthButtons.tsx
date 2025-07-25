
import React from "react";
import { Button } from "@/components/ui/button";
import { usePlatform } from "@/hooks/usePlatform";

interface AuthButtonsProps {
  handleCreateAccount: () => void;
  handleGoogleSignUp: () => void;
  handleLogin: () => void;
  loading: boolean;
  googleLoading: boolean;
  isDisabled: boolean;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({
  handleCreateAccount,
  handleGoogleSignUp,
  handleLogin,
  loading,
  googleLoading,
  isDisabled
}) => {
  const { isAndroid, isNative } = usePlatform();

  return (
    <div className="mt-6 w-full max-w-md mx-auto space-y-4">
      <Button
        className="w-full py-6 h-auto flex items-center justify-center space-x-2"
        onClick={handleCreateAccount}
        disabled={loading || isDisabled}
      >
        {loading ? (
          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
        ) : "Crear Mi Cuenta"}
      </Button>
      
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-xs text-muted-foreground">o continuar con</span>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full py-6 h-auto flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10"
        onClick={handleGoogleSignUp}
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
            <span>
              {isNative && isAndroid ? 'Google (Nativo)' : 'Continuar con Google'}
            </span>
          </>
        )}
      </Button>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          ¿Ya tienes cuenta? <button onClick={handleLogin} className="text-primary">Iniciar sesión</button>
        </p>
      </div>
      
      {isNative && isAndroid && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground/70">
            🚀 Usando autenticación nativa optimizada para Android
          </p>
        </div>
      )}
    </div>
  );
};

export default AuthButtons;
