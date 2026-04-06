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
  InputAdornment,
  IconButton,
  Stack,
  CircularProgress,
  Tooltip,
  Zoom,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import authService from '../services/authService';
import { useFeatures } from '../context/FeatureContext';
import { validateFirstName, validateLastName, validateUsername, validatePassword } from '../utils/validation';

export default function SignupPage() {
  const { getAppName } = useFeatures();
  const [searchParams] = useSearchParams();
  
  const [inviteToken, setInviteToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  // Verify invitation token on mount
  useEffect(() => {
    const token = searchParams.get('invite');
    
    // Step 2: Check if token is present in URL
    if (!token) {
      setVerificationError('Invalid URL. Invitation token is required.');
      setIsVerifying(false);
      return;
    }
    
    setInviteToken(token);
    
    // Step 3: Verify the token BEFORE showing registration form
    authService.verifyEmailInvite(token)
      .then(() => {
        // Token is valid, show signup form
        setIsVerifying(false);
      })
      .catch((err) => {
        setVerificationError(err.response?.data?.message || 'Invalid or expired invitation token');
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

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    let error: string | null = null;
    switch (name) {
      case 'firstName':
        error = validateFirstName(value);
        break;
      case 'lastName':
        error = validateLastName(value);
        break;
      case 'username':
        error = validateUsername(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'confirmPassword':
        if (!value) error = 'Please confirm your password';
        else if (formData.password !== value) error = 'Passwords do not match';
        break;
    }

    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const firstNameError = validateFirstName(formData.firstName);
    if (firstNameError) newErrors.firstName = firstNameError;

    const lastNameError = validateLastName(formData.lastName);
    if (lastNameError) newErrors.lastName = lastNameError;

    const usernameError = validateUsername(formData.username);
    if (usernameError) newErrors.username = usernameError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

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
      await authService.signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        password: formData.password,
        invitationToken: inviteToken,
      });

      setSuccess(true);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = (): boolean => {
    return (
      formData.firstName.trim().length >= 1 &&
      formData.firstName.length <= 100 &&
      formData.lastName.trim().length >= 1 &&
      formData.lastName.length <= 100 &&
      formData.username.length >= 3 &&
      formData.username.length <= 50 &&
      formData.password.length >= 8 &&
      formData.confirmPassword.length >= 1 &&
      formData.password === formData.confirmPassword &&
      !Object.values(errors).some(e => e)
    );
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
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6">Verifying invitation...</Typography>
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
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
              🔗 {getAppName()}
            </Typography>
            <Typography variant="h5" color="error" gutterBottom>
              Invitation Invalid
            </Typography>
            <Alert severity="error" sx={{ mb: 3 }}>
              {verificationError}
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please check your email for a valid invitation link or contact the administrator.
            </Typography>
            <Button
              variant="contained"
              component={RouterLink}
              to="/login"
            >
              Back to Login
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
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
              🔗 {getAppName()}
            </Typography>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" fontWeight={700} gutterBottom>
              🎉 Congratulations{formData.firstName ? `, ${formData.firstName}!` : '!'}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              Your account has been created successfully
            </Typography>
            <Alert severity="success" sx={{ mb: 3 }}>
              Please check your email to verify your account
            </Alert>
            <Button
              variant="contained"
              component={RouterLink}
              to="/login"
              size="large"
            >
              Sign In
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  // Show signup form
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
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
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
                Create Your Account
              </Typography>
              {inviteToken && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  ✉️ Invitation verified! Complete your registration below
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
                {/* Name Fields */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Tooltip title={errors.firstName || ''} open={!!errors.firstName && touched.firstName} placement="top" arrow TransitionComponent={Zoom}>
                    <TextField
                      fullWidth
                      label="First Name *"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      error={!!errors.firstName && touched.firstName}
                      inputProps={{ maxLength: 100 }}
                    />
                  </Tooltip>
                  <Tooltip title={errors.lastName || ''} open={!!errors.lastName && touched.lastName} placement="top" arrow TransitionComponent={Zoom}>
                    <TextField
                      fullWidth
                      label="Last Name *"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      error={!!errors.lastName && touched.lastName}
                      inputProps={{ maxLength: 100 }}
                    />
                  </Tooltip>
                </Stack>

                {/* Username */}
                <Tooltip title={errors.username || ''} open={!!errors.username && touched.username} placement="top" arrow TransitionComponent={Zoom}>
                  <TextField
                    fullWidth
                    label="Username *"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    error={!!errors.username && touched.username}
                    placeholder="johndoe"
                    inputProps={{ minLength: 3, maxLength: 50 }}
                  />
                </Tooltip>

                {/* Password */}
                <Tooltip title={errors.password || ''} open={!!errors.password && touched.password} placement="top" arrow TransitionComponent={Zoom}>
                  <TextField
                    fullWidth
                    label="Password *"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    error={!!errors.password && touched.password}
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
                    inputProps={{ maxLength: 255 }}
                  />
                </Tooltip>

                {/* Confirm Password */}
                <Tooltip title={errors.confirmPassword || ''} open={!!errors.confirmPassword && touched.confirmPassword} placement="top" arrow TransitionComponent={Zoom}>
                  <TextField
                    fullWidth
                    label="Confirm Password *"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    error={!!errors.confirmPassword && touched.confirmPassword}
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
                </Tooltip>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isSubmitting || !isFormValid()}
                  sx={{ py: 1.5, mt: 2 }}
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Stack>
            </form>

            <Box textAlign="center" mt={3}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
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
