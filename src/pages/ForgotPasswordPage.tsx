import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  Tooltip,
  Zoom,
} from '@mui/material';
import { Email as EmailIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import authService from '../services/authService';
import { useFeatures } from '../context/FeatureContext';
import { validateEmail } from '../utils/validation';

export default function ForgotPasswordPage() {
  const { getAppName, getAppSubtitle } = useFeatures();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const validateEmailField = (value: string): boolean => {
    const error = validateEmail(value);
    if (error) {
      setError(error);
      return false;
    }
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setError('');
    setEmailTouched(true);
  };

  const handleBlur = () => {
    if (emailTouched) {
      validateEmailField(email);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setEmailTouched(true);

    // Validate email
    if (!validateEmailField(email)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.forgotPassword({ email });
      
      if (response.success) {
        setSuccess(response.message || 'Password reset link sent successfully!');
      } else {
        setError(response.message || 'Failed to send reset link');
      }
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
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
                  📧 Check Your Email!
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
                  We've sent a password reset link to <strong>{email}</strong>
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
              /* Forgot Password Form */
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Enter your email address and we'll send you a link to reset your password
                  </Typography>

                  <Tooltip title={error || ''} open={!!error && emailTouched} placement="top" arrow TransitionComponent={Zoom}>
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
                      InputProps={{
                        startAdornment: (
                          <EmailIcon
                            color={error && emailTouched ? 'error' : 'action'}
                            sx={{ mr: 1 }}
                          />
                        ),
                      }}
                    />
                  </Tooltip>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={isLoading || !email}
                    sx={{ py: 1.5 }}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>

                  <Box sx={{ textAlign: 'center', pt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Remember your password?{' '}
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
