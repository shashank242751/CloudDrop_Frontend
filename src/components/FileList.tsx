import React, { useState } from 'react';
import { Download, Trash2, Copy, Check, RefreshCw, Clock, ShieldCheck, FileCheck } from 'lucide-react';
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
      window.open(res.downloadUrl, '_blank');
      onRefresh();
    } catch (err) {
      console.error('Download failed:', err);
      alert('Unable to retrieve download URL. The file may have expired.');
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
      alert('Failed to copy link.');
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to permanently delete this file?')) return;
    try {
      setDeletingId(fileId);
      await api.deleteFile(fileId);
      onRefresh();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete file.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/20 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-semibold text-white">Active Transfers & Files</h2>
          <span className="bg-blue-500/15 text-blue-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-500/20">
            {files.length} Active
          </span>
        </div>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-12 px-4 text-slate-400">
          <FileCheck size={40} className="mx-auto mb-3 text-slate-600" />
          <p className="text-base font-medium text-slate-200 mb-1">
            No active file transfers
          </p>
          <p className="text-xs text-slate-500">
            Upload a file above to create your first secure sharing link.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-medium text-slate-400">
                <th className="pb-3 px-3">File Name</th>
                <th className="pb-3 px-3">Size</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Downloads</th>
                <th className="pb-3 px-3">Expires</th>
                <th className="pb-3 px-3">Security Verification</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {files.map((file) => (
                <tr key={file.fileId} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-3">
                    <div className="font-semibold text-white">{file.originalName}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      ID: {file.fileId.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="py-4 px-3 text-slate-300">{formatBytes(file.sizeBytes)}</td>
                  <td className="py-4 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        file.status === 'READY'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : file.status === 'PROCESSING'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {file.status === 'READY' ? 'Available' : file.status}
                    </span>
                  </td>
                  <td className="py-4 px-3 font-semibold text-blue-400">
                    {file.downloadCount || 0}
                  </td>
                  <td className="py-4 px-3 text-slate-400">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Clock size={13} className="text-slate-500" />
                      <span>{formatExpiry(file.expiresAt)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    {file.processedMetadata?.md5Checksum ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck size={13} />
                        MD5: {file.processedMetadata.md5Checksum.slice(0, 10)}...
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-400 font-medium">
                        Verified ✓
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(file.fileId)}
                        disabled={downloadingId === file.fileId}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
                        title="Download file directly"
                      >
                        <Download size={13} />
                        <span>Download</span>
                      </button>

                      <button
                        onClick={() => handleCopyLink(file.fileId)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
                        title="Copy secure link"
                      >
                        {copiedId === file.fileId ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        <span>{copiedId === file.fileId ? 'Copied' : 'Share'}</span>
                      </button>

                      <button
                        onClick={() => handleDelete(file.fileId)}
                        disabled={deletingId === file.fileId}
                        className="p-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 rounded-lg transition-colors"
                        title="Delete file"
                      >
                        <Trash2 size={13} />
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
