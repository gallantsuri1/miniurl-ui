import apiClient from './api';
import {
  Url,
  CreateUrlRequest,
  UrlStats,
  ApiResponse,
  PageResponse,
} from '../types';
import config from '../config';

/**
 * URL Service - manages shortened URLs
 */
export const urlService = {
  /**
   * Get all URLs for current user with pagination, sorting, and search
   * API returns: {success, message, data: {content: [...], page, size, totalElements, totalPages, first, last}}
   */
  getUrls: async (params?: { page?: number; size?: number; sortBy?: string; sortDirection?: 'asc' | 'desc'; search?: string }): Promise<PageResponse<Url>> => {
    const apiParams: any = {
      page: params?.page || 0,
      size: params?.size || 10,
    };

    if (params?.search) {
      apiParams.search = params.search;
    }

    if (params?.sortBy) {
      apiParams.sortBy = params.sortBy;
    }

    if (params?.sortDirection) {
      apiParams.sortDirection = params.sortDirection;
    }

    const response = await apiClient.get<ApiResponse>(config.endpoints.urls, { params: apiParams });
    const data = response.data.data;

    // API returns pagination directly in data.data
    return {
      content: data?.content || [],
      page: data?.page || 0,
      size: data?.size || 10,
      totalElements: data?.totalElements || 0,
      totalPages: data?.totalPages || 0,
      first: data?.first || true,
      last: data?.last || true,
    };
  },

  /**
   * Create a new shortened URL
   */
  createUrl: async (data: CreateUrlRequest): Promise<Url> => {
    const response = await apiClient.post<ApiResponse>(config.endpoints.urls, data);
    return response.data.data;
  },

  /**
   * Delete a URL by ID
   */
  deleteUrl: async (id: number): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`${config.endpoints.urls}/${id}`);
    return response.data;
  },

  /**
   * Get URL creation usage stats
   */
  getUsageStats: async (): Promise<UrlStats> => {
    const response = await apiClient.get<ApiResponse>(config.endpoints.urlStats);
    return response.data.data;
  },
};

export default urlService;
