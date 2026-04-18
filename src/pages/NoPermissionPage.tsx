import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Container, Paper, Button } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';
import { useFeatures } from '../context/FeatureContext';
import { useAuth } from '../context/AuthContext';

export default function NoPermissionPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isFeatureEnabled, isLoading, isLoaded } = useFeatures();

  useEffect(() => {
    if (isLoaded) {
      if (isAuthenticated && isFeatureEnabled('DASHBOARD')) {
        // User is logged in and has access - redirect to dashboard
        navigate('/dashboard', { replace: true });
      } else if (!isAuthenticated) {
        // User is not logged in - redirect to login
        navigate('/login', { replace: true });
      }
      // If logged in but no access, show the page
    }
  }, [isLoaded, isAuthenticated, isFeatureEnabled, navigate]);

  // Show loading while checking auth/feature status
  if (isLoading || !isLoaded) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Checking access...
          </Typography>
        </Paper>
      </Container>
    );
  }

  // If user has access or is not logged in, don't show content (will redirect)
  if ((isAuthenticated && isFeatureEnabled('DASHBOARD')) || !isAuthenticated) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 3,
        }}
      >
        <ErrorIcon sx={{ fontSize: 80, color: 'warning.main', mb: 3 }} />
        <Typography variant="h4" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Please contact Admin to get access!
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
        >
          Back to Login
        </Button>
      </Paper>
    </Container>
  );
}
