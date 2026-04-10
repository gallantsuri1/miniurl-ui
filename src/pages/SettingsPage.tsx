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
  Tooltip,
  Zoom,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  DeleteForever as DeleteForeverIcon,
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
import { validatePasswordForDelete } from '../utils/validation';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { isFeatureEnabled, getFeatureName, getDescription } = useFeatures();
  const { availableThemes, themeName, setTheme } = useThemeContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [themeLoading, setThemeLoading] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletePasswordError, setDeletePasswordError] = useState('');

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

  const handleDeletePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeletePassword(e.target.value);
    setDeletePasswordError('');
  };

  const handleDeletePasswordBlur = () => {
    const error = validatePasswordForDelete(deletePassword);
    if (error) setDeletePasswordError(error);
    else setDeletePasswordError('');
  };

  const handleDeleteAccount = async () => {
    setDeletePasswordError('');
    const error = validatePasswordForDelete(deletePassword);
    if (error) {
      setDeletePasswordError(error);
      return;
    }

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

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {getFeatureName('SETTINGS_PAGE')}
            </Typography>
            <Typography color="text.secondary">{getDescription('SETTINGS_PAGE')}</Typography>
          </Box>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Box>

        <Stack spacing={3}>
          {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

          {/* Appearance / Theme Card */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PaletteIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="h6">Appearance</Typography>
              </Box>

              <Grid container spacing={2}>
                {availableThemes.map((t) => (
                  <Grid item xs={6} sm={3} key={t.name}>
                    <Card
                      variant="outlined"
                      sx={{
                        borderColor: themeName === t.name ? 'primary.main' : 'divider',
                        borderWidth: 2,
                        transition: 'all 0.3s ease',
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

          {/* Export Data Card */}
          {isFeatureEnabled('EXPORT_JSON') && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DataIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="h6">Export My Data</Typography>
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
                <Typography variant="h6" color="error.main">Danger Zone</Typography>
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
        <Dialog open={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); setDeletePasswordError(''); }}>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogContent sx={{ minWidth: 400 }}>
            <Typography sx={{ mb: 2 }}>
              Are you sure you want to delete your account? This action cannot be undone.
            </Typography>
            <Tooltip title={deletePasswordError || ''} open={!!deletePasswordError} placement="top" arrow TransitionComponent={Zoom}>
              <TextField
                fullWidth
                label="Enter your password to confirm"
                type="password"
                value={deletePassword}
                onChange={handleDeletePasswordChange}
                onBlur={handleDeletePasswordBlur}
                required
                error={!!deletePasswordError}
                inputProps={{ maxLength: 255 }}
              />
            </Tooltip>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setDeleteDialogOpen(false); setDeletePasswordError(''); }}>Cancel</Button>
            <Tooltip title={deletePasswordError || ''} open={!!deletePasswordError} placement="top" arrow TransitionComponent={Zoom}>
              <Button onClick={handleDeleteAccount} color="error" variant="contained" disabled={loading || !deletePassword || deletePassword.length < 8}>
                {loading ? 'Deleting...' : 'Delete My Account'}
              </Button>
            </Tooltip>
          </DialogActions>
        </Dialog>

        <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
          <Alert severity="success">{success}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
