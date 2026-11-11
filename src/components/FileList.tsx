import React, { useState } from 'react';
import { Download, Trash2, Copy, Check, ExternalLink, RefreshCw, Clock } from 'lucide-react';
import { FileRecord } from '../types';
import { api } from '../services/api';

interface FileListProps {
  files: FileRecord[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const FileList: React.FC<FileListProps> = ({ files, isLoading, onRefresh }) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatExpiry = (epochSeconds: number) => {
    if (!epochSeconds) return 'Never';
    const date = new Date(epochSeconds * 1000);
    const now = new Date();
    const diffHours = Math.round((date.getTime() - now.getTime()) / (1000 * 3600));
    if (diffHours <= 0) return 'Expired';
    if (diffHours < 24) return `In ${diffHours} hr${diffHours > 1 ? 's' : ''}`;
    return date.toLocaleDateString();
  };

  const handleDownload = async (fileId: string) => {
    try {
      setDownloadingId(fileId);
      const res = await api.getDownloadUrl(fileId);
      // Trigger download via pre-signed S3 GET URL
      window.open(res.downloadUrl, '_blank');
      onRefresh();
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to generate pre-signed download URL');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCopyLink = async (fileId: string) => {
    try {
      const res = await api.getDownloadUrl(fileId);
      await navigator.clipboard.writeText(res.downloadUrl);
      setCopiedId(fileId);
      setTimeout(() => setCopiedId(null), 3000);
    } catch (err) {
      console.error('Copy link failed:', err);
      alert('Failed to copy download link');
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file from S3 and DynamoDB?')) return;
    try {
      setDeletingId(fileId);
      await api.deleteFile(fileId);
      onRefresh();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete file');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="card">
      <div className="card-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Active Transfers & Stored Files</span>
          <span className="badge-aws">{files.length} Files</span>
        </div>
        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          disabled={isLoading}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {files.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No files uploaded yet</p>
          <p style={{ fontSize: '0.85rem' }}>
            Upload a file above to test S3 pre-signed upload, Lambda processing, and DynamoDB storage.
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="files-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Size</th>
                <th>Status</th>
                <th>Downloads</th>
                <th>Expires (TTL)</th>
                <th>Lambda Metadata</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.fileId}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{file.originalName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ID: {file.fileId.slice(0, 8)}...
                    </div>
                  </td>
                  <td>{formatBytes(file.sizeBytes)}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        file.status === 'READY'
                          ? 'status-ready'
                          : file.status === 'PROCESSING'
                          ? 'status-processing'
                          : 'status-pending'
                      }`}
                    >
                      {file.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#60a5fa' }}>
                      {file.downloadCount || 0}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={14} color="var(--text-muted)" />
                      <span>{formatExpiry(file.expiresAt)}</span>
                    </div>
                  </td>
                  <td>
                    {file.processedMetadata ? (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          background: '#1f2937',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '4px',
                          color: '#10b981',
                        }}
                      >
                        MD5: {file.processedMetadata.md5Checksum?.slice(0, 10)}...
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Pending Lambda
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleDownload(file.fileId)}
                        disabled={downloadingId === file.fileId}
                        className="btn btn-secondary btn-sm"
                        title="Download file directly from S3"
                      >
                        <Download size={14} />
                        <span>Download</span>
                      </button>

                      <button
                        onClick={() => handleCopyLink(file.fileId)}
                        className="btn btn-secondary btn-sm"
                        title="Copy time-limited pre-signed download URL"
                      >
                        {copiedId === file.fileId ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                        <span>{copiedId === file.fileId ? 'Copied' : 'Share'}</span>
                      </button>

                      <button
                        onClick={() => handleDelete(file.fileId)}
                        disabled={deletingId === file.fileId}
                        className="btn btn-danger btn-sm"
                        title="Delete from S3 and DynamoDB"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

