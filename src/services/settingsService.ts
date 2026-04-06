import apiClient from './api';
import {
  DeleteAccountRequest,
  ApiResponse,
} from '../types';
import config from '../config';

/**
 * Settings Service - manages user settings
 */
export const settingsService = {
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
