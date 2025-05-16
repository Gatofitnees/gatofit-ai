
import React, { createContext, useContext } from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useAuthService } from "@/hooks/useAuthService";
import { AuthContextProps } from "@/types/auth.types";

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, loading } = useAuthSession();
  const { signUp, signIn, signInWithGoogle, signOut } = useAuthService();

  const value: AuthContextProps = {
    session,
    user,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
