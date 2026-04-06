import apiClient from './api';
import {
  ProfileUpdateRequest,
  UpdateThemeRequest,
  ApiResponse,
} from '../types';
import config from '../config';

/**
 * Profile Service - manages user profile
 */
export const profileService = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<any> => {
    const response = await apiClient.get<ApiResponse>(config.endpoints.profile);
    return response.data.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: ProfileUpdateRequest): Promise<ApiResponse> => {
    const response = await apiClient.put<ApiResponse>(config.endpoints.profile, data);
    return response.data;
  },

  /**
   * Update user theme preference
   */
  updateTheme: async (data: UpdateThemeRequest): Promise<ApiResponse> => {
    const response = await apiClient.put<ApiResponse>(config.endpoints.profile, data);
    return response.data;
  },
};

export default profileService;
