/**
 * Service for generic file uploads and AI processing.
 */
import { apiUpload } from './apiClient';

export interface UploadResponse {
  success: boolean;
  filename: string;
  processed_text: string;
  original_length: number;
}

/**
 * Upload a document to be processed by the AI backend.
 */
export async function uploadAndProcess(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return await apiUpload<UploadResponse>('/api/v1/upload', formData);
}
