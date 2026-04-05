import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import healthService from '../services/healthService';

interface HealthContextType {
  isHealthy: boolean;
  isLoading: boolean;
  isChecking: boolean;
  checkHealth: () => Promise<void>;
  setUnhealthy: () => void;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: ReactNode }) {
  const [isHealthy, setIsHealthy] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const checkHealth = useCallback(async () => {
    if (isChecking) return;

    setIsChecking(true);
    try {
      const response = await healthService.checkHealth();
      const healthy = response.success === true;
      setIsHealthy(healthy);
      if (healthy) {
        setIsLoading(false);
      }
    } catch (error) {
      setIsHealthy(false);
      setIsLoading(false);
    } finally {
      setIsChecking(false);
    }
  }, [isChecking]);

  const setUnhealthy = useCallback(() => {
    setIsHealthy(false);
  }, []);

  // Initial health check on mount only - no periodic polling
  useEffect(() => {
    checkHealth();
  }, []);

  const value = {
    isHealthy,
    isLoading,
    isChecking,
    checkHealth,
    setUnhealthy,
  };

  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
}
