import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Clock,
  ChevronDown,
  Check,
} from 'lucide-react';
import { api } from '../services/api';

interface FileUploaderProps {
  onUploadSuccess: () => void;
}

interface ExpiryOption {
  hours: number;
  label: string;
  description: string;
  recommended?: boolean;
}

const EXPIRY_OPTIONS: ExpiryOption[] = [
  { hours: 1, label: '1 Hour', description: 'Immediate, single-use transfer' },
  { hours: 12, label: '12 Hours', description: 'Same-day business share' },
  { hours: 24, label: '24 Hours', description: 'Standard transfer window', recommended: true },
  { hours: 72, label: '3 Days', description: 'Extended collaboration window' },
  { hours: 168, label: '7 Days', description: 'Maximum retention duration' },
];

export const FileUploader: React.FC<FileUploaderProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedExpiry, setSelectedExpiry] = useState<ExpiryOption>(EXPIRY_OPTIONS[2]); // Default 24h
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

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

      // 1. Request secure upload ticket
      const session = await api.requestUpload(
        file.name,
        file.type || 'application/octet-stream',
        file.size,
        selectedExpiry.hours,
        [], // Clean empty tags (internal tag input removed)
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <UploadCloud size={22} color="#3b82f6" />
          <span>Send & Share Files</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#10b981' }}>
          <Lock size={14} />
          <span>Encrypted Transfer</span>
        </div>
      </div>

      {/* File Dropzone */}
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

      {/* Custom Dropdown Settings Bar */}
      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>
          Link Expiration Window
        </label>

        <div className="custom-dropdown-container" ref={dropdownRef}>
          <button
            type="button"
            className={`custom-dropdown-trigger ${isDropdownOpen ? 'open' : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isUploading}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Clock size={16} color="#60a5fa" />
              <span style={{ fontWeight: 500 }}>Expires in {selectedExpiry.label}</span>
              {selectedExpiry.recommended && (
                <span className="option-badge-recommended">Recommended</span>
              )}
            </div>
            <ChevronDown
              size={18}
              color="var(--text-muted)"
              style={{
                transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>

          {isDropdownOpen && (
            <div className="custom-dropdown-menu">
              {EXPIRY_OPTIONS.map((option) => (
                <div
                  key={option.hours}
                  className={`custom-dropdown-option ${
                    selectedExpiry.hours === option.hours ? 'selected' : ''
                  }`}
                  onClick={() => {
                    setSelectedExpiry(option);
                    setIsDropdownOpen(false);
                  }}
                >
                  <div>
                    <div className="option-main">
                      <span>Expires in {option.label}</span>
                      {option.recommended && (
                        <span className="option-badge-recommended">Recommended</span>
                      )}
                    </div>
                    <div className="option-desc">{option.description}</div>
                  </div>
                  {selectedExpiry.hours === option.hours && (
                    <Check size={16} color="#3b82f6" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress Bar */}
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

      {/* Status Message */}
      {statusMessage && (
        <div
          style={{
            marginTop: '1.25rem',
            padding: '0.85rem 1rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
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

      {/* Action Button */}
      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
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
