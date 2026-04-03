import apiClient from './api';
import {
  AdminUser,
  AdminStats,
  ApiResponse,
  PageResponse,
  AdminUsersQueryParams,
} from '../types';
import config from '../config';

export interface UsersQueryParams extends AdminUsersQueryParams {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Admin Service - manages admin operations
 */
export const adminService = {
  /**
   * Get all users with pagination, sorting, and search
   * API returns: {success, message, data: {summary: {...}, pagination: {content: [...], page, size, totalElements, totalPages, ...}}}
   */
  getAllUsers: async (params?: UsersQueryParams): Promise<PageResponse<AdminUser>> => {
    const queryParams: any = {
      page: params?.page || 0,
      size: params?.size || 20,
      sortBy: params?.sortBy || 'createdAt',
      sortDirection: params?.sortDirection || 'desc',
    };
    
    if (params?.status) {
      queryParams.status = params.status;
    }
    
    if (params?.search) {
      queryParams.search = params.search;
    }
    
    const response = await apiClient.get<ApiResponse>(config.endpoints.adminUsers, { params: queryParams });
    const data = response.data.data;
    
    // API returns nested structure: data.pagination.content
    const pagination = data?.pagination || {};
    
    return {
      content: pagination.content || [],
      page: pagination.page || 0,
      size: pagination.size || 20,
      totalElements: pagination.totalElements || 0,
      totalPages: pagination.totalPages || 0,
      first: pagination.first || true,
      last: pagination.last || true,
    };
  },

  /**
   * Get admin statistics from summary
   */
  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get<ApiResponse>(config.endpoints.adminUsers);
    const data = response.data.data;
    const summary = data?.summary || {};
    
    return {
      totalUsers: summary.totalUsers || 0,
      activeUsers: summary.activeUsers || 0,
      suspendedUsers: summary.suspendedUsers || 0,
      deletedUsers: summary.deletedUsers || 0,
    };
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: number): Promise<AdminUser> => {
    const response = await apiClient.get<ApiResponse>(config.endpoints.adminUserById(id));
    return response.data.data;
  },

  /**
   * Search users
   */
  searchUsers: async (query: string): Promise<AdminUser[]> => {
    const response = await apiClient.get<ApiResponse>(config.endpoints.adminUserSearch, {
      params: { query },
    });
    return response.data.data || [];
  },

  /**
   * Suspend a user
   */
  suspendUser: async (id: number): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(config.endpoints.adminUserSuspend(id));
    return response.data;
  },

  /**
   * Deactivate a user
   */
  deactivateUser: async (id: number): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(config.endpoints.adminUserDeactivate(id));
    return response.data;
  },

  /**
   * Activate a user
   */
  activateUser: async (id: number): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(config.endpoints.adminUserActivate(id));
    return response.data;
  },

  /**
   * Update user role
   */
  updateUserRole: async (id: number, roleName: 'ADMIN' | 'USER'): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(
      config.endpoints.adminUserRole(id),
      null,
      { params: { roleName } }
    );
    return response.data;
  },
};

export default adminService;
