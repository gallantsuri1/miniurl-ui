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
  Paper,
  Chip,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid,
  Stack,
  IconButton,
  Container,
  TablePagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Block as SuspendIcon,
  CheckCircle as ActivateIcon,
  People as PeopleIcon,
  CheckCircleOutline as ActiveIcon,
  DoNotDisturb as SuspendedIcon,
  DeleteOutline as DeletedIcon,
  ArrowBack as ArrowBackIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Header from '../../components/Header';
import { useFeatures } from '../../context/FeatureContext';
import adminService, { UsersQueryParams } from '../../services/adminService';
import { AdminUser, AdminStats, UserStatus } from '../../types';

export default function UserManagementPage() {
  const navigate = useNavigate();
  const { getFeatureName, getDescription } = useFeatures();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalUsers, setTotalUsers] = useState(0);

  // Sorting
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filters
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'suspend' | 'activate'; id: number } | null>(null);

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [page, pageSize, sortBy, sortDirection, statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params: UsersQueryParams = {
        page,
        size: pageSize,
        sortBy,
        sortDirection,
      };
      
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      if (searchQuery && searchQuery.length >= 2) {
        params.search = searchQuery;
      }
      
      const response = await adminService.getAllUsers(params);
      setUsers(response.content);
      setTotalUsers(response.totalElements);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await adminService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPage(0);
  };

  const handleStatusChange = (e: SelectChangeEvent) => {
    setStatusFilter(e.target.value as UserStatus | '');
    setPage(0);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const handleSuspendUser = (id: number) => {
    setConfirmAction({ type: 'suspend', id });
    setConfirmDialogOpen(true);
  };

  const handleActivateUser = (id: number) => {
    setConfirmAction({ type: 'activate', id });
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'suspend') {
        await adminService.suspendUser(confirmAction.id);
      } else {
        await adminService.activateUser(confirmAction.id);
      }
      loadUsers();
      loadStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
    setConfirmDialogOpen(false);
    setConfirmAction(null);
  };

  const handlePageChange = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(Number(event.target.value));
    setPage(0);
  };

  const getStatusChip = (status: UserStatus) => {
    const config: Record<UserStatus, { color: 'success' | 'warning' | 'error'; label: string }> = {
      ACTIVE: { color: 'success', label: 'Active' },
      SUSPENDED: { color: 'warning', label: 'Suspended' },
      DELETED: { color: 'error', label: 'Deleted' },
    };
    const { color, label } = config[status];
    return <Chip label={label} size="small" color={color} />;
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortDirection === 'asc' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />;
  };

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: <PeopleIcon />, color: 'primary' },
    { label: 'Active Users', value: stats?.activeUsers || 0, icon: <ActiveIcon />, color: 'success' },
    { label: 'Suspended Users', value: stats?.suspendedUsers || 0, icon: <SuspendedIcon />, color: 'warning' },
    { label: 'Deleted Users', value: stats?.deletedUsers || 0, icon: <DeletedIcon />, color: 'error' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {getFeatureName('USER_MANAGEMENT')}
            </Typography>
            <Typography color="text.secondary">{getDescription('USER_MANAGEMENT')}</Typography>
          </Box>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Box>

        {/* Error Alert */}
        {error && <Box mb={3}><Chip label={error} color="error" /></Box>}

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {statCards.map((stat, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Paper sx={{ p: 2.5, textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, color: `${stat.color}.main` }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" fontWeight={700} color={`${stat.color}.main`}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Users Table Card */}
        <Card>
          <CardHeader
            title="All Users"
            subheader={`${totalUsers} users found`}
          />
          <CardContent>
            {/* Search and Filter Controls */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
              <TextField
                size="small"
                placeholder="Search users..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchInput && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch}>
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1 }}
              />
              <Button variant="contained" onClick={handleSearch} startIcon={<SearchIcon />}>
                Search
              </Button>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={handleStatusChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterIcon fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="SUSPENDED">Suspended</MenuItem>
                  <MenuItem value="DELETED">Deleted</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* Users Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                    <TableCell 
                      sx={{ fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => handleSort('createdAt')}
                    >
                      Created {renderSortIcon('createdAt')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Last Login</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Typography color="text.secondary">Loading...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Typography color="text.secondary">No users found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell><Typography variant="body2" color="text.secondary">{user.id}</Typography></TableCell>
                        <TableCell><Typography variant="body2" fontWeight={500}>{user.firstName} {user.lastName}</Typography></TableCell>
                        <TableCell><Typography variant="body2">{user.email}</Typography></TableCell>
                        <TableCell><Typography variant="body2">{user.username}</Typography></TableCell>
                        <TableCell>
                          <Chip label={user.roleName} size="small" color={user.roleName === 'ADMIN' ? 'error' : 'primary'} />
                        </TableCell>
                        <TableCell><Typography variant="body2" color="text.secondary">{user.createdAt.substring(0, 10)}</Typography></TableCell>
                        <TableCell><Typography variant="body2" color="text.secondary">{user.lastLogin ? user.lastLogin.substring(0, 10) : 'Never'}</Typography></TableCell>
                        <TableCell>{getStatusChip(user.status)}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button size="small" variant="outlined" startIcon={<ViewIcon />} onClick={() => navigate(`/admin/users/${user.id}`)}>
                              View
                            </Button>
                            {user.status === 'ACTIVE' && user.roleName !== 'ADMIN' && (
                              <Button size="small" color="warning" variant="outlined" startIcon={<SuspendIcon />} onClick={() => handleSuspendUser(user.id)}>
                                Suspend
                              </Button>
                            )}
                            {user.status === 'SUSPENDED' && (
                              <Button size="small" color="success" variant="outlined" startIcon={<ActivateIcon />} onClick={() => handleActivateUser(user.id)}>
                                Activate
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={totalUsers}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={pageSize}
              onRowsPerPageChange={handlePageSizeChange}
              rowsPerPageOptions={[10, 20, 50, 100]}
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`}
            />
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
          <DialogTitle>
            {confirmAction?.type === 'suspend' ? 'Suspend User' : 'Activate User'}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {confirmAction?.type === 'suspend'
                ? 'Are you sure you want to suspend this user? This will prevent them from accessing the system.'
                : 'Are you sure you want to activate this user?'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleConfirmAction}
              color={confirmAction?.type === 'suspend' ? 'warning' : 'success'}
              variant="contained"
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
