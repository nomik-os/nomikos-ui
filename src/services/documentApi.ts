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
  async uploadDocuments(files: File[]): Promise<UploadedFile[]> {
    console.log('[documentApi] Calling uploadDocuments...');
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('documents', file);
    });

    const response = await apiClient.post<{ success: boolean; data: UploadedFile[]; error?: string }>(
      '/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    console.log('[documentApi] uploadDocuments response:', response.data);
    return response.data.data;
  },
};

export default documentApi;
