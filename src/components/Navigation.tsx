import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Chip,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  Email as EmailIcon,
  Flag as FlagIcon,
  Link as LinkIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFeatures } from '../context/FeatureContext';
import config from '../config';

const DRAWER_WIDTH = 260;

interface NavigationProps {
  children: React.ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isLoading, isFeatureEnabled, getFeatureName, getAppName } = useFeatures();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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

  // Menu items with feature keys and icons
  const menuItemsConfig = [
    { featureKey: 'DASHBOARD', icon: <DashboardIcon />, path: '/dashboard' },
    { featureKey: 'PROFILE_PAGE', icon: <PersonIcon />, path: '/profile' },
    { featureKey: 'SETTINGS_PAGE', icon: <SettingsIcon />, path: '/settings' },
  ];

  const adminMenuItemsConfig = [
    { featureKey: 'USER_MANAGEMENT', icon: <AdminIcon />, path: '/admin/users' },
    { featureKey: 'EMAIL_INVITE', icon: <EmailIcon />, path: '/admin/email-invites' },
    { featureKey: 'FEATURE_MANAGEMENT', icon: <FlagIcon />, path: '/admin/features' },
  ];

  // Filter menu items based on feature flags and get display names
  const menuItems = menuItemsConfig
    .filter(item => !isLoading || isFeatureEnabled(item.featureKey))
    .map(item => ({
      text: getFeatureName(item.featureKey),
      icon: item.icon,
      path: item.path,
      featureKey: item.featureKey,
    }));

  const adminMenuItems = adminMenuItemsConfig
    .filter(item => !isLoading || isFeatureEnabled(item.featureKey))
    .map(item => ({
      text: getFeatureName(item.featureKey),
      icon: item.icon,
      path: item.path,
      featureKey: item.featureKey,
    }));

  const isActive = (path: string) => location.pathname === path;

  const drawer = (
    <Box>
      <Toolbar
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <LinkIcon sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
          {getAppName()}
        </Typography>
      </Toolbar>
      <Divider />
      
      {/* User Info */}
      <Box sx={{ p: 2.5, bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: 'primary.main',
              mr: 1.5,
              fontWeight: 600,
            }}
          >
            {user?.firstName?.[0] || user?.username?.[0] || 'U'}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" noWrap fontWeight="600">
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              @{user?.username}
            </Typography>
          </Box>
        </Box>
        {user?.role?.name === 'ADMIN' && (
          <Chip label="ADMIN" size="small" color="error" />
        )}
      </Box>
      
      <Divider />
      
      {/* Menu Items */}
      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                py: 1.5,
                px: 2.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                },
                '& .MuiListItemIcon-root': {
                  color: isActive(item.path) ? 'inherit' : 'text.secondary',
                  minWidth: 40,
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {user?.role?.name === 'ADMIN' && (
        <>
          <Divider sx={{ my: 1 }} />
          <List>
            <ListItem sx={{ px: 2.5, py: 1 }}>
              <ListItemText
                primary="Admin"
                sx={{ '& .MuiTypography-root': { fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' } }}
              />
            </ListItem>
            {adminMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={isActive(item.path)}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) setMobileOpen(false);
                  }}
                  sx={{
                    py: 1.5,
                    px: 2.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.light',
                      },
                    },
                    '& .MuiListItemIcon-root': {
                      color: isActive(item.path) ? 'inherit' : 'text.secondary',
                      minWidth: 40,
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' }, color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            {getPageTitle(location.pathname, getFeatureName)}
          </Typography>
          
          <IconButton
            onClick={handleProfileMenuOpen}
            sx={{ ml: 1 }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
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
            </Badge>
          </IconButton>
          
          <IconButton onClick={handleProfileMenuOpen}>
            <ExpandMoreIcon />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              elevation: 3,
              sx: { minWidth: 200, mt: 1.5 },
            }}
          >
            <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/settings'); }}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_WIDTH,
                borderRight: '1px solid',
                borderColor: 'divider',
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_WIDTH,
                borderRight: '1px solid',
                borderColor: 'divider',
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

// Map paths to feature keys for dynamic page titles
const pathToFeatureKey: Record<string, string> = {
  '/dashboard': 'DASHBOARD',
  '/profile': 'PROFILE_PAGE',
  '/settings': 'SETTINGS_PAGE',
  '/admin/users': 'USER_MANAGEMENT',
  '/admin/email-invites': 'EMAIL_INVITE',
  '/admin/features': 'FEATURE_MANAGEMENT',
};

function getPageTitle(pathname: string, getFeatureName?: (key: string) => string): string {
  const featureKey = pathToFeatureKey[pathname];
  if (featureKey && getFeatureName) {
    return getFeatureName(featureKey);
  }
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/profile': 'Profile',
    '/settings': 'Settings',
    '/admin/users': 'User Management',
    '/admin/email-invites': 'Email Invites',
    '/admin/features': 'Feature Flags',
  };
  return titles[pathname] || config.appName;
}
