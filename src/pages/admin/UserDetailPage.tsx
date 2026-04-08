import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  Chip,
  Button,
  Container,
  Grid,
  Paper,
  CircularProgress,
  Divider,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  AccountCircle as UsernameIcon,
  AdminPanelSettings as AdminIcon,
  CalendarToday as CalendarIcon,
  Login as LoginIcon,
  CheckCircle as ActiveIcon,
  DoNotDisturb as SuspendedIcon,
  DeleteOutline as DeletedIcon,
} from '@mui/icons-material';
import Header from '../../components/Header';
import adminService from '../../services/adminService';
import { AdminUser, UserStatus } from '../../types';

export default function UserDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('User ID is required');
      setLoading(false);
      return;
    }
    loadUser(parseInt(id, 10));
  }, [id]);

  const loadUser = async (userId: number) => {
    setLoading(true);
    setError('');
    try {
      const userData = await adminService.getUserById(userId);
      setUser(userData);
    } catch (err: any) {
      console.error('Failed to load user details:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to load user details');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status: UserStatus) => {
    const config: Record<UserStatus, { color: 'success' | 'warning' | 'error'; label: string; icon: JSX.Element }> = {
      ACTIVE: { color: 'success', label: 'Active', icon: <ActiveIcon sx={{ fontSize: 16 }} /> },
      SUSPENDED: { color: 'warning', label: 'Suspended', icon: <SuspendedIcon sx={{ fontSize: 16 }} /> },
      DELETED: { color: 'error', label: 'Deleted', icon: <DeletedIcon sx={{ fontSize: 16 }} /> },
    };
    const { color, label, icon } = config[status];
    return <Chip label={label} color={color} icon={icon} sx={{ fontWeight: 600 }} />;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Header />
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress />
          </Box>
        </Container>
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Header />
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                User Details
              </Typography>
            </Box>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/users')}>
              Back to User Management
            </Button>
          </Box>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" color="error" gutterBottom>
              {error || 'User not found'}
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              User Details
            </Typography>
            <Typography color="text.secondary">
              Viewing details for user <strong>{user.username}</strong>
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/users')}>
            Back to User Management
          </Button>
        </Box>

        {/* User Info Cards */}
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Personal Information
                  </Box>
                }
              />
              <CardContent>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      Full Name
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {user.firstName} {user.lastName}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      Email Address
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body1">{user.email}</Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      Username
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <UsernameIcon fontSize="small" color="action" />
                      <Typography variant="body1" fontWeight={500}>
                        {user.username}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Account Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AdminIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Account Information
                  </Box>
                }
              />
              <CardContent>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      User ID
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      #{user.id}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      Role
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={user.roleName}
                        color={user.roleName === 'ADMIN' ? 'error' : 'primary'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      Status
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      {getStatusChip(user.status)}
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Activity Information */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Activity Information
                  </Box>
                }
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2.5, textAlign: 'center', bgcolor: 'grey.50' }}>
                      <CalendarIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={500} display="block">
                        Account Created
                      </Typography>
                      <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                        {formatDate(user.createdAt)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2.5, textAlign: 'center', bgcolor: 'grey.50' }}>
                      <LoginIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={500} display="block">
                        Last Login
                      </Typography>
                      <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                        {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
