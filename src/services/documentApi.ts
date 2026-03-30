import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

export const documentApi = {
  async uploadDocument(file: File): Promise<UploadedFile> {
    console.log('[documentApi] Calling uploadDocument...');
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
    console.log('[documentApi] uploadDocument response:', response.data);
    return response.data.data;
  },
};

export default documentApi;
