import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ApiConfig, ApiConfigResponse, CreateApiConfigParams, UpdateApiConfigParams } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const authStorage = typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null;
  if (!authStorage) return config;
  const parsed = JSON.parse(authStorage);
  const token = parsed?.state?.token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token } = response.data as { access_token: string };
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', access_token);
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Handle refresh token failure (e.g., redirect to login)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export async function getApiConfigs(params: { page?: number; pageSize?: number }): Promise<ApiResponse<ApiConfigResponse>> {
  try {
    const response = await api.get<ApiResponse<ApiConfigResponse>>('/api-configs', {
      params: {
        page: params.page || 1,
        pageSize: params.pageSize || 10,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch API configurations');
    }
    throw error;
  }
}

export async function getApiConfig(id: number): Promise<ApiResponse<ApiConfig>> {
  try {
    const response = await api.get<ApiResponse<ApiConfig>>(`/api-configs/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch API configuration');
    }
    throw error;
  }
}

export async function createApiConfig(data: CreateApiConfigParams): Promise<ApiResponse<ApiConfig>> {
  try {
    const response = await api.post<ApiResponse<ApiConfig>>('/api-configs', data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create API configuration');
    }
    throw error;
  }
}

export async function updateApiConfig(data: UpdateApiConfigParams): Promise<ApiResponse<ApiConfig>> {
  try {
    const response = await api.put<ApiResponse<ApiConfig>>(`/api-configs/${data.id}`, data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update API configuration');
    }
    throw error;
  }
}

export async function deleteApiConfig(id: number): Promise<ApiResponse<void>> {
  try {
    const response = await api.delete<ApiResponse<void>>(`/api-configs/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to delete API configuration');
    }
    throw error;
  }
}

export default api; 