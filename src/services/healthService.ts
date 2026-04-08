import axios from 'axios';
import config from '../config';

export interface HealthResponse {
  success: boolean;
  message: string;
  data: any;
}

/**
 * Health Service - check API health status
 * Uses a dedicated axios instance with a short timeout for fast failure detection
 */

// Dedicated axios instance for health checks with short timeout
const healthClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 5000, // 5s timeout - fast failure for maintenance detection
});

export const healthService = {
  /**
   * Check if the API is healthy
   * Throws on network error or timeout so caller can handle maintenance mode
   */
  checkHealth: async (): Promise<HealthResponse> => {
    try {
      const response = await healthClient.get(config.endpoints.health);
      return response.data;
    } catch (error: any) {
      console.error('[Health] Health check failed:', error.code, error.message);
      throw error;
    }
  },
};

export default healthService;
