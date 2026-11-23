import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  id: number | string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authModalOpen: boolean;
  authModalView: 'login' | 'register' | 'verify';
  unverifiedEmail: string;
  devPreviewCode: string | null;
  openAuthModal: (view?: 'login' | 'register' | 'verify', email?: string) => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; requiresVerification?: boolean }>;
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; message: string; previewCode?: string }>;
  loginWithGoogle: (credential: string) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (code: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register' | 'verify'>('login');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [devPreviewCode, setDevPreviewCode] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.getMe();
        if (res && res.user) {
          setUser(res.user);
        }
      } catch (err) {
        console.warn('Auth init failed:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const openAuthModal = (view: 'login' | 'register' | 'verify' = 'login', email: string = '') => {
    setAuthModalView(view);
    if (email) setUnverifiedEmail(email);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await api.login(email, password);
      if (res.success && res.user) {
        setUser(res.user);
        setAuthModalOpen(false);
        return { success: true, message: res.message || 'Login berhasil' };
      }
      if (res.requiresVerification) {
        setUnverifiedEmail(res.email || email);
        if (res.previewCode) setDevPreviewCode(res.previewCode);
        setAuthModalView('verify');
        return { success: false, requiresVerification: true, message: res.message };
      }
      return { success: false, message: res.message || 'Login gagal' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Koneksi error' };
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    try {
      const res = await api.register(email, password, fullName);
      if (res.success) {
        setUnverifiedEmail(email);
        if (res.previewCode) setDevPreviewCode(res.previewCode);
        setAuthModalView('verify');
        return { success: true, message: res.message, previewCode: res.previewCode };
      }
      return { success: false, message: res.message || 'Pendaftaran gagal' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Koneksi error' };
    }
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      const res = await api.loginWithGoogle(credential);
      if (res.success && res.user) {
        setUser(res.user);
        setAuthModalOpen(false);
        return { success: true, message: res.message || 'Login Google berhasil' };
      }
      return { success: false, message: res.message || 'Login Google gagal' };
    } catch (err: unknown) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Login Google gagal',
      };
    }
  };

  const verifyEmail = async (code: string) => {
    try {
      const res = await api.verifyEmail(unverifiedEmail, code);
      if (res.success && res.user) {
        setUser(res.user);
        setAuthModalOpen(false);
        setDevPreviewCode(null);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Kode verifikasi salah' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Verifikasi gagal' };
    }
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        authModalOpen,
        authModalView,
        unverifiedEmail,
        devPreviewCode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        loginWithGoogle,
        verifyEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
