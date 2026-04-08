import apiClient from './api';
import { ApiResponse } from '../types';
import config from '../config';

/**
 * Self Invite Service - handles self-signup requests
 */
export const selfInviteService = {
  /**
   * Send self-invite request
   * API expects: POST /api/self-invite/send?email={email}
   */
  sendSelfInvite: async (email: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(
      config.endpoints.selfInviteSend,
      null,  // Empty body
      {
        params: {
          email,
        },
      }
    );
    return response.data;
  },
};

export default selfInviteService;
