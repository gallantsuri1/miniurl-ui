import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Stack,
  Tooltip,
  Zoom,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useFeatures } from '../context/FeatureContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { isFeatureEnabled, isLoaded, getAppName, getAppSubtitle } = useFeatures();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if signup is enabled (from global features)
  const isSignupEnabled = isFeatureEnabled('GLOBAL_USER_SIGNUP');

  // Redirect based on feature access after login or if already authenticated
  useEffect(() => {
    if (isAuthenticated && isLoaded) {
      // Check if user has dashboard access
      if (isFeatureEnabled('DASHBOARD')) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/no-permission', { replace: true });
      }
    }
  }, [isAuthenticated, isLoaded, isFeatureEnabled, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    // Clear field error on change
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!value) {
      setErrors(prev => ({ ...prev, [name]: name === 'username' ? 'Username or email is required' : 'Password is required' }));
    }
  };

  const validateLoginForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.username) newErrors.username = 'Username or email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateLoginForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const otpResult = await login(formData.username, formData.password);

      // If OTP is required, redirect to verification page
      if (otpResult?.otpRequired) {
        const message = otpResult.message || '';
        navigate('/verify-otp', {
          state: {
            username: formData.username,
            email: otpResult.email,
            alreadySent: message.toLowerCase().includes('already sent'),
          },
        });
      }
      // If no OTP, the useEffect will handle redirection after isAuthenticated becomes true
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

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
            <Box textAlign="center" mb={4}>
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

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <Tooltip title={errors.username || ''} open={!!errors.username} placement="top" arrow TransitionComponent={Zoom}>
                  <TextField
                    fullWidth
                    label="Username or Email"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoFocus
                    error={!!errors.username}
                  />
                </Tooltip>

                <Tooltip title={errors.password || ''} open={!!errors.password} placement="top" arrow TransitionComponent={Zoom}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    error={!!errors.password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Tooltip>

                <Box sx={{ textAlign: 'right' }}>
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    underline="hover"
                    variant="body2"
                  >
                    Forgot Password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isLoading || !formData.username || !formData.password}
                  startIcon={<LoginIcon />}
                  sx={{ py: 1.5 }}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>

                {/* Signup link - shown only if GLOBAL_USER_SIGNUP feature is enabled */}
                {isSignupEnabled && (
                  <Box sx={{ textAlign: 'center', pt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Don't have an account?{' '}
                      <Link
                        component={RouterLink}
                        to="/self-signup"
                        underline="hover"
                        fontWeight={600}
                      >
                        Sign Up
                      </Link>
                    </Typography>
                  </Box>
                )}
              </Stack>
            </form>
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
