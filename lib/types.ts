export interface AuthResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

export interface ApiConfig {
  id: number;
  apiPath: string;
  httpMethod: string;
  sqlQuery: string;
  dbSource: string;
  isActive: boolean;
  createdTimestamp: string;
  lastUpdateTimestamp: string;
}

export interface ApiConfigFormData extends Omit<ApiConfig, 'id'> {}

export interface CreateApiConfigParams {
  apiPath: string;
  httpMethod: string;
  sqlQuery: string;
  dbSource: string;
  isActive: boolean;
}

export interface UpdateApiConfigParams {
  id: number;
  apiPath?: string;
  httpMethod?: string;
  sqlQuery?: string;
  dbSource?: string;
  isActive?: boolean;
}

export interface ApiConfigResponse {
  content: ApiConfig[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}