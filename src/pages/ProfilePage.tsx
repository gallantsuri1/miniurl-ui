import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Snackbar,
  Grid,
  Paper,
  Chip,
  Container,
  Tooltip,
  Zoom,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon, Person as PersonIcon } from '@mui/icons-material';
import Header from '../components/Header';
import { useFeatures } from '../context/FeatureContext';
import profileService from '../services/profileService';
import { useAuth } from '../context/AuthContext';
import { validateFirstNameOptional, validateLastNameOptional, validateEmailOptional } from '../utils/validation';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { getFeatureName, getDescription } = useFeatures();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState<{ id?: number; username?: string; firstName?: string; lastName?: string; email?: string; createdAt: string; lastLogin: string | null } | null>(null);

  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });
  const [originalValues, setOriginalValues] = useState({ firstName: '', lastName: '', email: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await profileService.getProfile();
      setProfileData({
        id: profile.id,
        username: profile.username || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        createdAt: profile.createdAt,
        lastLogin: profile.lastLogin,
      });
      const data = { firstName: profile.firstName || '', lastName: profile.lastName || '', email: profile.email || '' };
      setFormData(data);
      setOriginalValues(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    let error: string | null = null;
    switch (name) {
      case 'firstName':
        error = validateFirstNameOptional(value);
        break;
      case 'lastName':
        error = validateLastNameOptional(value);
        break;
      case 'email':
        error = validateEmailOptional(value);
        break;
    }
    if (error) {
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    } else {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateProfileForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const firstNameError = validateFirstNameOptional(formData.firstName);
    if (firstNameError) newErrors.firstName = firstNameError;
    const lastNameError = validateLastNameOptional(formData.lastName);
    if (lastNameError) newErrors.lastName = lastNameError;
    const emailError = validateEmailOptional(formData.email);
    if (emailError) newErrors.email = emailError;
    setFieldErrors(newErrors);
    setTouched({ firstName: true, lastName: true, email: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateProfileForm()) {
      return;
    }

    if (formData.firstName === originalValues.firstName && formData.lastName === originalValues.lastName && formData.email === originalValues.email) {
      setError('No changes detected');
      return;
    }

    try {
      const response = await profileService.updateProfile(formData);
      if (response.success) {
        setSuccess('Profile updated successfully');
        setOriginalValues(formData);
        updateUser({ firstName: formData.firstName, lastName: formData.lastName, email: formData.email });
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const infoCards = [
    { label: 'Full Name', value: profileData?.firstName && profileData?.lastName ? `${profileData.firstName} ${profileData.lastName}` : (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Not set') },
    { label: 'Username', value: profileData?.username || user?.username || 'N/A' },
    { label: 'Email', value: profileData?.email || user?.email || 'N/A' },
    { label: 'Role', value: user?.role?.name || 'USER', chip: true },
    { label: 'Member Since', value: formatDateOnly(profileData?.createdAt ?? null) },
    { label: 'Last Login', value: formatDate(profileData?.lastLogin ?? null) },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {getFeatureName('PROFILE_PAGE')}
            </Typography>
            <Typography color="text.secondary">{getDescription('PROFILE_PAGE')}</Typography>
          </Box>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Box>

        {/* Profile Info Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {infoCards.map((info, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper sx={{ p: 2.5, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={600}>
                    {info.label}
                  </Typography>
                </Box>
                {info.chip ? (
                  <Chip label={info.value} size="small" color={info.value === 'ADMIN' ? 'error' : 'primary'} />
                ) : (
                  <Typography variant="h6" fontWeight={600}>{info.value}</Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Edit Profile Card */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Edit Profile Information
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Tooltip title={fieldErrors.firstName || ''} open={!!fieldErrors.firstName && touched.firstName} placement="top" arrow TransitionComponent={Zoom}>
                    <TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} onBlur={handleBlur} error={!!fieldErrors.firstName && touched.firstName} inputProps={{ maxLength: 100 }} />
                  </Tooltip>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Tooltip title={fieldErrors.lastName || ''} open={!!fieldErrors.lastName && touched.lastName} placement="top" arrow TransitionComponent={Zoom}>
                    <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} onBlur={handleBlur} error={!!fieldErrors.lastName && touched.lastName} inputProps={{ maxLength: 100 }} />
                  </Tooltip>
                </Grid>
                <Grid item xs={12}>
                  <Tooltip title={fieldErrors.email || ''} open={!!fieldErrors.email && touched.email} placement="top" arrow TransitionComponent={Zoom}>
                    <TextField fullWidth label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} onBlur={handleBlur} error={!!fieldErrors.email && touched.email} inputProps={{ maxLength: 255 }} />
                  </Tooltip>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Username" value={profileData?.username || user?.username || ''} disabled helperText="Username cannot be changed" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Role" value={user?.role?.name || 'USER'} disabled helperText="Role is managed by administrators" />
                </Grid>
              </Grid>

              <Button type="submit" variant="contained" sx={{ mt: 3 }} startIcon={<SaveIcon />}>
                Update Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
          <Alert severity="success">{success}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
