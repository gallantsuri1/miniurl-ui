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
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon, Person as PersonIcon } from '@mui/icons-material';
import Header from '../components/Header';
import { useFeatures } from '../context/FeatureContext';
import profileService from '../services/profileService';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { getFeatureName, getDescription } = useFeatures();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });
  const [originalValues, setOriginalValues] = useState({ firstName: '', lastName: '', email: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await profileService.getProfile();
      const data = { firstName: profile.firstName || '', lastName: profile.lastName || '', email: profile.email || '' };
      setFormData(data);
      setOriginalValues(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
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

  const infoCards = [
    { label: 'Full Name', value: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Not set' },
    { label: 'Username', value: user?.username || 'N/A' },
    { label: 'Email', value: user?.email || 'N/A' },
    { label: 'Role', value: user?.role?.name || 'USER', chip: true },
    { label: 'Member Since', value: user?.createdAt ? user.createdAt.substring(0, 10) : 'N/A' },
    { label: 'Last Login', value: user?.lastLogin ? user.lastLogin.substring(0, 19) : 'Never' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      <Header />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
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
            <Typography variant="h6" fontWeight={600} mb={2}>
              Edit Profile Information
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Username" value={user?.username || ''} disabled helperText="Username cannot be changed" />
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

        <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity="success">{success}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
