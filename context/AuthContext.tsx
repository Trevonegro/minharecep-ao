import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../supabaseClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for active session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name || 'Usuário'
        });
      }
      setLoading(false);
    };

    checkSession();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name || 'Usuário'
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    return !error;
  };

  const register = async (name: string, email: string, pass: string): Promise<boolean> => {
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          name: name,
        },
      },
    });
    return !error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100 text-teal-600">Carregando...</div>;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};