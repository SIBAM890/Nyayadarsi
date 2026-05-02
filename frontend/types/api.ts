/**
 * Generic API response wrapper.
 * Every service function returns this shape for consistent error handling.
 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Structured API error returned by the backend.
 */
export interface ApiError {
  error: boolean;
  message: string;
  code: string;
}
