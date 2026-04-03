import apiClient from './api';
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
  ApiResponse,
} from '../types';
import config from '../config';

/**
 * Authentication Service
 */
export const authService = {
  /**
   * Login with username/email and password
   * API returns: {success: true, message: "...", data: {token: "...", ...}}
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse>(config.endpoints.login, credentials);
    // API wraps response in ApiResponse: {success, message, data}
    const tokenData = response.data.data as LoginResponse;
    // Store token in localStorage
    localStorage.setItem('token', tokenData.token);
    localStorage.setItem('user', JSON.stringify(tokenData));
    return tokenData;
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  /**
   * Sign up new user
   */
  signup: async (data: SignupRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(config.endpoints.signup, data);
    return response.data;
  },

  /**
   * Request password reset
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(config.endpoints.forgotPassword, data);
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(config.endpoints.resetPassword, data);
    return response.data;
  },

  /**
   * Change password (authenticated)
   */
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(config.endpoints.changePassword, data);
    return response.data;
  },

  /**
   * Delete account
   */
  deleteAccount: async (data: DeleteAccountRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(config.endpoints.deleteAccount, data);
    return response.data;
  },

  /**
   * Check if password change is required
   */
  checkPasswordChange: async (): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>(config.endpoints.checkPasswordChange);
    return response.data;
  },

  /**
   * Verify email invite token
   * API expects: GET /api/auth/verify-email-invite?token=...
   */
  verifyEmailInvite: async (token: string): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>(config.endpoints.verifyEmailInvite, {
      params: { token },
    });
    return response.data;
  },

  /**
   * Verify email token (for password reset)
   * API expects: GET /api/auth/verify-email?token=...
   */
  verifyEmail: async (token: string): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>(config.endpoints.verifyEmail, {
      params: { token },
    });
    return response.data;
  },
};

export default authService;
