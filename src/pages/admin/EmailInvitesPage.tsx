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
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
  Grid,
  Paper,
  Container,
  TablePagination,
} from '@mui/material';
import {
  Send as SendIcon,
  Cancel as RevokeIcon,
  FilterList as FilterIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import Header from '../../components/Header';
import { useFeatures } from '../../context/FeatureContext';
import emailInviteService, { EmailInvitesQueryParams } from '../../services/emailInviteService';
import { EmailInvite } from '../../types';

export default function EmailInvitesPage() {
  const navigate = useNavigate();
  const { getFeatureName, getDescription } = useFeatures();
  const [invites, setInvites] = useState<EmailInvite[]>([]);
  const [stats, setStats] = useState<{ total: number; pending: number; accepted: number; revoked?: number; expired?: number } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalInvites, setTotalInvites] = useState(0);

  // Sorting
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchInput, setSearchInput] = useState('');

  // Dialogs
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [inviteToRevoke, setInviteToRevoke] = useState<{id: number; email: string} | null>(null);
  const [resendDialogOpen, setResendDialogOpen] = useState(false);
  const [inviteToResend, setInviteToResend] = useState<{id: number; email: string} | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    loadInvites();
  }, [page, pageSize, sortBy, sortDirection]);

  const loadInvites = async () => {
    setLoading(true);
    try {
      const params: EmailInvitesQueryParams = {
        page,
        size: pageSize,
        sortBy,
        sortDirection,
      };
      
      const response = await emailInviteService.getAllInvites(params);
      setInvites(response.content);
      setStats(response.stats);
      setTotalInvites(response.totalElements);
    } catch (err: any) {
      console.error('Failed to load invites:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to load invites');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    try {
      await emailInviteService.sendInvite(inviteEmail);
      setSuccess('Invite sent successfully');
      setSendDialogOpen(false);
      setInviteEmail('');
      loadInvites();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send invite');
      setSendDialogOpen(false);
    }
  };

  const handleRevokeClick = (id: number, email: string) => {
    setInviteToRevoke({ id, email });
    setRevokeDialogOpen(true);
  };

  const handleRevokeConfirm = async () => {
    if (!inviteToRevoke) return;
    try {
      await emailInviteService.revokeInvite(inviteToRevoke.id);
      setSuccess('Invite revoked successfully');
      loadInvites();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to revoke invite');
    }
    setRevokeDialogOpen(false);
    setInviteToRevoke(null);
  };

  const handleResendClick = (id: number, email: string) => {
    setInviteToResend({ id, email });
    setResendDialogOpen(true);
  };

  const handleResendConfirm = async () => {
    if (!inviteToResend || resending) return;
    
    setResending(true);
    try {
      await emailInviteService.resendInvite(inviteToResend.id);
      setSuccess('Invite resent successfully');
      loadInvites();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend invite');
    } finally {
      setResending(false);
      setResendDialogOpen(false);
      setInviteToResend(null);
    }
  };

  const handleStatusChange = (e: SelectChangeEvent) => {
    setStatusFilter(e.target.value);
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

  const handlePageChange = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(Number(event.target.value));
    setPage(0);
  };

  const getStatusChip = (invite: EmailInvite) => {
    const statusColors: Record<string, 'warning' | 'success' | 'default' | 'error'> = {
      PENDING: 'warning',
      ACCEPTED: 'success',
      REVOKED: 'default',
      EXPIRED: 'error',
    };
    const color = statusColors[invite.status] || 'default';
    return <Chip label={invite.status} size="small" color={color} />;
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortDirection === 'asc' ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />;
  };

  const filteredInvites = invites.filter((invite) => {
    const matchesStatus = statusFilter === 'all' || invite.status === statusFilter;
    const matchesSearch = !searchInput || invite.email.toLowerCase().includes(searchInput.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {getFeatureName('EMAIL_INVITE')}
            </Typography>
            <Typography color="text.secondary">{getDescription('EMAIL_INVITE')}</Typography>
          </Box>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Box>

        {/* Error/Success Alerts */}
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={2.4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="primary">{stats.total}</Typography>
                <Typography variant="body2" color="text.secondary">Total Invites</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={2.4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="warning.main">{stats.pending}</Typography>
                <Typography variant="body2" color="text.secondary">Pending</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={2.4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="success.main">{stats.accepted}</Typography>
                <Typography variant="body2" color="text.secondary">Accepted</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={2.4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="text.secondary">{stats.revoked || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Revoked</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={2.4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="error.main">{stats.expired || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Expired</Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Send Invite Card */}
        <Card sx={{ mb: 4 }}>
          <CardHeader title="Send New Invitation" subheader="Invitation will be valid for 7 days" />
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end">
              <TextField
                fullWidth
                label="Email Address *"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
                required
                sx={{ flexGrow: 1, minWidth: 300 }}
              />
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={() => setSendDialogOpen(true)}
                disabled={!inviteEmail}
              >
                Send Invitation
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Invites Table Card */}
        <Card>
          <CardHeader
            title="Invitation History"
            subheader={`${totalInvites} invitations found`}
          />
          <CardContent>
            {/* Filter Controls */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
              <TextField
                size="small"
                placeholder="Search by email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setSearchInput((e.target as HTMLInputElement).value);
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1 }}
              />
              <Button variant="contained" onClick={() => setSearchInput(searchInput)} startIcon={<FilterIcon />}>
                Search
              </Button>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Filter by Status"
                  onChange={handleStatusChange}
                >
                  <MenuItem value="all">All Invites</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="ACCEPTED">Accepted</MenuItem>
                  <MenuItem value="REVOKED">Revoked</MenuItem>
                  <MenuItem value="EXPIRED">Expired</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* Invites Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Invited By</TableCell>
                    <TableCell
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleSort('createdAt')}
                    >
                      Sent Date {renderSortIcon('createdAt')}
                    </TableCell>
                    <TableCell
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleSort('expiresAt')}
                    >
                      Expires {renderSortIcon('expiresAt')}
                    </TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary">Loading...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredInvites.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary">No invitations found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvites.map((invite) => (
                      <TableRow key={invite.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">{invite.email}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell><Typography variant="body2">{invite.invitedBy || 'System'}</Typography></TableCell>
                        <TableCell><Typography variant="body2" color="text.secondary">{invite.createdAt.substring(0, 10)}</Typography></TableCell>
                        <TableCell><Typography variant="body2" color="text.secondary">{invite.expiresAt.substring(0, 10)}</Typography></TableCell>
                        <TableCell>{getStatusChip(invite)}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            {invite.status === 'PENDING' && (
                              <Button
                                size="small"
                                color="error"
                                startIcon={<RevokeIcon />}
                                onClick={() => handleRevokeClick(invite.id, invite.email)}
                              >
                                Revoke
                              </Button>
                            )}
                            {(invite.status === 'REVOKED' || invite.status === 'EXPIRED') && (
                              <Button
                                size="small"
                                color="primary"
                                onClick={() => handleResendClick(invite.id, invite.email)}
                              >
                                📧 Resend
                              </Button>
                            )}
                            {invite.status === 'ACCEPTED' && (
                              <Typography variant="body2" color="success.main">✓ Accepted</Typography>
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
              count={totalInvites}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={pageSize}
              onRowsPerPageChange={handlePageSizeChange}
              rowsPerPageOptions={[10, 20, 50, 100]}
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`}
            />
          </CardContent>
        </Card>

        {/* Send Invite Dialog */}
        <Dialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)}>
          <DialogTitle>Send Email Invitation</DialogTitle>
          <DialogContent sx={{ minWidth: 400 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="user@example.com"
              required
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSendDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" startIcon={<SendIcon />} onClick={handleSendInvite} disabled={!inviteEmail}>
              Send Invite
            </Button>
          </DialogActions>
        </Dialog>

        {/* Revoke Confirmation Dialog */}
        <Dialog open={revokeDialogOpen} onClose={() => setRevokeDialogOpen(false)}>
          <DialogTitle>Revoke Invitation</DialogTitle>
          <DialogContent sx={{ minWidth: 400 }}>
            <Typography>
              Are you sure you want to revoke the invitation for <strong>{inviteToRevoke?.email}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRevokeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRevokeConfirm} color="error" variant="contained">
              Revoke
            </Button>
          </DialogActions>
        </Dialog>

        {/* Resend Confirmation Dialog */}
        <Dialog open={resendDialogOpen} onClose={() => !resending && setResendDialogOpen(false)}>
          <DialogTitle>Resend Invitation</DialogTitle>
          <DialogContent sx={{ minWidth: 400 }}>
            <Typography>
              Resend invitation to <strong>{inviteToResend?.email}</strong>? This will create a new invitation with a fresh 7-day expiry.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => !resending && setResendDialogOpen(false)} disabled={resending}>
              Cancel
            </Button>
            <Button 
              onClick={handleResendConfirm} 
              color="primary" 
              variant="contained"
              disabled={resending}
            >
              {resending ? 'Resending...' : 'Resend'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
