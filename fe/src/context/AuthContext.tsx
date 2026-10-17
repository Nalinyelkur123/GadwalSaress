import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, SellerProfile, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  seller: SellerProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string; role?: UserRole; phone?: string }) => Promise<void>;
  logout: () => void;
  quickSwitchRole: (role: 'customer' | 'seller' | 'admin') => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('gadwal_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [seller, setSeller] = useState<SellerProfile | null>(() => {
    const saved = localStorage.getItem('gadwal_seller');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('gadwal_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('gadwal_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          setSeller(res.data.seller || null);
          localStorage.setItem('gadwal_user', JSON.stringify(res.data.user));
          if (res.data.seller) {
            localStorage.setItem('gadwal_seller', JSON.stringify(res.data.seller));
          }
        } catch (err) {
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();

    const handleExpired = () => {
      setUser(null);
      setSeller(null);
      setToken(null);
    };
    window.addEventListener('auth_expired', handleExpired);
    return () => window.removeEventListener('auth_expired', handleExpired);
  }, []);

  const login = async (email: string, password: string = 'Customer@123') => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser, seller: newSeller } = res.data;
    setToken(newToken);
    setUser(newUser);
    setSeller(newSeller || null);
    localStorage.setItem('gadwal_token', newToken);
    localStorage.setItem('gadwal_user', JSON.stringify(newUser));
    if (newSeller) {
      localStorage.setItem('gadwal_seller', JSON.stringify(newSeller));
    }
    setIsAuthModalOpen(false);
  };

  const register = async (data: { email: string; password: string; full_name: string; role?: UserRole; phone?: string }) => {
    const res = await api.post('/auth/register', data);
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('gadwal_token', newToken);
    localStorage.setItem('gadwal_user', JSON.stringify(newUser));
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('gadwal_token');
    localStorage.removeItem('gadwal_user');
    localStorage.removeItem('gadwal_seller');
    setToken(null);
    setUser(null);
    setSeller(null);
  };

  const quickSwitchRole = async (targetRole: 'customer' | 'seller' | 'admin') => {
    let email = 'customer@gadwalweaves.in';
    let pass = 'Customer@123';
    if (targetRole === 'seller') {
      email = 'venkateswara@gadwalweaves.in';
      pass = 'Seller@123';
    } else if (targetRole === 'admin') {
      email = 'admin@gadwalweaves.in';
      pass = 'Admin@123';
    }
    await login(email, pass);
  };

  return (
    <AuthContext.Provider value={{
      user,
      seller,
      token,
      isLoading,
      login,
      register,
      logout,
      quickSwitchRole,
      isAuthModalOpen,
      setIsAuthModalOpen,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
