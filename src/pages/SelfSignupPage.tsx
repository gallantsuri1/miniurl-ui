import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Stack,
} from '@mui/material';
import { Email as EmailIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useFeatures } from '../context/FeatureContext';
import { useInitialization } from '../context/InitializationContext';
import { useAuth } from '../context/AuthContext';
import selfInviteService from '../services/selfInviteService';

// Email validation regex pattern
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SelfSignupPage() {
  const navigate = useNavigate();
  const { isFeatureEnabled, getAppName, getAppSubtitle, isLoaded } = useFeatures();
  const { isAuthenticated: initIsAuthenticated, isInitialized, isLoading: initLoading } = useInitialization();
  const { isAuthenticated: authIsAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Check if signup is enabled
  const isSignupEnabled = isFeatureEnabled('GLOBAL_USER_SIGNUP');

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isInitialized || initLoading) {
      return;
    }

    const hasValidToken = initIsAuthenticated || authIsAuthenticated;

    if (hasValidToken && isLoaded) {
      if (isFeatureEnabled('DASHBOARD')) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/no-permission', { replace: true });
      }
    }
  }, [initIsAuthenticated, authIsAuthenticated, isLoaded, isInitialized, initLoading, isFeatureEnabled, navigate]);

  const validateEmail = (value: string): boolean => {
    if (!value) return false;
    return EMAIL_PATTERN.test(value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setError('');
    setEmailTouched(true);
  };

  const handleBlur = () => {
    if (emailTouched && email && !validateEmail(email)) {
      setError('Please enter a valid email address');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate email
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await selfInviteService.sendSelfInvite(email);
      
      if (response.success) {
        setSuccess(response.message || 'Self-invitation sent successfully!');
      } else {
        setError(response.message || 'Failed to send self-invitation');
      }
    } catch (err: any) {
      console.error('Self-invite error:', err);
      setError(err.response?.data?.message || 'Failed to send self-invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If signup is disabled, show a message
  if (!isSignupEnabled) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          bgcolor: 'background.default',
          py: 6,
          pt: { xs: 8, sm: 10 },
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              p: 4,
              textAlign: 'center',
            }}
          >
            <Alert severity="warning" sx={{ mb: 3 }}>
              Self-signup is currently disabled. Please contact your administrator for access.
            </Alert>
            <Link
              component={RouterLink}
              to="/login"
              underline="hover"
              variant="body2"
            >
              Back to Login
            </Link>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        bgcolor: 'background.default',
        py: 6,
        pt: { xs: 8, sm: 10 },
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ p: { xs: 3, sm: 5 } }}>
            {/* Header */}
            <Box textAlign="center" mb={3}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  color: 'primary.main',
                }}
              >
                🔗 {getAppName()}
              </Typography>
              <Typography color="text.secondary">
                {getAppSubtitle()}
              </Typography>
            </Box>

            {/* Success Message */}
            {success ? (
              <Box>
                <Typography variant="h4" fontWeight={700} textAlign="center" sx={{ mb: 2 }}>
                  🎉 Congratulations!
                </Typography>
                
                <Alert
                  severity="success"
                  sx={{
                    mb: 3,
                    alignItems: 'center',
                    '& .MuiAlert-icon': {
                      color: 'success.main',
                    },
                  }}
                  icon={<CheckCircleIcon />}
                >
                  <Typography variant="body2" fontWeight={500}>
                    {success}
                  </Typography>
                </Alert>

                <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 3 }}>
                  Please check your inbox to Sign Up!
                </Typography>

                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Back to Sign In
                </Button>
              </Box>
            ) : (
              /* Signup Form */
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={handleBlur}
                    required
                    autoFocus
                    error={!!error && emailTouched}
                    helperText={error || 'We\'ll send you an invitation link'}
                    InputProps={{
                      startAdornment: (
                        <EmailIcon
                          color={error ? 'error' : 'action'}
                          sx={{ mr: 1 }}
                        />
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={isLoading}
                    sx={{ py: 1.5 }}
                  >
                    {isLoading ? 'Sending Request...' : 'Request Access'}
                  </Button>

                  <Box sx={{ textAlign: 'center', pt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Already have an account?{' '}
                      <Link
                        component={RouterLink}
                        to="/login"
                        underline="hover"
                        fontWeight={600}
                      >
                        Sign In
                      </Link>
                    </Typography>
                  </Box>
                </Stack>
              </form>
            )}
          </Box>

          {/* Footer */}
          <Box
            sx={{
              bgcolor: 'grey.50',
              p: 2,
              textAlign: 'center',
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              © {new Date().getFullYear()} {getAppName()}. All rights reserved.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
