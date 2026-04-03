import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import profileService from '../services/profileService';
import featureService from '../services/featureService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
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
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser({
            id: userData.userId || userData.id,
            username: userData.username,
            email: userData.email || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            role: userData.role || { id: 2, name: 'USER' },
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            lastLogin: userData.lastLogin || null,
          });
          // Features are already loaded by InitializationContext, no need to fetch again
        } catch (e) {
          console.error('Error parsing user data:', e);
          authService.logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // First login to get token
      await authService.login({ username, password });

      // Then fetch profile to get role information
      const profile = await profileService.getProfile();

      // Fetch feature flags for this user
      const features = await featureService.getUserFeatures();

      // Update the features cache directly
      if (typeof window !== 'undefined') {
        // Trigger a custom event to notify FeatureContext
        window.dispatchEvent(new CustomEvent('features-loaded', { detail: features }));
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
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
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
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
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
