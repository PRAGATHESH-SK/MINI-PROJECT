import { ApiResponse } from '../types/index.js';

const BASE_URL = (((import.meta as any).env?.VITE_API_URL as string) || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  statusCode: number;
  data: any;
  rejectionCode?: string;

  constructor(message: string, statusCode: number, data?: any, rejectionCode?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
    this.rejectionCode = rejectionCode;
  }
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('connecting_tech_token');

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Include HTTP-only cookies
  });

  // Handle CSV export or binary
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    const blob = await response.blob();
    return { success: true, data: blob as any };
  }

  let result: any;
  try {
    result = await response.json();
  } catch (_e) {
    result = { success: false, error: response.statusText };
  }

  if (!response.ok || result.success === false) {
    throw new ApiError(
      result.error || `Request failed with status ${response.status}`,
      response.status,
      result,
      result.rejectionCode
    );
  }

  return result;
}

export const api = {
  get: <T = any>(url: string) => request<T>(url, { method: 'GET' }),
  post: <T = any>(url: string, body?: any) =>
    request<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T = any>(url: string, body?: any) =>
    request<T>(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T = any>(url: string, body?: any) =>
    request<T>(url, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T = any>(url: string) => request<T>(url, { method: 'DELETE' }),
};
