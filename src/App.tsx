import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, CircularProgress, Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { FeatureProvider, useFeatures } from './context/FeatureContext';
import { InitializationProvider, useInitialization } from './context/InitializationContext';
import ProtectedRoute from './components/ProtectedRoute';
import SignupGuard from './components/SignupGuard';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SelfSignupPage from './pages/SelfSignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OtpVerifyPage from './pages/OtpVerifyPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import FeatureFlagsPage from './pages/admin/FeatureFlagsPage';
import EmailInvitesPage from './pages/admin/EmailInvitesPage';
import NoPermissionPage from './pages/NoPermissionPage';
import UnderMaintenancePage from './pages/UnderMaintenancePage';

// Create modern MUI theme with defaults
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ed6c02',
    },
    info: {
      main: '#0288d1',
    },
    success: {
      main: '#2e7d32',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

// Separate component to update document title - must be inside FeatureProvider
function DocumentTitleUpdater() {
  const { getAppName, getAppSubtitle, isGlobalFeaturesLoaded } = useFeatures();

  useEffect(() => {
    if (isGlobalFeaturesLoaded) {
      const name = getAppName();
      const subtitle = getAppSubtitle();
      document.title = subtitle ? `${name} - ${subtitle}` : name;
    }
  }, [isGlobalFeaturesLoaded, getAppName, getAppSubtitle]);

  return null;
}

function AppContent() {
  const { isHealthy, isLoading, isInitialized } = useInitialization();

  // Show loading while initializing
  if (isLoading || !isInitialized) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  // Show maintenance page if service is not healthy
  if (!isHealthy) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <UnderMaintenancePage onServiceRestored={() => window.location.reload()} />
      </ThemeProvider>
    );
  }

  // Show main app if initialized and healthy
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <FeatureProvider>
            <DocumentTitleUpdater />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/self-signup"
                element={
                  <SignupGuard>
                    <SelfSignupPage />
                  </SignupGuard>
                }
              />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-otp" element={<OtpVerifyPage />} />
              <Route path="/no-permission" element={<NoPermissionPage />} />

              {/* Protected Routes - controlled by feature flags */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute featureKey="DASHBOARD">
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute featureKey="PROFILE_PAGE">
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute featureKey="SETTINGS_PAGE">
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes - controlled by feature flags */}
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute featureKey="USER_MANAGEMENT">
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/features"
                element={
                  <ProtectedRoute featureKey="FEATURE_MANAGEMENT">
                    <FeatureFlagsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/email-invites"
                element={
                  <ProtectedRoute featureKey="EMAIL_INVITE">
                    <EmailInvitesPage />
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </FeatureProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function App() {
  return (
    <InitializationProvider>
      <AppContent />
    </InitializationProvider>
  );
}

export default App;
