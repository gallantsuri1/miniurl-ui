import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFeatures } from '../context/FeatureContext';
import { useInitialization } from '../context/InitializationContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  featureKey?: string;
}

export default function ProtectedRoute({ children, featureKey }: ProtectedRouteProps) {
  const { isInitialized, isLoading: initLoading, isAuthenticated: initAuth } = useInitialization();
  const { isAuthenticated: authIsAuthenticated, isLoading: authLoading } = useAuth();
  const { isFeatureEnabled, isLoading: featureLoading } = useFeatures();
  const location = useLocation();

  const isLoading = initLoading || authLoading || featureLoading;

  // Wait for initialization to complete
  if (isLoading || !isInitialized) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Check authentication from initialization
  if (!initAuth && !authIsAuthenticated) {
    // Redirect to login, but remember the location we came from
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check feature flag if specified
  if (featureKey && !isFeatureEnabled(featureKey)) {
    return <Navigate to="/no-permission" replace />;
  }

  return <>{children}</>;
}
