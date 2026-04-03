import apiClient from './api';
import config from '../config';

export interface HealthResponse {
  success: boolean;
  message: string;
  data: any;
}

/**
 * Health Service - check API health status
 */
export const healthService = {
  /**
   * Check if the API is healthy
   */
  checkHealth: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>(config.endpoints.health);
    return response.data;
  },
};

export default healthService;
