import apiClient from './api';
import { Feature, ApiResponse, GlobalFeaturesResponse, UserFeaturesResponse } from '../types';
import config from '../config';

/**
 * Feature Flag Service
 */
export const featureService = {
  /**
   * Get global feature flags (no authentication required)
   * API returns: {data: {flags: [...], count: N}}
   */
  getGlobalFeatures: async (): Promise<Feature[]> => {
    const response = await apiClient.get<GlobalFeaturesResponse>(config.endpoints.globalFeatures, {
      headers: {
        'Authorization': undefined, // Don't send auth header for global features
      },
    });
    // API returns nested structure: data.flags
    return response.data.data?.flags || [];
  },

  /**
   * Get user-specific feature flags (authentication required)
   * API returns: {data: {features: [...], count: N, role: string}}
   */
  getUserFeatures: async (): Promise<Feature[]> => {
    const response = await apiClient.get<UserFeaturesResponse>(config.endpoints.userFeatures);
    // API returns nested structure: data.features
    return response.data.data?.features || [];
  },

  /**
   * Get all feature flags for all roles (admin management)
   * API returns: {data: {features: [...], count: N}}
   */
  getAllFeatures: async (): Promise<Feature[]> => {
    const response = await apiClient.get<ApiResponse>(config.endpoints.adminFeatures);
    // API returns nested structure: data.features
    return response.data.data?.features || [];
  },

  /**
   * Get all role-based features (for Admin and User roles)
   * API returns: {data: {features: [...], count: N}}
   */
  getRoleBasedFeatures: async (): Promise<Feature[]> => {
    const response = await apiClient.get<ApiResponse>(config.endpoints.adminFeatures);
    // Filter features that have roleId and roleName (role-based features)
    const allFeatures = response.data.data?.features || [];
    return allFeatures.filter((f: Feature) => f.roleId !== undefined && f.roleName !== undefined);
  },

  /**
   * Get all global features (for admin management)
   * API returns: {data: {flags: [...], count: N}}
   */
  getManagedGlobalFeatures: async (): Promise<Feature[]> => {
    const response = await apiClient.get<GlobalFeaturesResponse>(config.endpoints.globalFeatures);
    // API returns nested structure: data.flags
    return response.data.data?.flags || [];
  },

  /**
   * Toggle feature by ID (for role-based features)
   * API expects: PUT /api/admin/features/{id}/toggle
   */
  toggleFeatureById: async (id: number, enabled: boolean): Promise<ApiResponse> => {
    const response = await apiClient.put<ApiResponse>(
      config.endpoints.adminFeatureToggleById(id),
      enabled  // Send boolean value
    );
    return response.data;
  },

  /**
   * Toggle global feature by ID
   * API expects: PUT /api/admin/features/global/{id}/toggle
   */
  toggleGlobalFeatureById: async (id: number, enabled: boolean): Promise<ApiResponse> => {
    const response = await apiClient.put<ApiResponse>(
      config.endpoints.adminGlobalFeatureToggleById(id),
      enabled  // Send boolean value
    );
    return response.data;
  },

  /**
   * Create new role-based feature
   * API expects: POST /api/admin/features
   */
  createFeature: async (featureData: {
    featureKey: string;
    featureName: string;
    description: string;
    adminEnabled: boolean;
    userEnabled: boolean;
  }): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(
      config.endpoints.adminFeatures,
      featureData
    );
    return response.data;
  },

  /**
   * Create new global feature
   * API expects: POST /api/admin/features/global
   */
  createGlobalFeature: async (featureData: {
    featureKey: string;
    featureName: string;
    description: string;
    enabled: boolean;
  }): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(
      `${config.endpoints.adminFeatures}/global`,
      featureData
    );
    return response.data;
  },

  /**
   * Delete role-based feature by ID
   * API expects: DELETE /api/admin/features/{id}
   */
  deleteFeature: async (id: number): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(
      config.endpoints.adminFeatureById(id)
    );
    return response.data;
  },

  /**
   * Delete global feature by ID
   * API expects: DELETE /api/admin/features/global/{id}
   */
  deleteGlobalFeature: async (id: number): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(
      config.endpoints.adminGlobalFeatureById(id)
    );
    return response.data;
  },

  /**
   * Get feature by key
   */
  getFeature: async (key: string): Promise<Feature> => {
    const response = await apiClient.get<ApiResponse>(config.endpoints.adminFeatureByKey(key));
    return response.data.data;
  },

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled: async (key: string): Promise<boolean> => {
    const response = await apiClient.get<ApiResponse>(config.endpoints.adminFeatureEnabled(key));
    return response.data.data;
  },

  /**
   * Toggle feature
   * API expects: PUT /api/admin/features/{key}/toggle with body as string "true" or "false"
   */
  toggleFeature: async (key: string, enabled: boolean): Promise<ApiResponse> => {
    const response = await apiClient.put<ApiResponse>(
      config.endpoints.adminFeatureToggle(key),
      enabled.toString()  // Send as string, not object
    );
    return response.data;
  },

  /**
   * Enable feature
   */
  enableFeature: async (key: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(config.endpoints.adminFeatureEnable(key));
    return response.data;
  },

  /**
   * Disable feature
   */
  disableFeature: async (key: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(config.endpoints.adminFeatureDisable(key));
    return response.data;
  },
};

export default featureService;
