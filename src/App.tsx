import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import { ThemeProvider } from './context/ThemeContext';
import { useThemeContext } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { FeatureProvider, useFeatures } from './context/FeatureContext';
import { InitializationProvider, useInitialization } from './context/InitializationContext';
import ProtectedRoute from './components/ProtectedRoute';
import SignupGuard from './components/SignupGuard';
import { defaultTheme } from './theme/themes';

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
  const { theme } = useThemeContext();

  // Show loading while initializing
  if (isLoading || !isInitialized) {
    return (
      <MuiThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      </MuiThemeProvider>
    );
  }

  // Show maintenance page if service is not healthy
  if (!isHealthy) {
    return (
      <MuiThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <UnderMaintenancePage onServiceRestored={() => window.location.reload()} />
      </MuiThemeProvider>
    );
  }

  // Show main app if initialized and healthy
  return (
    <MuiThemeProvider theme={theme}>
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
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <InitializationProvider>
        <AppContent />
      </InitializationProvider>
    </ThemeProvider>
  );
}

export default App;
