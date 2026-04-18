import apiClient from './api';
import { EmailInvite, ApiResponse, PageResponse } from '../types';
import config from '../config';

export interface EmailInviteStats {
  total: number;
  pending: number;
  accepted: number;
  revoked?: number;
  expired?: number;
}

export interface EmailInviteResponse {
  invites: EmailInvite[];
  stats: EmailInviteStats;
}

export interface EmailInvitesQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Email Invite Service
 */
export const emailInviteService = {
  /**
   * Get all email invites with pagination and sorting
   * API returns: {success, message, data: {summary: {totalInvites, pendingInvites, revokedInvites, acceptedInvites}, pagination: {content: [...], page, size, totalElements, totalPages, ...}}}
   */
  getAllInvites: async (params?: EmailInvitesQueryParams): Promise<PageResponse<EmailInvite> & { stats: EmailInviteStats }> => {
    const queryParams: any = {
      page: params?.page || 0,
      size: params?.size || 20,
      sortBy: params?.sortBy || 'createdAt',
      sortDirection: params?.sortDirection || 'desc',
    };
    
    const response = await apiClient.get<ApiResponse>(config.endpoints.adminEmailInvites, { params: queryParams });
    const data = response.data.data;
    
    // API returns nested structure: data.pagination.content and data.summary
    const pagination = data?.pagination || {};
    const summary = data?.summary || {};
    
    return {
      content: pagination.content || [],
      page: pagination.page || 0,
      size: pagination.size || 20,
      totalElements: pagination.totalElements || 0,
      totalPages: pagination.totalPages || 0,
      first: pagination.first || true,
      last: pagination.last || true,
      stats: {
        total: summary.totalInvites || 0,
        pending: summary.pendingInvites || 0,
        accepted: summary.acceptedInvites || 0,
        revoked: summary.revokedInvites || 0,
        expired: 0, // API doesn't provide expired count in summary
      },
    };
  },

  /**
   * Send email invite
   * API expects: POST /api/admin/email-invites/send?email=...
   */
  sendInvite: async (email: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(
      config.endpoints.adminEmailInvitesSend,
      null,
      {
        params: {
          email: email,
        },
      }
    );
    return response.data;
  },

  /**
   * Revoke email invite
   * API expects: POST /api/admin/email-invites/{id}/revoke
   */
  revokeInvite: async (id: number): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(config.endpoints.adminEmailInvitesRevoke(id));
    return response.data;
  },

  /**
   * Resend email invite
   * API expects: POST /api/admin/email-invites/{id}/resend
   */
  resendInvite: async (id: number): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(
      config.endpoints.adminEmailInvitesResend(id),
      null,
      {}
    );
    return response.data;
  },
};

export default emailInviteService;
