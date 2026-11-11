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
        [],
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
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/20 mb-8 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <UploadCloud size={22} className="text-blue-500" />
          <h2 className="text-lg font-semibold text-white">Send & Share Files</h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <Lock size={13} />
          <span>Encrypted Transfer</span>
        </div>
      </div>

      {/* File Dropzone */}
      <div
        className="border-2 border-dashed border-slate-700/80 hover:border-blue-500 hover:bg-blue-500/[0.03] transition-all rounded-xl p-8 sm:p-10 text-center cursor-pointer group"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
          <UploadCloud size={28} />
        </div>
        <div className="text-base font-semibold text-gray-200 mb-1">
          {file ? file.name : 'Click to browse or drag and drop your file here'}
        </div>
        <div className="text-xs text-slate-400">
          {file
            ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • ${file.type || 'Binary Document'}`
            : 'Supports files up to 5 GB • Auto-expiring secure links'}
        </div>
      </div>

      {/* Custom Dropdown Settings Bar */}
      <div className="mt-6 flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-400">
          Link Expiration Window
        </label>

        <div className="relative w-full" ref={dropdownRef}>
          <button
            type="button"
            className={`w-full flex items-center justify-between bg-slate-800/80 hover:bg-slate-800 border rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
              isDropdownOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-700/80'
            }`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isUploading}
          >
            <div className="flex items-center gap-2.5">
              <Clock size={16} className="text-blue-400" />
              <span className="font-medium text-white">Expires in {selectedExpiry.label}</span>
              {selectedExpiry.recommended && (
                <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                  Recommended
                </span>
              )}
            </div>
            <ChevronDown
              size={18}
              className={`text-slate-400 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-dropdown divide-y divide-slate-800">
              {EXPIRY_OPTIONS.map((option) => (
                <div
                  key={option.hours}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                    selectedExpiry.hours === option.hours
                      ? 'bg-blue-600/15 text-white'
                      : 'hover:bg-slate-800/70 text-slate-200'
                  }`}
                  onClick={() => {
                    setSelectedExpiry(option);
                    setIsDropdownOpen(false);
                  }}
                >
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span>Expires in {option.label}</span>
                      {option.recommended && (
                        <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{option.description}</div>
                  </div>
                  {selectedExpiry.hours === option.hours && (
                    <Check size={16} className="text-blue-500 shrink-0 ml-3" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="mt-5">
          <div className="flex justify-between mb-1.5 text-xs text-slate-400">
            <span>Encrypting and uploading securely...</span>
            <span className="font-medium text-blue-400">{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-200 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Status Message */}
      {statusMessage && (
        <div
          className={`mt-5 p-3.5 rounded-xl flex items-center gap-2.5 text-sm border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={18} className="shrink-0" />
          ) : (
            <AlertCircle size={18} className="shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-6 flex justify-end">
        <button
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
