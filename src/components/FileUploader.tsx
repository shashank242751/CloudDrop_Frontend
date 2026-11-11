import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Lock } from 'lucide-react';
import { api } from '../services/api';

interface FileUploaderProps {
  onUploadSuccess: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [expiryHours, setExpiryHours] = useState<number>(24);
  const [tags, setTags] = useState<string>('project, documents');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatusMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setStatusMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setStatusMessage(null);

      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      // 1. Request secure upload ticket
      const session = await api.requestUpload(
        file.name,
        file.type || 'application/octet-stream',
        file.size,
        expiryHours,
        parsedTags,
      );

      // 2. Direct high-speed upload with progress tracking
      await api.uploadDirectToS3(session.uploadUrl, file, (progress) => {
        setUploadProgress(progress);
      });

      // 3. Confirm completion
      await api.confirmUpload(session.fileId);

      setStatusMessage({
        type: 'success',
        text: `"${file.name}" uploaded successfully! Ready for secure sharing.`,
      });

      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUploadSuccess();
    } catch (err: any) {
      console.error('Upload failed:', err);
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'File upload failed. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UploadCloud size={20} color="#3b82f6" />
          <span>Send & Share Files</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#10b981' }}>
          <Lock size={14} />
          <span>Encrypted Transfer</span>
        </div>
      </div>

      <div
        className="dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <div className="dropzone-icon">
          <UploadCloud size={44} />
        </div>
        <div className="dropzone-text">
          {file ? file.name : 'Click to browse or drag and drop your file here'}
        </div>
        <div className="dropzone-sub">
          {file
            ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • ${file.type || 'Binary Document'}`
            : 'Supports files up to 5 GB • Auto-expiring secure links'}
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Link Expiration</label>
          <select
            className="form-select"
            value={expiryHours}
            onChange={(e) => setExpiryHours(Number(e.target.value))}
            disabled={isUploading}
          >
            <option value={1}>Expires in 1 Hour</option>
            <option value={12}>Expires in 12 Hours</option>
            <option value={24}>Expires in 24 Hours (Default)</option>
            <option value={72}>Expires in 3 Days</option>
            <option value={168}>Expires in 7 Days</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Labels / Tags (optional)</label>
          <input
            type="text"
            className="form-input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            disabled={isUploading}
            placeholder="e.g. contracts, invoices, design"
          />
        </div>
      </div>

      {isUploading && (
        <div className="progress-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
            <span>Encrypting and uploading securely...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      )}

      {statusMessage && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            background:
              statusMessage.type === 'success'
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(239, 68, 68, 0.15)',
            color: statusMessage.type === 'success' ? '#10b981' : '#ef4444',
            border: `1px solid ${
              statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
            }`,
          }}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={!file || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Uploading File...</span>
            </>
          ) : (
            <>
              <UploadCloud size={16} />
              <span>Generate Secure Transfer Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
