// User types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  lastLogin: string | null;
}

export interface Role {
  id: number;
  name: 'ADMIN' | 'USER';
}

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  username: string;
  userId: number;
  firstName: string;
  lastName: string;
}

/** Response when 2FA is enabled — OTP required */
export interface LoginOtpResponse {
  otpRequired: true;
  email: string;
  message: string;
}

/** Request body for OTP verification */
export interface VerifyOtpRequest {
  username: string;
  otp: string;
}

/** Request body for resending OTP */
export interface ResendOtpRequest {
  username: string;
}

/** Response from successful OTP verification (same as LoginResponse) */
export interface VerifyOtpResponse {
  token: string;
  tokenType: string;
  username: string;
  userId: number;
  firstName: string;
  lastName: string;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email?: string;
  invitationToken?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface DeleteAccountRequest {
  password: string;
}

// URL types
export interface Url {
  id: number;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  accessCount: number;
  createdAt: string;
  userId?: number;
}

export interface CreateUrlRequest {
  url: string;
  alias?: string;
}

export interface UrlStats {
  minuteCount: number;
  minuteLimit: number;
  minuteRemaining: number;
  dailyCount: number;
  dailyLimit: number;
  dailyRemaining: number;
  monthlyCount: number;
  monthlyLimit: number;
  monthlyRemaining: number;
}

// Profile types
export interface ProfileUpdateRequest {
  firstName: string;
  lastName: string;
  email: string;
}

export interface UpdateThemeRequest {
  theme: string;
}

// Admin types
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roleName: 'ADMIN' | 'USER';
  status: UserStatus;
  createdAt: string;
  lastLogin: string | null;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  deletedUsers: number;
}

// Feature types
export interface Feature {
  id: number;
  featureId?: number;
  featureKey: string;
  featureName: string;
  description: string;
  enabled: boolean;
  roleId?: number;
  roleName?: string;
  createdAt: string;
  updatedAt: string;
}

// Global Feature Response types
export interface GlobalFeaturesResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    flags: Feature[];
  };
}

// User Features Response types
export interface UserFeaturesResponse {
  success: boolean;
  message: string;
  data: {
    role: string;
    count: number;
    features: Feature[];
  };
}

// Email Invite types
export interface EmailInvite {
  id: number;
  email: string;
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt: string | null;
}

export interface EmailInviteStats {
  total: number;
  pending: number;
  accepted: number;
  revoked?: number;
  expired?: number;
}

// API Response types
export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Query params
export interface UrlQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
}

export interface AdminUsersQueryParams {
  page?: number;
  size?: number;
  status?: UserStatus;
}
