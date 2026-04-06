import { useState, useEffect } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
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
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import authService from '../services/authService';
import { useFeatures } from '../context/FeatureContext';

export default function ResetPasswordPage() {
  const { getAppName } = useFeatures();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState('');
  const [tokenVerified, setTokenVerified] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  // Verify token on mount
  useEffect(() => {
    const tokenParam = searchParams.get('token');

    if (!tokenParam) {
      setVerificationError('Invalid URL. Reset token is required.');
      setIsVerifying(false);
      return;
    }

    setToken(tokenParam);

    // Verify the token
    authService.verifyEmail(tokenParam)
      .then(() => {
        // Token is valid, show password reset form
        setTokenVerified(true);
        setIsVerifying(false);
      })
      .catch((err) => {
        setVerificationError(err.response?.data?.message || 'Invalid or expired reset token');
        setIsVerifying(false);
      });
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await authService.resetPassword({
        token,
        newPassword: formData.password,
      });

      setSuccess(true);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show verification loading
  if (isVerifying) {
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
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6">Verifying reset token...</Typography>
        </Paper>
      </Box>
    );
  }

  // Show verification error
  if (verificationError) {
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
              p: { xs: 3, sm: 5 },
            }}
          >
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
                Reset Password
              </Typography>
            </Box>

            <Typography variant="h5" color="error" gutterBottom>
              Invalid Reset Link
            </Typography>
            <Alert severity="error" sx={{ mb: 3 }}>
              {verificationError}
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please request a new password reset link or contact the administrator.
            </Typography>
            <Button
              variant="contained"
              component={RouterLink}
              to="/forgot-password"
              fullWidth
              sx={{ py: 1.5 }}
            >
              Request New Reset Link
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  // Show success message
  if (success) {
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
              p: { xs: 3, sm: 5 },
            }}
          >
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
                Reset Password
              </Typography>
            </Box>

            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Password Reset Successful!
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              Your password has been updated successfully
            </Typography>
            <Alert severity="success" sx={{ mb: 3 }}>
              You can now sign in with your new password
            </Alert>
            <Button
              variant="contained"
              component={RouterLink}
              to="/login"
              size="large"
              fullWidth
              sx={{ py: 1.5 }}
            >
              Sign In
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  // Show password reset form
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
                Reset Password
              </Typography>
              {tokenVerified && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  ✓ Token verified! Enter your new password below
                </Alert>
              )}
            </Box>

            {submitError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {submitError}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Enter your new password
                </Typography>

                {/* Password */}
                <TextField
                  fullWidth
                  label="New Password *"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  error={!!errors.password}
                  helperText={errors.password}
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

                {/* Confirm Password */}
                <TextField
                  fullWidth
                  label="Confirm Password *"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{ py: 1.5, mt: 2 }}
                >
                  {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                </Button>
              </Stack>
            </form>

            <Box textAlign="center" mt={3}>
              <Typography variant="body2" color="text.secondary">
                Remember your password?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  underline="hover"
                  sx={{ fontWeight: 500 }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
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
