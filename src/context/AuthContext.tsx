import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import profileService from '../services/profileService';
import featureService from '../services/featureService';
import { User, LoginOtpResponse } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<LoginOtpResponse | null>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  verifyOtp: (username: string, otp: string) => Promise<void>;
  resendOtp: (username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated on mount
    const initAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        // User data will be fetched via completeLogin() by InitializationContext
        // No localStorage cache — kept in React state only
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<LoginOtpResponse | null> => {
    try {
      const result = await authService.login({ username, password });

      // If OTP is required, return the OTP response so the caller can redirect
      if (result.otpRequired) {
        return result;
      }

      // No OTP required — proceed with profile and features fetch
      await completeLogin(username);
      return null;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  };

  const verifyOtp = async (username: string, otp: string) => {
    try {
      await authService.verifyOtp({ username, otp });
      await completeLogin(username);
    } catch (error: any) {
      const message = error.response?.data?.message || 'OTP verification failed';
      throw new Error(message);
    }
  };

  /** Common post-login steps: fetch profile, features, set user state */
  const completeLogin = async (username: string) => {
    // Fetch profile to get role information and theme
    const profile = await profileService.getProfile();

    // Fetch feature flags for this user
    const features = await featureService.getUserFeatures();

    // Dispatch event to notify FeatureContext
    window.dispatchEvent(new CustomEvent('features-loaded', { detail: features }));

    // Sync theme from profile API if available
    if (profile?.theme) {
      window.dispatchEvent(new CustomEvent('profile-theme', { detail: profile.theme }));
    }

    const userData = {
      id: profile.id,
      username: profile.username || username,
      email: profile.email || '',
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      role: {
        id: profile.role === 'ADMIN' ? 1 : 2,
        name: (profile.role === 'ADMIN' ? 'ADMIN' : 'USER') as 'ADMIN' | 'USER'
      },
      status: 'ACTIVE' as const,
      createdAt: profile.createdAt || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    setUser(userData);
    // User data kept in React state only — never persisted to localStorage
  };

  const resendOtp = async (username: string) => {
    try {
      await authService.resendOtp({ username });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      throw new Error(message);
    }
  };

  const logout = async () => {
    authService.logout();
    setUser(null);
    
    // Reload global features to ensure login page has latest data
    // This ensures GLOBAL_USER_SIGNUP and other global features are up to date
    try {
      const globalFeatures = await featureService.getGlobalFeatures();
      if (typeof window !== 'undefined') {
        // Dispatch event to notify FeatureContext about global features update
        window.dispatchEvent(new CustomEvent('global-features-loaded', { detail: globalFeatures }));
      }
    } catch (err) {
      console.error('Failed to reload global features on logout:', err);
    }
    
    navigate('/login');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    verifyOtp,
    resendOtp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
