import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Container,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  Email as EmailIcon,
  Flag as FlagIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useFeatures } from '../context/FeatureContext';
import config from '../config';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isLoading, isFeatureEnabled, getFeatureName } = useFeatures();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="xl">
        <Toolbar sx={{ minHeight: 64, px: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <Typography
              variant="h4"
              fontWeight={700}
              color="text.primary"
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate('/dashboard')}
            >
              🔗 {config.appName}
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Profile">
              <IconButton 
                onClick={() => navigate('/profile')} 
                sx={{ ml: 1 }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: 'primary.main',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <IconButton onClick={handleProfileMenuOpen}>
              <ExpandMoreIcon />
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              elevation: 3,
              sx: { minWidth: 200, mt: 1.5 },
            }}
          >
            {/* Settings - controlled by SETTINGS_PAGE feature flag */}
            {isFeatureEnabled('SETTINGS_PAGE') && (
              <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/settings'); }}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                {getFeatureName('SETTINGS_PAGE')}
              </MenuItem>
            )}

            {/* Admin Menu Items - shown based on feature flags */}
            {!isLoading && (
              <>
                {isFeatureEnabled('USER_MANAGEMENT') && (
                  <>
                    <Divider />
                    <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/admin/users'); }}>
                      <ListItemIcon>
                        <AdminIcon fontSize="small" />
                      </ListItemIcon>
                      {getFeatureName('USER_MANAGEMENT')}
                    </MenuItem>
                  </>
                )}
                {isFeatureEnabled('EMAIL_INVITE') && (
                  <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/admin/email-invites'); }}>
                    <ListItemIcon>
                      <EmailIcon fontSize="small" />
                    </ListItemIcon>
                    {getFeatureName('EMAIL_INVITE')}
                  </MenuItem>
                )}
                {isFeatureEnabled('FEATURE_MANAGEMENT') && (
                  <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/admin/features'); }}>
                    <ListItemIcon>
                      <FlagIcon fontSize="small" />
                    </ListItemIcon>
                    {getFeatureName('FEATURE_MANAGEMENT')}
                  </MenuItem>
                )}
              </>
            )}
            
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
