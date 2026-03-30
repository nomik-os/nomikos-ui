import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface UploadedFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
}

export interface MergedResult {
  filename: string;
  totalPages: number;
  size: number;
  url: string;
}

export const documentApi = {
  async uploadDocument(file: File): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('document', file);

    const response = await apiClient.post<{ success: boolean; data: UploadedFile; error?: string }>(
      '/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  async uploadDocuments(
    files: File[],
    onProgress?: (percent: number) => void
  ): Promise<UploadedFile[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('documents', file);
    });

    const response = await apiClient.post<{
      success: boolean;
      data: UploadedFile[];
      error?: string;
    }>('/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return response.data.data;
  },

  async mergeDocuments(
    files: File[],
    onProgress?: (percent: number) => void
  ): Promise<MergedResult> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('documents', file);
    });

    const response = await apiClient.post('/merge', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
      onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    const blob = response.data as Blob;
    const totalPages = parseInt(response.headers['x-total-pages'] || '0', 10);
    const url = URL.createObjectURL(blob);

    // Trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `merged_${totalPages}pages.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    return {
      filename: `merged_${totalPages}pages.pdf`,
      totalPages,
      size: blob.size,
      url,
    };
  },
};

export default documentApi;
