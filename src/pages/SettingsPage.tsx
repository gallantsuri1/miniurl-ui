import { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Container,
  Grid,
  CardActionArea,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  DeleteForever as DeleteForeverIcon,
  Lock as LockIcon,
  DataUsage as DataIcon,
  Warning as WarningIcon,
  Palette as PaletteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import Header from '../components/Header';
import { useFeatures } from '../context/FeatureContext';
import { useThemeContext } from '../context/ThemeContext';
import settingsService from '../services/settingsService';
import authService from '../services/authService';
import config from '../config';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { isFeatureEnabled, getFeatureName, getDescription } = useFeatures();
  const { availableThemes, themeName, setTheme } = useThemeContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [themeLoading, setThemeLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setLoading(true);
    try {
      const response = await settingsService.changePassword({
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (response.success) {
        setSuccess('Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const blob = await settingsService.exportData();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${config.appName.toLowerCase().replace(/\s+/g, '-')}-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccess('Data exported successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const response = await settingsService.deleteAccount({ password: deletePassword });
      if (response.success) {
        authService.logout();
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete account');
      setDeleteDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (name: string) => {
    if (name === themeName || themeLoading) return;
    setThemeLoading(true);
    setError('');
    try {
      await setTheme(name);
    } catch (err: any) {
      setError(err.message || 'Failed to update theme');
    } finally {
      setThemeLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {getFeatureName('SETTINGS_PAGE')}
            </Typography>
            <Typography color="text.secondary">{getDescription('SETTINGS_PAGE')}</Typography>
          </Box>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Box>

        <Stack spacing={3}>
          {/* Appearance / Theme Card */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PaletteIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="h6" fontWeight={600}>Appearance</Typography>
              </Box>

              <Grid container spacing={2}>
                {availableThemes.map((t) => (
                  <Grid item xs={6} sm={3} key={t.name}>
                    <Card
                      variant="outlined"
                      sx={{
                        borderColor: themeName === t.name ? 'primary.main' : 'divider',
                        borderWidth: 2,
                        transition: 'border-color 0.2s',
                      }}
                    >
                      <CardActionArea onClick={() => handleThemeChange(t.name)} disabled={themeLoading}>
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '50%',
                              bgcolor: t.swatch,
                              border: t.swatchBorder ? `2px solid ${t.swatchBorder}` : 'none',
                              mx: 'auto',
                              mb: 1.5,
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {themeName === t.name && (
                              <CheckCircleIcon
                                sx={{
                                  color: t.name === 'DARK' || t.name === 'LIGHT' ? (t.name === 'LIGHT' ? '#1976d2' : '#121212') : '#fff',
                                  fontSize: 24,
                                }}
                              />
                            )}
                          </Box>
                          <Typography variant="body2" fontWeight={600}>
                            {t.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t.description}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="h6" fontWeight={600}>Change Password</Typography>
              </Box>
              
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

              <form onSubmit={handleSubmitPassword}>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading} sx={{ alignSelf: 'flex-start' }}>
                    {loading ? 'Changing...' : 'Change Password'}
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>

          {/* Export Data Card */}
          {isFeatureEnabled('EXPORT_JSON') && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DataIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="h6" fontWeight={600}>Export My Data</Typography>
                </Box>

                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Download all your data including profile information and shortened URLs.
                </Typography>
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportData}>
                  Download JSON Export
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Danger Zone Card */}
          <Card sx={{ border: 2, borderColor: 'error.light' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h6" fontWeight={600} color="error.main">Danger Zone</Typography>
              </Box>
              
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Once you delete your account, there is no going back. Please be certain.
              </Typography>
              <Button variant="contained" color="error" startIcon={<DeleteForeverIcon />} onClick={() => setDeleteDialogOpen(true)}>
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </Stack>

        {/* Delete Account Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogContent sx={{ minWidth: 400 }}>
            <Typography sx={{ mb: 2 }}>
              Are you sure you want to delete your account? This action cannot be undone.
            </Typography>
            <TextField
              fullWidth
              label="Enter your password to confirm"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteAccount} color="error" variant="contained" disabled={loading || !deletePassword}>
              {loading ? 'Deleting...' : 'Delete My Account'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity="success">{success}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
