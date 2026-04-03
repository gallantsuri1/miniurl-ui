import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import healthService from '../services/healthService';
import featureService from '../services/featureService';
import { Feature } from '../types';

interface InitializationContextType {
  isInitialized: boolean;
  isHealthy: boolean;
  featuresLoaded: boolean;
  globalFeaturesLoaded: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  features: Feature[];
  globalFeatures: Feature[];
  triggerMaintenance: () => void;
}

const InitializationContext = createContext<InitializationContextType | undefined>(undefined);

// Global cache for features
let globalFeaturesCache: Feature[] | null = null;
let userFeaturesCache: Feature[] | null = null;

export function InitializationProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHealthy, setIsHealthy] = useState(false);
  const [featuresLoaded, setFeaturesLoaded] = useState(false);
  const [globalFeaturesLoaded, setGlobalFeaturesLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [features, setFeatures] = useState<Feature[]>(() => userFeaturesCache || []);
  const [globalFeatures, setGlobalFeatures] = useState<Feature[]>(() => globalFeaturesCache || []);

  const initialize = async () => {
    console.log('[Initialization] Starting...');
    setIsLoading(true);
    setError(null);

    // Safety timeout - if initialization takes too long, force maintenance page
    const safetyTimer = setTimeout(() => {
      console.error('[Initialization] Safety timeout exceeded (10s). Forcing maintenance mode.');
      setIsHealthy(false);
      setIsInitialized(true);
      setIsLoading(false);
    }, 10000);

    try {
      // Step 1: Check health
      console.log('[Initialization] Step 1: Checking health...');
      const healthResponse = await healthService.checkHealth();
      if (!healthResponse.success) {
        throw new Error('Service unhealthy');
      }
      setIsHealthy(true);
      console.log('[Initialization] Health check passed');

      // Step 2: Load global features (no auth required)
      console.log('[Initialization] Step 2: Loading global features...');
      try {
        if (globalFeaturesCache) {
          setGlobalFeatures(globalFeaturesCache);
          setGlobalFeaturesLoaded(true);
          console.log('[Initialization] Global features loaded from cache');
        } else {
          const globalFeaturesData = await featureService.getGlobalFeatures();
          setGlobalFeatures(globalFeaturesData);
          globalFeaturesCache = globalFeaturesData;
          setGlobalFeaturesLoaded(true);
          console.log('[Initialization] Global features loaded:', globalFeaturesData.length);
        }
      } catch (err: any) {
        console.error('[Initialization] Failed to load global features:', err);
        // Continue anyway - global features are optional
      }

      // Step 3: Check if user has token
      const token = localStorage.getItem('token');
      if (token) {
        console.log('[Initialization] Step 3: Token found, loading user features...');
        try {
          if (userFeaturesCache) {
            setFeatures(userFeaturesCache);
            setFeaturesLoaded(true);
            setIsAuthenticated(true);
            console.log('[Initialization] User features loaded from cache');
          } else {
            const featuresData = await featureService.getUserFeatures();
            setFeatures(featuresData);
            userFeaturesCache = featuresData;
            setFeaturesLoaded(true);
            setIsAuthenticated(true);
            console.log('[Initialization] User features loaded:', featuresData.length);
          }
        } catch (err: any) {
          if (err.response?.status === 401) {
            console.log('[Initialization] Token invalid, clearing...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
          } else {
            throw err;
          }
        }
      } else {
        console.log('[Initialization] Step 3: No token, user not authenticated');
        setIsAuthenticated(false);
      }

      setIsInitialized(true);
      console.log('[Initialization] Complete - isHealthy=true');
    } catch (err: any) {
      console.error('[Initialization] Failed - falling back to maintenance:', err.message);
      setError(err.message || 'Initialization failed');
      setIsHealthy(false);
      setIsInitialized(true);
    } finally {
      clearTimeout(safetyTimer);
      setIsLoading(false);
    }
  };

  const triggerMaintenance = () => {
    console.log('[Initialization] Triggering maintenance mode');
    setIsHealthy(false);
    // Don't reset isInitialized - keep it true so maintenance page shows
  };

  useEffect(() => {
    initialize();
  }, []);

  // Listen for API unavailable events
  useEffect(() => {
    const handleApiUnavailable = () => {
      triggerMaintenance();
    };

    window.addEventListener('api-unavailable', handleApiUnavailable);

    return () => {
      window.removeEventListener('api-unavailable', handleApiUnavailable);
    };
  }, []);

  const value = {
    isInitialized,
    isHealthy,
    featuresLoaded,
    globalFeaturesLoaded,
    isAuthenticated,
    isLoading,
    error,
    initialize,
    features,
    globalFeatures,
    triggerMaintenance,
  };

  return <InitializationContext.Provider value={value}>{children}</InitializationContext.Provider>;
}

export function useInitialization() {
  const context = useContext(InitializationContext);
  if (context === undefined) {
    throw new Error('useInitialization must be used within an InitializationProvider');
  }
  return context;
}
