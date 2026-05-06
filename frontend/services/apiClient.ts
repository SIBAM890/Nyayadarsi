/**
 * Centralized API client with typed responses and auth token injection.
 */
import type { ApiResponse } from '@/types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Retrieve the stored auth token from sessionStorage.
 */
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('nyayadarsi_token');
}

/**
 * Build common headers for JSON requests.
 */
function buildHeaders(customHeaders?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (customHeaders) {
    const entries =
      customHeaders instanceof Headers
        ? Array.from(customHeaders.entries())
        : Object.entries(customHeaders);
    for (const [key, value] of entries) {
      headers[key] = value as string;
    }
  }

  return headers;
}

/**
 * Extract a human-readable error message from a failed API response.
 */
function extractErrorMessage(data: Record<string, unknown>, fallback: string): string {
  if (typeof data.detail === 'string') return data.detail;
  if (typeof data.message === 'string') return data.message;
  if (typeof data.detail === 'object' && data.detail !== null) {
    const detail = data.detail as Record<string, unknown>;
    if (typeof detail.message === 'string') return detail.message;
  }
  return fallback;
}

/**
 * Typed JSON API fetch wrapper.
 * Returns a consistent `{ data, error }` shape for every request.
 */
export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: buildHeaders(options.headers as HeadersInit | undefined),
    });

    const text = await response.text();
    let data: Record<string, unknown>;
    
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error(`Invalid JSON from ${url}:`, text.substring(0, 100) + '...');
      return {
        data: null,
        error: `Server returned invalid format (HTTP ${response.status})`,
      };
    }

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        // Guard against infinite reload: only retry once
        if (!sessionStorage.getItem('nyayadarsi_auth_retry')) {
          sessionStorage.setItem('nyayadarsi_auth_retry', 'true');
          sessionStorage.removeItem('nyayadarsi_token');
          window.location.reload();
        } else {
          // Second 401 after retry — do NOT reload again, just clear state
          console.error('[Auth] Auth failed after retry. Backend may be unavailable.');
          sessionStorage.removeItem('nyayadarsi_auth_retry');
        }
      }
      return {
        data: null,
        error: extractErrorMessage(data, `Request failed (${response.status})`),
      };
    }

    if (data.error === true) {
      return {
        data: null,
        error: extractErrorMessage(data, 'Unknown error'),
      };
    }

    return { data: data as unknown as T, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    console.warn(`API unavailable for ${url}. Falling back to mock data...`);
    
    // Simple mock data router
    try {
      if (url.includes('/evaluation/') && url.includes('/results')) {
        const mock = await import('../demo/mock_data/evaluation_results.json');
        return { data: mock.default as any as T, error: null };
      }
      if (url.includes('/evaluation/') && url.includes('/yellow-queue')) {
        const mock = await import('../demo/mock_data/yellow_queue.json');
        return { data: mock.default as any as T, error: null };
      }
      if (url.includes('/collusion/run') || url.includes('/collusion/report')) {
        const mock = await import('../demo/mock_data/collusion_results.json');
        return { data: mock.default as any as T, error: null };
      }
      if (url.includes('/builder/') && url.includes('/milestones')) {
        const mock = await import('../demo/mock_data/milestones.json');
        return { data: mock.default as any as T, error: null };
      }
      if (url.includes('/audit/trail')) {
        const mock = await import('../demo/mock_data/audit_trail.json');
        return { data: mock.default as any as T, error: null };
      }
      return { data: null, error: message };
    } catch (mockErr) {
      console.error('Mock data not found', mockErr);
      return { data: null, error: message };
    }
  }
}

/**
 * Typed FormData upload wrapper.
 * Does NOT set Content-Type — lets the browser set the multipart boundary.
 */
export async function apiUpload<T>(
  url: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {};
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const text = await response.text();
    let data: Record<string, unknown>;
    
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error(`Invalid JSON from ${url}:`, text.substring(0, 100) + '...');
      return {
        data: null,
        error: `Upload returned invalid format (HTTP ${response.status})`,
      };
    }

    if (!response.ok) {
      return {
        data: null,
        error: extractErrorMessage(data, 'Upload failed'),
      };
    }

    return { data: data as unknown as T, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { data: null, error: message };
  }
}
