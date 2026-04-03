import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Switch,
  Grid,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Container,
  Tooltip,
  IconButton,
  TextField,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import {
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Flag as FlagIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Header from '../../components/Header';
import { useFeatures } from '../../context/FeatureContext';
import featureService from '../../services/featureService';
import { Feature } from '../../types';

interface RoleFeature {
  featureKey: string;
  featureName: string;
  description: string;
  adminEnabled: boolean;
  adminId?: number;
  userEnabled: boolean;
  userId?: number;
}

interface AddFeatureFormData {
  featureKey: string;
  featureName: string;
  description: string;
  adminEnabled: boolean;
  userEnabled: boolean;
}

interface AddGlobalFeatureFormData {
  featureKey: string;
  featureName: string;
  description: string;
  enabled: boolean;
}

export default function FeatureFlagsPage() {
  const navigate = useNavigate();
  const { getFeatureName, getDescription } = useFeatures();
  const [roleFeatures, setRoleFeatures] = useState<RoleFeature[]>([]);
  const [globalFeatures, setGlobalFeatures] = useState<Feature[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Confirmation dialog states
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<{
    type: 'role' | 'global';
    id: number;
    featureKey: string;
    featureName: string;
    enabled: boolean;
    role?: 'admin' | 'user';
  } | null>(null);
  
  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    type: 'role' | 'global';
    id: number;
    featureName: string;
  } | null>(null);
  
  // Add dialog states
  const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false);
  const [addGlobalDialogOpen, setAddGlobalDialogOpen] = useState(false);
  const [addRoleFormData, setAddRoleFormData] = useState<AddFeatureFormData>({
    featureKey: '',
    featureName: '',
    description: '',
    adminEnabled: true,
    userEnabled: true,
  });
  const [addGlobalFormData, setAddGlobalFormData] = useState<AddGlobalFeatureFormData>({
    featureKey: '',
    featureName: '',
    description: '',
    enabled: true,
  });

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      // Load role-based features
      const allFeatures = await featureService.getAllFeatures();
      
      // Group features by featureKey to get both admin and user roles
      const finalRoleFeatures: RoleFeature[] = [];
      const processedKeys = new Set<string>();

      allFeatures.forEach(feature => {
        if (processedKeys.has(feature.featureKey)) return;
        processedKeys.add(feature.featureKey);

        const adminFeature = allFeatures.find(f => f.featureKey === feature.featureKey && f.roleName === 'ADMIN');
        const userFeature = allFeatures.find(f => f.featureKey === feature.featureKey && f.roleName === 'USER');

        finalRoleFeatures.push({
          featureKey: feature.featureKey,
          featureName: feature.featureName,
          description: feature.description,
          adminEnabled: adminFeature?.enabled ?? false,
          adminId: adminFeature?.id,
          userEnabled: userFeature?.enabled ?? false,
          userId: userFeature?.id,
        });
      });

      setRoleFeatures(finalRoleFeatures);
      
      // Load global features
      const globalFeaturesData = await featureService.getManagedGlobalFeatures();
      setGlobalFeatures(globalFeaturesData);
    } catch (err: any) {
      console.error('Failed to load features:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to load features');
      }
    }
  };

  const handleRoleFeatureToggle = (
    featureKey: string,
    featureName: string,
    roleId: number | undefined,
    currentEnabled: boolean,
    role: 'admin' | 'user'
  ) => {
    // Special handling for DASHBOARD feature when disabling
    if (featureKey === 'DASHBOARD' && !currentEnabled && roleId) {
      setPendingToggle({
        type: 'role',
        id: roleId,
        featureKey,
        featureName,
        enabled: currentEnabled,
        role
      });
      setConfirmDialogOpen(true);
    } else if (roleId) {
      confirmToggle('role', roleId, featureKey, currentEnabled, role);
    }
  };

  const handleGlobalFeatureToggle = (
    id: number,
    _featureKey: string,
    _featureName: string,
    currentEnabled: boolean
  ) => {
    confirmToggle('global', id, _featureKey, currentEnabled);
  };

  const confirmToggle = async (
    type: 'role' | 'global',
    id: number,
    _featureKey: string,
    currentEnabled: boolean,
    _role?: 'admin' | 'user'
  ) => {
    try {
      if (type === 'role') {
        await featureService.toggleFeatureById(id, !currentEnabled);
      } else {
        await featureService.toggleGlobalFeatureById(id, !currentEnabled);
      }
      
      setSuccess(`Feature ${!currentEnabled ? 'enabled' : 'disabled'} successfully`);
      loadFeatures();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle feature');
    }
    setConfirmDialogOpen(false);
    setPendingToggle(null);
  };

  const handleDelete = (type: 'role' | 'global', id: number, featureName: string) => {
    setPendingDelete({ type, id, featureName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    
    try {
      if (pendingDelete.type === 'role') {
        await featureService.deleteFeature(pendingDelete.id);
      } else {
        await featureService.deleteGlobalFeature(pendingDelete.id);
      }
      
      setSuccess('Feature deleted successfully');
      loadFeatures();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete feature');
    }
    setDeleteDialogOpen(false);
    setPendingDelete(null);
  };

  const handleAddRoleFeature = async () => {
    try {
      await featureService.createFeature(addRoleFormData);
      setSuccess('Feature created successfully');
      loadFeatures();
      setAddRoleDialogOpen(false);
      setAddRoleFormData({
        featureKey: '',
        featureName: '',
        description: '',
        adminEnabled: true,
        userEnabled: true,
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create feature');
    }
  };

  const handleAddGlobalFeature = async () => {
    try {
      await featureService.createGlobalFeature(addGlobalFormData);
      setSuccess('Global feature created successfully');
      loadFeatures();
      setAddGlobalDialogOpen(false);
      setAddGlobalFormData({
        featureKey: '',
        featureName: '',
        description: '',
        enabled: true,
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create global feature');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      <Header />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <FlagIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="h4" fontWeight={700}>
                {getFeatureName('FEATURE_MANAGEMENT')}
              </Typography>
            </Box>
            <Typography color="text.secondary">{getDescription('FEATURE_MANAGEMENT')}</Typography>
          </Box>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        {/* Warning Banner */}
        <Alert severity="warning" sx={{ mb: 4 }}>
          <strong>⚠️ Caution:</strong> Changes take effect immediately for all users. 
          Disabling critical features like DASHBOARD will impact user experience.
        </Alert>

        <Grid container spacing={3}>
          {/* Role-Based Features Section */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="🔐 Role-Based Features"
                subheader="Control feature access for Admin and User roles"
                action={
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setAddRoleDialogOpen(true)}
                  >
                    Add Feature
                  </Button>
                }
              />
              <CardContent sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>Feature Name</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: 250 }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: 120, textAlign: 'center' }}>Admin</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: 120, textAlign: 'center' }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: 100, textAlign: 'center' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {roleFeatures.map((feature) => (
                        <TableRow key={feature.featureKey} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>{feature.featureName}</Typography>
                              <Chip
                                label={feature.featureKey}
                                size="small"
                                sx={{
                                  mt: 0.5,
                                  fontSize: '0.7rem',
                                  height: 20,
                                  bgcolor: 'grey.100',
                                  '& .MuiChip-label': { px: 1 }
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">{feature.description}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title={!feature.adminId ? 'Feature value not found for Admin role' : ''}>
                              <span>
                                <Switch
                                  checked={feature.adminEnabled}
                                  onChange={() => handleRoleFeatureToggle(
                                    feature.featureKey,
                                    feature.featureName,
                                    feature.adminId,
                                    feature.adminEnabled,
                                    'admin'
                                  )}
                                  color="primary"
                                  disabled={!feature.adminId}
                                  sx={{
                                    '& .MuiSwitch-switchBase.Mui-disabled': {
                                      color: !feature.adminId ? '#d32f2f' : undefined,
                                    },
                                    '& .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track': {
                                      bgcolor: !feature.adminId ? 'rgba(211, 47, 47, 0.3)' : undefined,
                                    },
                                  }}
                                />
                              </span>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title={!feature.userId ? 'Feature value not found for User role' : ''}>
                              <span>
                                <Switch
                                  checked={feature.userEnabled}
                                  onChange={() => handleRoleFeatureToggle(
                                    feature.featureKey,
                                    feature.featureName,
                                    feature.userId,
                                    feature.userEnabled,
                                    'user'
                                  )}
                                  color="primary"
                                  disabled={!feature.userId}
                                  sx={{
                                    '& .MuiSwitch-switchBase.Mui-disabled': {
                                      color: !feature.userId ? '#d32f2f' : undefined,
                                    },
                                    '& .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track': {
                                      bgcolor: !feature.userId ? 'rgba(211, 47, 47, 0.3)' : undefined,
                                    },
                                  }}
                                />
                              </span>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Delete feature">
                              <IconButton
                                onClick={() => handleDelete('role', feature.adminId || feature.userId || 0, feature.featureName)}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Global Features Section */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="🌍 Global Features"
                subheader="Features that apply globally (not role-specific)"
                action={
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setAddGlobalDialogOpen(true)}
                  >
                    Add Feature
                  </Button>
                }
              />
              <CardContent sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>Feature Name</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: 250 }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: 150, textAlign: 'center' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: 120, textAlign: 'center' }}>Toggle</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: 100, textAlign: 'center' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {globalFeatures.map((feature) => (
                        <TableRow key={feature.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>{feature.featureName}</Typography>
                              <Chip
                                label={feature.featureKey}
                                size="small"
                                sx={{
                                  mt: 0.5,
                                  fontSize: '0.7rem',
                                  height: 20,
                                  bgcolor: 'grey.100',
                                  '& .MuiChip-label': { px: 1 }
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">{feature.description}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              icon={feature.enabled ? <ToggleOnIcon /> : <ToggleOffIcon />}
                              label={feature.enabled ? 'ENABLED' : 'DISABLED'}
                              size="small"
                              color={feature.enabled ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Switch
                              checked={feature.enabled}
                              onChange={() => handleGlobalFeatureToggle(
                                feature.id,
                                feature.featureKey,
                                feature.featureName,
                                feature.enabled
                              )}
                              color="primary"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Delete feature">
                              <IconButton
                                onClick={() => handleDelete('global', feature.id, feature.featureName)}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature Summary */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  📊 Feature Summary
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, mt: 2, flexWrap: 'wrap' }}>
                  <Typography>
                    <strong style={{ color: '#1976d2' }}>{roleFeatures.length}</strong> Role-Based Features
                  </Typography>
                  <Typography>
                    <strong style={{ color: '#1976d2' }}>{globalFeatures.length}</strong> Global Features
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Confirmation Dialog for Toggle */}
        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
          <DialogTitle>⚠️ Warning: Disable Dashboard</DialogTitle>
          <DialogContent sx={{ minWidth: 400 }}>
            <Typography>
              Disabling the <strong>DASHBOARD</strong> feature will impact all users!
              They will not be able to access their dashboard.
            </Typography>
            <Typography sx={{ mt: 2 }}>
              Are you sure you want to disable this feature?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => pendingToggle && confirmToggle(
                pendingToggle.type,
                pendingToggle.id,
                pendingToggle.featureKey,
                pendingToggle.enabled,
                pendingToggle.role
              )}
              color="error"
              variant="contained"
            >
              Disable
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog for Delete */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>⚠️ Warning: Delete Feature</DialogTitle>
          <DialogContent sx={{ minWidth: 400 }}>
            <Typography>
              Are you sure you want to delete the feature <strong>{pendingDelete?.featureName}</strong>?
            </Typography>
            <Typography sx={{ mt: 2, color: 'error.main' }}>
              This action cannot be undone and will remove the feature for all users.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={confirmDelete}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Role-Based Feature Dialog */}
        <Dialog open={addRoleDialogOpen} onClose={() => setAddRoleDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Role-Based Feature</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                fullWidth
                label="Feature Key"
                value={addRoleFormData.featureKey}
                onChange={(e) => setAddRoleFormData({ ...addRoleFormData, featureKey: e.target.value })}
                placeholder="e.g., ANALYTICS_PAGE"
                required
              />
              <TextField
                fullWidth
                label="Feature Name"
                value={addRoleFormData.featureName}
                onChange={(e) => setAddRoleFormData({ ...addRoleFormData, featureName: e.target.value })}
                placeholder="e.g., Analytics Page"
                required
              />
              <TextField
                fullWidth
                label="Description"
                value={addRoleFormData.description}
                onChange={(e) => setAddRoleFormData({ ...addRoleFormData, description: e.target.value })}
                placeholder="Describe the feature..."
                multiline
                rows={2}
                required
              />
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={addRoleFormData.adminEnabled}
                      onChange={(e) => setAddRoleFormData({ ...addRoleFormData, adminEnabled: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Enabled for Admin"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={addRoleFormData.userEnabled}
                      onChange={(e) => setAddRoleFormData({ ...addRoleFormData, userEnabled: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Enabled for User"
                />
              </FormGroup>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddRoleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddRoleFeature} variant="contained" color="primary">
              Add Feature
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Global Feature Dialog */}
        <Dialog open={addGlobalDialogOpen} onClose={() => setAddGlobalDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Global Feature</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                fullWidth
                label="Feature Key"
                value={addGlobalFormData.featureKey}
                onChange={(e) => setAddGlobalFormData({ ...addGlobalFormData, featureKey: e.target.value })}
                placeholder="e.g., BETA_FEATURE"
                required
              />
              <TextField
                fullWidth
                label="Feature Name"
                value={addGlobalFormData.featureName}
                onChange={(e) => setAddGlobalFormData({ ...addGlobalFormData, featureName: e.target.value })}
                placeholder="e.g., Beta Feature"
                required
              />
              <TextField
                fullWidth
                label="Description"
                value={addGlobalFormData.description}
                onChange={(e) => setAddGlobalFormData({ ...addGlobalFormData, description: e.target.value })}
                placeholder="Describe the feature..."
                multiline
                rows={2}
                required
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={addGlobalFormData.enabled}
                    onChange={(e) => setAddGlobalFormData({ ...addGlobalFormData, enabled: e.target.checked })}
                    color="primary"
                  />
                }
                label="Enabled by default"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddGlobalDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddGlobalFeature} variant="contained" color="primary">
              Add Feature
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
