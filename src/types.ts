export interface FileRecord {
  fileId: string;
  originalName: string;
  s3Key: string;
  mimeType: string;
  sizeBytes: number;
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'EXPIRED';
  uploadedAt: string;
  expiresAt: number;
  downloadCount: number;
  tags?: string[];
  processedMetadata?: {
    md5Checksum?: string;
    previewGenerated?: boolean;
    lambdaProcessedAt?: string;
  };
}

export interface UploadSessionResponse {
  fileId: string;
  s3Key: string;
  uploadUrl: string;
  expiresAt: string;
}

export interface DownloadUrlResponse {
  fileId: string;
  originalName: string;
  downloadUrl: string;
  downloadCount: number;
  expiresInSeconds: number;
}

