import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
} from '@mui/material';
import {
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useFeatures } from '../context/FeatureContext';

const RESEND_COOLDOWN = 30; // seconds

export default function OtpVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, resendOtp, isAuthenticated } = useAuth();
  const { isLoaded, isFeatureEnabled, getAppName, getAppSubtitle } = useFeatures();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [isResending, setIsResending] = useState(false);

  // Get username and email from navigation state (passed from LoginPage)
  const username = location.state?.username as string | undefined;
  const email = location.state?.email as string | undefined;
  const alreadySent = location.state?.alreadySent as boolean | undefined;

  // Redirect to login if no state
  useEffect(() => {
    if (!username) {
      navigate('/login', { replace: true });
    }
  }, [username, navigate]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown > 0]);

  // Redirect to dashboard after successful OTP verification
  useEffect(() => {
    if (isAuthenticated && isLoaded) {
      if (isFeatureEnabled('DASHBOARD')) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/no-permission', { replace: true });
      }
    }
  }, [isAuthenticated, isLoaded, isFeatureEnabled, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(username!, otp);
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  const handleResendOtp = useCallback(async () => {
    if (cooldown > 0 || isResending) return;

    setError('');
    setSuccess('');
    setIsResending(true);
    try {
      await resendOtp(username!);
      setSuccess('OTP resent to your email');
      setCooldown(RESEND_COOLDOWN);
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  }, [username, cooldown, isResending, resendOtp]);

  if (!username) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4,
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

            {/* Title */}
            <Typography variant="h5" fontWeight={600} gutterBottom textAlign="center">
              Two-Factor Authentication
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 1 }}>
              {alreadySent
                ? 'OTP already sent.'
                : 'An OTP has been sent to'}{' '}
              <strong>{email}</strong>
            </Typography>

            {/* Cooldown / Resend */}
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
              {cooldown > 0
                ? `You can request a new OTP in ${cooldown}s`
                : (
                    <>
                      Didn't receive the code?{' '}
                      <Button
                        onClick={handleResendOtp}
                        disabled={isResending}
                        size="small"
                        sx={{ p: 0, minWidth: 'auto', textTransform: 'none', fontWeight: 600 }}
                      >
                        {isResending ? 'Sending...' : 'Resend OTP'}
                      </Button>
                    </>
                  )}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Enter 6-Digit OTP"
                  value={otp}
                  onChange={handleOtpChange}
                  required
                  autoFocus
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    maxLength: 6,
                    style: { letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.5rem' },
                  }}
                  placeholder="______"
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isLoading || otp.length !== 6}
                  startIcon={<VpnKeyIcon />}
                  sx={{ py: 1.5 }}
                >
                  {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Don't recognize this email?{' '}
                    <Button
                      component={RouterLink}
                      to="/login"
                      size="small"
                      sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
                    >
                      Go back
                    </Button>
                  </Typography>
                </Box>
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
