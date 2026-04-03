import apiClient from './api';
import {
  ChangePasswordRequest,
  DeleteAccountRequest,
  ApiResponse,
} from '../types';
import config from '../config';

/**
 * Settings Service - manages user settings
 */
export const settingsService = {
  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(
      config.endpoints.settingsChangePassword,
      data
    );
    return response.data;
  },

  /**
   * Export user data as JSON
   */
  exportData: async (): Promise<any> => {
    const response = await apiClient.get(config.endpoints.settingsExport, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Delete account
   */
  deleteAccount: async (data: DeleteAccountRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(
      config.endpoints.settingsDeleteAccount,
      data
    );
    return response.data;
  },
};

export default settingsService;
