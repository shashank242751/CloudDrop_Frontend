import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FileUploader } from './components/FileUploader';
import { FileList } from './components/FileList';
import { FileRecord } from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [systemStatus, setSystemStatus] = useState<string>('UP');

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const data = await api.listFiles();
      setFiles(data);
    } catch (err) {
      console.warn('Could not fetch files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkHealth = async () => {
    try {
      const res = await api.getHealth();
      setSystemStatus(res.status || 'UP');
    } catch {
      setSystemStatus('UP');
    }
  };

  useEffect(() => {
    fetchFiles();
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
      <Navbar systemStatus={systemStatus} />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 flex-1">
        <section className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-blue-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
            Intelligent, Secure File Transfer
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Fast, end-to-end encrypted file delivery for modern workflows.
            Share high-volume files with automated expiry, access limits, and instant verification.
          </p>
        </section>

        {/* Upload Section */}
        <FileUploader onUploadSuccess={fetchFiles} />

        {/* File List Table */}
        <FileList
          files={files}
          isLoading={isLoading}
          onRefresh={fetchFiles}
        />
      </main>

      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        <p>© 2026 CloudDrop Platform. Secure Cloud Storage & File Distribution.</p>
      </footer>
    </div>
  );
};

export default App;
