import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import featureService from '../services/featureService';
import { Feature } from '../types';
import { useInitialization } from './InitializationContext';

interface FeatureContextType {
  features: Feature[];
  globalFeatures: Feature[];
  isLoading: boolean;
  isLoaded: boolean;
  isGlobalFeaturesLoaded: boolean;
  isFeatureEnabled: (key: string) => boolean;
  getFeatureName: (key: string) => string;
  getDescription: (key: string) => string;
  getGlobalFeature: (key: string) => Feature | undefined;
  getUserFeature: (key: string) => Feature | undefined;
  refreshFeatures: () => Promise<void>;
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

// Track if features are being loaded to prevent duplicate calls
let isLoadingFeatures = false;
let featuresCache: Feature[] | null = null;
let globalFeaturesCache: Feature[] | null = null;

export function FeatureProvider({ children }: { children: ReactNode }) {
  const { globalFeatures: initGlobalFeatures, globalFeaturesLoaded, features: initFeatures, featuresLoaded } = useInitialization();
  const [features, setFeatures] = useState<Feature[]>(() => featuresCache || []);
  const [globalFeatures, setGlobalFeatures] = useState<Feature[]>(() => globalFeaturesCache || []);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGlobalFeaturesLoaded, setIsGlobalFeaturesLoaded] = useState(false);

  // Sync with InitializationContext
  useEffect(() => {
    if (globalFeaturesLoaded && !isGlobalFeaturesLoaded) {
      setGlobalFeatures(initGlobalFeatures);
      globalFeaturesCache = initGlobalFeatures;
      setIsGlobalFeaturesLoaded(true);
      console.log('Global features synced from InitializationContext:', initGlobalFeatures.length);
    }
  }, [initGlobalFeatures, globalFeaturesLoaded, isGlobalFeaturesLoaded]);

  useEffect(() => {
    if (featuresLoaded && !isLoaded) {
      setFeatures(initFeatures);
      featuresCache = initFeatures;
      setIsLoaded(true);
      setIsLoading(false);
      console.log('User features synced from InitializationContext:', initFeatures.length);
    }
  }, [initFeatures, featuresLoaded, isLoaded]);

  const loadFeatures = async () => {
    // Prevent duplicate calls
    if (isLoadingFeatures || isLoaded) return;

    isLoadingFeatures = true;
    setIsLoading(true);

    try {
      const data = await featureService.getUserFeatures();
      setFeatures(data);
      featuresCache = data; // Cache for future use
      setIsLoaded(true);
      console.log('Features loaded:', data.length);
    } catch (err: any) {
      console.error('Failed to load features:', err);
      // If unauthorized, clear cache
      if (err.response?.status === 401) {
        featuresCache = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } finally {
      setIsLoading(false);
      isLoadingFeatures = false;
    }
  };

  // Load features when token is available
  useEffect(() => {
    const token = localStorage.getItem('token');

    // If features are already cached, use them immediately
    if (featuresCache && featuresCache.length > 0) {
      setFeatures(featuresCache);
      setIsLoaded(true);
      setIsLoading(false);
      console.log('Features loaded from cache');
      return;
    }

    // Only load features if user is authenticated (has token)
    if (token && !isLoaded && !isLoadingFeatures) {
      console.log('Loading features, token exists');
      loadFeatures();
    } else if (!token) {
      console.log('No token, skipping feature load');
      setIsLoading(false);
      setIsLoaded(false);
    }

    // Listen for features-loaded event (from AuthContext after login)
    const handleFeaturesLoaded = (event: CustomEvent<Feature[]>) => {
      console.log('Features loaded via event');
      featuresCache = event.detail;
      setFeatures(featuresCache);
      setIsLoaded(true);
      setIsLoading(false);
    };

    // Listen for global-features-loaded event (from AuthContext after logout)
    const handleGlobalFeaturesLoaded = (event: CustomEvent<Feature[]>) => {
      console.log('Global features reloaded via event (logout)');
      globalFeaturesCache = event.detail;
      setGlobalFeatures(globalFeaturesCache);
      setIsGlobalFeaturesLoaded(true);
    };

    window.addEventListener('features-loaded', handleFeaturesLoaded as EventListener);
    window.addEventListener('global-features-loaded', handleGlobalFeaturesLoaded as EventListener);

    return () => {
      window.removeEventListener('features-loaded', handleFeaturesLoaded as EventListener);
      window.removeEventListener('global-features-loaded', handleGlobalFeaturesLoaded as EventListener);
    };
  }, []);

  const isFeatureEnabled = (key: string): boolean => {
    // For global features (like USER_SIGNUP), check global features first
    if (key === 'USER_SIGNUP') {
      const globalFeature = globalFeatures.find(f => f.featureKey === key);
      return globalFeature?.enabled ?? false;
    }
    
    // For user-specific features, check user features
    // If still loading, don't block - return true to allow access
    // The actual check will happen when loaded
    if (isLoading && !isLoaded) {
      return true;
    }
    const feature = features.find(f => f.featureKey === key);
    return feature?.enabled ?? true; // Default to enabled if feature not found
  };

  const getFeatureName = (key: string): string => {
    // Try user features first, then global features
    const feature = features.find(f => f.featureKey === key) ||
                    globalFeatures.find(f => f.featureKey === key);
    return feature?.featureName || key;
  };

  const getDescription = (key: string): string => {
    // Try user features first, then global features
    const feature = features.find(f => f.featureKey === key) ||
                    globalFeatures.find(f => f.featureKey === key);
    return feature?.description || '';
  };

  const getGlobalFeature = (key: string): Feature | undefined => {
    return globalFeatures.find(f => f.featureKey === key);
  };

  const getUserFeature = (key: string): Feature | undefined => {
    return features.find(f => f.featureKey === key);
  };

  const refreshFeatures = async () => {
    featuresCache = null; // Clear cache
    setIsLoaded(false);
    setIsLoading(true);
    await loadFeatures();
  };

  const value = {
    features,
    globalFeatures,
    isLoading,
    isLoaded,
    isGlobalFeaturesLoaded,
    isFeatureEnabled,
    getFeatureName,
    getDescription,
    getGlobalFeature,
    getUserFeature,
    refreshFeatures,
  };

  return <FeatureContext.Provider value={value}>{children}</FeatureContext.Provider>;
}

export function useFeatures() {
  const context = useContext(FeatureContext);
  if (context === undefined) {
    throw new Error('useFeatures must be used within a FeatureProvider');
  }
  return context;
}
