import apiClient from './api';
import {
  LoginRequest,
  LoginResponse,
  LoginOtpResponse,
  SignupRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  DeleteAccountRequest,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ResendOtpRequest,
  ApiResponse,
} from '../types';
import config from '../config';

/**
 * Authentication Service
 */
export const authService = {
  /**
   * Login with username/email and password
   * Returns either:
   *   - { otpRequired: true, email, message } when 2FA is enabled
   *   - { otpRequired: false, token, ... } when 2FA is disabled
   */
  login: async (credentials: LoginRequest): Promise<LoginOtpResponse | { otpRequired: false; data: LoginResponse }> => {
    const response = await apiClient.post<ApiResponse>(config.endpoints.login, credentials);
    const data = response.data.data;

    // Check if OTP is required
    if (data.otpRequired) {
      return {
        otpRequired: true,
        email: data.email,
        message: data.message,
      } as LoginOtpResponse;
    }

    // No OTP required — store token and return
    const tokenData = data as LoginResponse;
    localStorage.setItem('token', tokenData.token);
    return { otpRequired: false, data: tokenData };
  },

  /**
   * Verify OTP after login when 2FA is enabled
   */
  verifyOtp: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const response = await apiClient.post<ApiResponse>(config.endpoints.verifyOtp, data);
    const tokenData = response.data.data as VerifyOtpResponse;
    localStorage.setItem('token', tokenData.token);
    return tokenData;
  },

  /**
   * Resend OTP to user's email
   */
  resendOtp: async (data: ResendOtpRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(config.endpoints.resendOtp, data);
    return response.data;
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('token');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
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
   * Delete account
   */
  deleteAccount: async (data: DeleteAccountRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(config.endpoints.deleteAccount, data);
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
