import axios from 'axios';
import { FileRecord, UploadSessionResponse, DownloadUrlResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

const client = axios.create({
  baseURL: API_BASE,
});

export const api = {
  async getHealth(): Promise<{ status: string; service: string }> {
    const res = await client.get('/api/health');
    return res.data;
  },

  async listFiles(): Promise<FileRecord[]> {
    const res = await client.get('/api/files');
    return res.data;
  },

  async requestUpload(
    fileName: string,
    mimeType: string,
    sizeBytes: number,
    expiryHours: number = 24,
    tags: string[] = [],
  ): Promise<UploadSessionResponse> {
    const res = await client.post('/api/files/upload-url', {
      fileName,
      mimeType,
      sizeBytes,
      expiryHours,
      tags,
    });
    return res.data;
  },

  async uploadDirectToS3(
    uploadUrl: string,
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<void> {
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
  },

  async confirmUpload(fileId: string): Promise<void> {
    await client.post(`/api/files/${fileId}/confirm`, {});
  },

  async getDownloadUrl(fileId: string): Promise<DownloadUrlResponse> {
    const res = await client.get(`/api/files/${fileId}/download-url`);
    return res.data;
  },

  async deleteFile(fileId: string): Promise<void> {
    await client.delete(`/api/files/${fileId}`);
  },
};

