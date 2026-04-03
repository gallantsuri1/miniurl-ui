import { useState, useEffect } from 'react';
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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Container,
  Tooltip,
  Zoom,
  TablePagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import Header from '../components/Header';
import urlService from '../services/urlService';
import { useFeatures } from '../context/FeatureContext';
import { Url, UrlStats, CreateUrlRequest } from '../types';

export default function DashboardPage() {
  const { isFeatureEnabled, getFeatureName } = useFeatures();
  const [urls, setUrls] = useState<Url[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [formData, setFormData] = useState({ url: '', alias: '' });

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalUrls, setTotalUrls] = useState(0);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [urlStats, setUrlStats] = useState<UrlStats | null>(null);
  const [limitsDialogOpen, setLimitsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [urlToDelete, setUrlToDelete] = useState<number | null>(null);

  // Tooltip states
  const [shortenTooltipOpen, setShortenTooltipOpen] = useState(false);
  const [copyTooltipOpen, setCopyTooltipOpen] = useState<number | null>(null);
  const [limitTooltipOpen, setLimitTooltipOpen] = useState(false);
  const [limitError, setLimitError] = useState('');

  useEffect(() => {
    loadUrls();
    loadStats();
  }, [page, pageSize, searchQuery]);

  const loadUrls = async () => {
    // Only show loading on initial load, keep data visible on sort/filter
    if (isInitialLoad) {
      setLoading(true);
    }
    try {
      const response = await urlService.getUrls({
        page,
        size: pageSize,
        search: searchQuery || undefined,
      });
      setUrls(response.content || []);
      setTotalUrls(response.totalElements || 0);
      setIsInitialLoad(false);
    } catch (err: any) {
      console.error('Error loading URLs:', err);
      setError(err.response?.data?.message || 'Failed to load URLs');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await urlService.getUsageStats();
      setUrlStats(stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear limit error when user starts typing
    if (limitError) {
      setLimitError('');
      setLimitTooltipOpen(false);
    }
  };

  const handleCreateUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLimitError('');

    try {
      const data: CreateUrlRequest = {
        url: formData.url,
        ...(formData.alias && { alias: formData.alias }),
      };
      await urlService.createUrl(data);
      setFormData({ url: '', alias: '' });
      setPage(0);
      loadUrls();
      loadStats();

      // Show success tooltip
      setShortenTooltipOpen(true);
      setTimeout(() => setShortenTooltipOpen(false), 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create URL';
      
      // Check if it's a limit error
      if (errorMessage.toLowerCase().includes('limit') || errorMessage.toLowerCase().includes('rate')) {
        setLimitError(errorMessage);
        setLimitTooltipOpen(true);
        setTimeout(() => setLimitTooltipOpen(false), 5000);
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleDeleteClick = (id: number) => {
    setUrlToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!urlToDelete) return;
    try {
      await urlService.deleteUrl(urlToDelete);
      setSuccess('URL deleted successfully');
      loadUrls();
      loadStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete URL');
    }
    setDeleteDialogOpen(false);
    setUrlToDelete(null);
  };

  const handleCopyUrl = (id: number, shortUrl: string) => {
    navigator.clipboard.writeText(shortUrl);
    setCopyTooltipOpen(id);
    setTimeout(() => setCopyTooltipOpen(null), 2000);
  };

  const handleSearch = () => {
    setSearchQuery(search);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearch('');
    setSearchQuery('');
    setPage(0);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(Number(event.target.value));
    setPage(0);
  };

  const handlePageChange = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      <Header />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Page Title */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {getFeatureName('DASHBOARD')}
          </Typography>
          <Typography color="text.secondary">Create and manage your short URLs</Typography>
        </Box>

        {/* Create URL Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Create Short URL
              </Typography>
              <InfoIcon
                onClick={() => setLimitsDialogOpen(true)}
                sx={{
                  ml: 1,
                  color: 'primary.main',
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'primary.dark',
                  },
                }}
              />
            </Box>

            <form onSubmit={handleCreateUrl}>
              <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={12} md={7}>
                  <Tooltip
                    title={limitError || 'Limit reached'}
                    open={limitTooltipOpen}
                    TransitionComponent={Zoom}
                    placement="top"
                    arrow
                    componentsProps={{
                      tooltip: {
                        sx: {
                          bgcolor: 'error.main',
                          color: 'error.contrastText',
                          fontWeight: 500,
                        },
                      },
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Long URL"
                      name="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      placeholder="https://example.com/very/long/url"
                      required
                      type="url"
                      error={!!limitError}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: limitError ? 'error.main' : undefined,
                          },
                          '&:hover fieldset': {
                            borderColor: limitError ? 'error.main' : undefined,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: limitError ? 'error.main' : undefined,
                          },
                        },
                      }}
                    />
                  </Tooltip>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Custom Alias (optional)"
                    name="alias"
                    value={formData.alias}
                    onChange={handleInputChange}
                    placeholder="my-link"
                    inputProps={{ minLength: 3 }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  {isFeatureEnabled('URL_SHORTENING') && (
                    <Tooltip
                      title="URL shortened successfully!"
                      open={shortenTooltipOpen}
                      TransitionComponent={Zoom}
                      placement="top"
                      arrow
                    >
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        startIcon={<AddIcon />}
                        sx={{ height: 56 }}
                      >
                        Shorten
                      </Button>
                    </Tooltip>
                  )}
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        {/* URL List Card */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                Your URLs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ({totalUrls} URLs)
              </Typography>
            </Box>

            {/* Search Controls */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search URLs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button variant="contained" onClick={handleSearch} startIcon={<SearchIcon />}>
                  Search
                </Button>
                {searchQuery && (
                  <Button variant="outlined" onClick={handleClearSearch} startIcon={<RefreshIcon />}>
                    Clear
                  </Button>
                )}
              </Box>
            </Stack>

            {/* Loading Indicator - subtle top bar during refresh */}
            {loading && !isInitialLoad && (
              <Box sx={{ height: 3, bgcolor: 'grey.200', mb: 2, borderRadius: 1, overflow: 'hidden' }}>
                <Box sx={{
                  height: '100%',
                  width: '30%',
                  bgcolor: 'primary.main',
                  animation: 'loading 1s ease-in-out infinite',
                  '@keyframes loading': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(400%)' },
                  },
                }} />
              </Box>
            )}

            {/* Initial Loading State */}
            {isInitialLoad && (
              <Box textAlign="center" py={8}>
                <Typography color="text.secondary">Loading URLs...</Typography>
              </Box>
            )}

            {/* Empty State */}
            {!isInitialLoad && urls.length === 0 && (
              <Box textAlign="center" py={8}>
                <Typography color="text.secondary">
                  {searchQuery ? `No URLs found matching "${searchQuery}"` : 'No URLs yet. Create your first short URL above!'}
                </Typography>
              </Box>
            )}

            {/* URLs Table */}
            {(!isInitialLoad || urls.length > 0) && urls.length > 0 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '150px' }}>Short URL</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Original URL</TableCell>
                      <TableCell sx={{ fontWeight: 600, width: '100px' }}>Clicks</TableCell>
                      <TableCell sx={{ fontWeight: 600, width: '120px' }}>Created</TableCell>
                      <TableCell sx={{ fontWeight: 600, width: '100px' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {urls.map((url) => (
                      <TableRow key={url.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color="primary"
                              sx={{
                                cursor: 'pointer',
                                '&:hover': {
                                  color: 'primary.dark',
                                },
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(url.shortUrl, '_blank', 'noopener,noreferrer');
                              }}
                            >
                              {url.shortCode.replace(/_/g, ' ')}
                            </Typography>
                            <Tooltip
                              title="URL Copied to clipboard!"
                              open={copyTooltipOpen === url.id}
                              TransitionComponent={Zoom}
                              placement="top"
                              arrow
                            >
                              <IconButton size="small" onClick={() => handleCopyUrl(url.id, url.shortUrl)}>
                                <CopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={url.originalUrl}
                          >
                            {url.originalUrl}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={url.accessCount} size="small" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {url.createdAt.substring(0, 10)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteClick(url.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Pagination */}
            <TablePagination
              component="div"
              count={totalUrls}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={pageSize}
              onRowsPerPageChange={handlePageSizeChange}
              rowsPerPageOptions={[5, 10, 20, 50]}
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`}
            />
          </CardContent>
        </Card>

        {/* URL Limits Dialog */}
        <Dialog 
          open={limitsDialogOpen} 
          onClose={() => setLimitsDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
              URL Creation Limits
            </Box>
            <IconButton onClick={() => setLimitsDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {urlStats && (
              <Box>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  To ensure fair usage, each user has the following URL creation limits:
                </Typography>
                <Grid container spacing={3}>
                  {/* Minute Card - Red if minute OR daily OR monthly limit reached */}
                  <Grid item xs={12} sm={4}>
                    <Card
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: (urlStats.minuteRemaining <= 0 || urlStats.dailyRemaining <= 0 || urlStats.monthlyRemaining <= 0) ? 'error.light' : 'grey.50',
                        border: (urlStats.minuteRemaining <= 0 || urlStats.dailyRemaining <= 0 || urlStats.monthlyRemaining <= 0) ? 2 : 0,
                        borderColor: (urlStats.minuteRemaining <= 0 || urlStats.dailyRemaining <= 0 || urlStats.monthlyRemaining <= 0) ? 'error.main' : 'transparent',
                        overflow: 'hidden',
                      }}
                    >
                      <AccessTimeIcon
                        sx={{
                          fontSize: 36,
                          color: (urlStats.minuteRemaining <= 0 || urlStats.dailyRemaining <= 0 || urlStats.monthlyRemaining <= 0) ? 'error.contrastText' : 'primary.main',
                          mb: 1
                        }}
                      />
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color={(urlStats.minuteRemaining <= 0 || urlStats.dailyRemaining <= 0 || urlStats.monthlyRemaining <= 0) ? 'error.contrastText' : 'primary.main'}
                        sx={{
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                        }}
                      >
                        {urlStats.minuteRemaining <= 0 || urlStats.dailyRemaining <= 0 || urlStats.monthlyRemaining <= 0 ? urlStats.minuteLimit : urlStats.minuteCount}/{urlStats.minuteLimit}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        color={(urlStats.minuteRemaining <= 0 || urlStats.dailyRemaining <= 0 || urlStats.monthlyRemaining <= 0) ? 'error.contrastText' : 'text.secondary'}
                        sx={{ mt: 0.5 }}
                      >
                        Per Minute
                      </Typography>
                      <Typography
                        variant="caption"
                        color={(urlStats.minuteRemaining <= 0 || urlStats.dailyRemaining <= 0 || urlStats.monthlyRemaining <= 0) ? 'error.contrastText' : 'text.secondary'}
                        fontWeight={(urlStats.minuteRemaining <= 0 || urlStats.dailyRemaining <= 0 || urlStats.monthlyRemaining <= 0) ? 600 : 400}
                      >
                        {(urlStats.minuteRemaining <= 0 || urlStats.dailyRemaining <= 0 || urlStats.monthlyRemaining <= 0) ? '⚠️ Limit Reached' : `${urlStats.minuteRemaining} remaining`}
                      </Typography>
                    </Card>
                  </Grid>
                  {/* Daily Card - Red if daily OR monthly limit reached */}
                  <Grid item xs={12} sm={4}>
                    <Card
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: (urlStats.dailyRemaining <= 0 || urlStats.monthlyRemaining <= 0) ? 'error.light' : 'grey.50',
                        border: (urlStats.dailyRemaining <= 0 || urlStats.monthlyRemaining <= 0) ? 2 : 0,
                        borderColor: (urlStats.dailyRemaining <= 0 || urlStats.monthlyRemaining <= 0) ? 'error.main' : 'transparent',
                        overflow: 'hidden',
                      }}
                    >
                      <CalendarIcon
                        sx={{
                          fontSize: 36,
                          color: (urlStats.dailyRemaining <= 0 || urlStats.monthlyRemaining <= 0) ? 'error.contrastText' : 'primary.main',
                          mb: 1
                        }}
                      />
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color={(urlStats.dailyRemaining <= 0 || urlStats.monthlyRemaining <= 0) ? 'error.contrastText' : 'primary.main'}
                        sx={{
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                        }}
                      >
                        {urlStats.dailyRemaining <= 0 || urlStats.monthlyRemaining <= 0 ? urlStats.dailyLimit : urlStats.dailyCount}/{urlStats.dailyLimit}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        color={(urlStats.dailyRemaining <= 0 || urlStats.monthlyRemaining <= 0) ? 'error.contrastText' : 'text.secondary'}
                        sx={{ mt: 0.5 }}
                      >
                        Per Day
                      </Typography>
                      <Typography
                        variant="caption"
                        color={(urlStats.dailyRemaining <= 0 || urlStats.monthlyRemaining <= 0) ? 'error.contrastText' : 'text.secondary'}
                        fontWeight={(urlStats.dailyRemaining <= 0 || urlStats.monthlyRemaining <= 0) ? 600 : 400}
                      >
                        {(urlStats.dailyRemaining <= 0 || urlStats.monthlyRemaining <= 0) ? '⚠️ Limit Reached' : `${urlStats.dailyRemaining} remaining`}
                      </Typography>
                    </Card>
                  </Grid>
                  {/* Monthly Card - Red if monthly limit reached */}
                  <Grid item xs={12} sm={4}>
                    <Card
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: urlStats.monthlyRemaining <= 0 ? 'error.light' : 'grey.50',
                        border: urlStats.monthlyRemaining <= 0 ? 2 : 0,
                        borderColor: urlStats.monthlyRemaining <= 0 ? 'error.main' : 'transparent',
                        overflow: 'hidden',
                      }}
                    >
                      <TrendingUpIcon
                        sx={{
                          fontSize: 36,
                          color: urlStats.monthlyRemaining <= 0 ? 'error.contrastText' : 'primary.main',
                          mb: 1
                        }}
                      />
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color={urlStats.monthlyRemaining <= 0 ? 'error.contrastText' : 'primary.main'}
                        sx={{
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                        }}
                      >
                        {urlStats.monthlyCount}/{urlStats.monthlyLimit}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        color={urlStats.monthlyRemaining <= 0 ? 'error.contrastText' : 'text.secondary'}
                        sx={{ mt: 0.5 }}
                      >
                        Per Month
                      </Typography>
                      <Typography
                        variant="caption"
                        color={urlStats.monthlyRemaining <= 0 ? 'error.contrastText' : 'text.secondary'}
                        fontWeight={urlStats.monthlyRemaining <= 0 ? 600 : 400}
                      >
                        {urlStats.monthlyRemaining <= 0 ? '⚠️ Limit Reached' : `${urlStats.monthlyRemaining} remaining`}
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    🔄 Monthly limits reset on the 1st of every month. Daily limits reset at midnight.
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLimitsDialogOpen(false)} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete URL</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this URL? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity="success">{success}</Alert>
        </Snackbar>

        <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
