/**
 * Application Configuration
 * Uses environment variables with sensible defaults
 */
export const config = {
  /** Application name displayed in UI */
  appName: import.meta.env.VITE_APP_NAME || 'MiniURL',

  /** Backend API base URL */
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080',

  /** API endpoints */
  endpoints: {
    // Health
    health: '/api/health',

    // Authentication
    login: '/api/auth/login',
    signup: '/api/auth/signup',
    verifyEmailInvite: '/api/auth/verify-email-invite',
    verifyEmail: '/api/auth/verify-email',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
    changePassword: '/api/auth/change-password',
    deleteAccount: '/api/auth/delete-account',
    activateEmail: '/api/auth/activate-email',
    checkPasswordChange: '/api/auth/check-password-change',

    // Self Invitation
    selfInviteSend: '/api/self-invite/send',

    // URLs
    urls: '/api/urls',
    urlStats: '/api/urls/usage-stats',
    urlById: (id: number) => `/api/urls/${id}`,

    // Profile
    profile: '/api/profile',

    // Settings
    settingsChangePassword: '/api/settings/change-password',
    settingsExport: '/api/settings/export',
    settingsDeleteAccount: '/api/settings/delete-account',

    // Admin - Users
    adminUsers: '/api/admin/users',
    adminUserById: (id: number) => `/api/admin/users/${id}`,
    adminUserSearch: '/api/admin/users/search',
    adminUserSuspend: (id: number) => `/api/admin/users/${id}/suspend`,
    adminUserDeactivate: (id: number) => `/api/admin/users/${id}/deactivate`,
    adminUserActivate: (id: number) => `/api/admin/users/${id}/activate`,
    adminUserRole: (id: number) => `/api/admin/users/${id}/role`,
    adminStats: '/api/admin/stats',

    // Features - Global (no auth required)
    globalFeatures: '/api/features/global',
    // Features - User specific (auth required)
    userFeatures: '/api/features',

    // Admin - Features (legacy)
    adminFeatures: '/api/admin/features',
    adminFeatureByKey: (key: string) => `/api/admin/features/${key}`,
    adminFeatureToggle: (key: string) => `/api/admin/features/${key}/toggle`,
    adminFeatureEnable: (key: string) => `/api/admin/features/${key}/enable`,
    adminFeatureDisable: (key: string) => `/api/admin/features/${key}/disable`,
    adminFeatureEnabled: (key: string) => `/api/admin/features/${key}/enabled`,

    // Admin - Feature Flags by ID (for role-based and global features management)
    adminFeatureToggleById: (id: number) => `/api/admin/features/${id}/toggle`,
    adminGlobalFeatureToggleById: (id: number) => `/api/admin/features/global/${id}/toggle`,
    adminFeatureById: (id: number) => `/api/admin/features/${id}`,
    adminGlobalFeatureById: (id: number) => `/api/admin/features/global/${id}`,

    // Admin - Email Invites
    adminEmailInvites: '/api/admin/email-invites',
    adminEmailInvitesSend: '/api/admin/email-invites/send',
    adminEmailInvitesResend: (id: number) => `/api/admin/email-invites/${id}/resend`,
    adminEmailInvitesRevoke: (id: number) => `/api/admin/email-invites/${id}/revoke`,

    // Redirect
    redirect: (shortCode: string) => `/r/${shortCode}`,
  },
};

export default config;
