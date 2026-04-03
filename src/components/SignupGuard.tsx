import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useFeatures } from '../context/FeatureContext';

interface SignupGuardProps {
  children: React.ReactNode;
}

export default function SignupGuard({ children }: SignupGuardProps) {
  const { isFeatureEnabled, isGlobalFeaturesLoaded } = useFeatures();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    // Wait for global features to load before checking
    if (isGlobalFeaturesLoaded) {
      const signupEnabled = isFeatureEnabled('USER_SIGNUP');
      setIsAllowed(signupEnabled);
      setIsChecking(false);
    }
  }, [isGlobalFeaturesLoaded, isFeatureEnabled]);

  // Show loading while checking
  if (isChecking) {
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

  // Redirect to login if signup is disabled
  if (!isAllowed) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
