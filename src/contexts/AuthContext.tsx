import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { validateEmail, validatePassword, loginRateLimiter, isTokenExpired, getTokenExpiry } from '@/lib/security';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  role?: 'customer' | 'rider' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'speedy_bites_auth_token';
const REFRESH_TOKEN_KEY = 'speedy_bites_refresh_token';
const USER_KEY = 'speedy_bites_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check token expiry on mount and periodically
  useEffect(() => {
    const checkTokenExpiry = () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token && isTokenExpired(token)) {
        console.warn('Token expired, logging out');
        logout();
      }
    };

    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Input validation
    if (!validateEmail(email)) {
      return { error: new Error('Invalid email address') };
    }

    if (!password || password.length === 0) {
      return { error: new Error('Password is required') };
    }

    // Rate limiting
    if (!loginRateLimiter.check(`login_${email}`)) {
      return { error: new Error('Too many login attempts. Please try again later.') };
    }

    try {
      setIsLoading(true);
      const result = await api.login(email, password);
      
      if (result.user) {
        const userData: User = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          phone: result.user.phone,
          avatar_url: result.user.avatar_url,
          role: result.user.role || 'customer',
        };
        
        setUser(userData);
        api.setAuthToken(result.token);
        
        // Store user data for recovery
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        
        // Reset rate limiter on successful login
        loginRateLimiter.reset(`login_${email}`);
      }
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      return { error: new Error(errorMessage) };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    // Input validation
    if (!validateEmail(email)) {
      return { error: new Error('Invalid email address') };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return { error: new Error(passwordValidation.errors[0]) };
    }

    if (name && name.length > 100) {
      return { error: new Error('Name must be less than 100 characters') };
    }

    try {
      setIsLoading(true);
      const result = await api.register({
        email,
        password,
        name: name || '',
      });
      
      if (result.user) {
        const userData: User = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: 'customer',
        };
        
        setUser(userData);
        api.setAuthToken(result.token);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      }
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      return { error: new Error(errorMessage) };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!token) return false;

      const response = await api.refreshAuthToken(token);
      api.setAuthToken(response.token);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      api.clearAuth();
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signUp,
        logout,
        updateUser,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
