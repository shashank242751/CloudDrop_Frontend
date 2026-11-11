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
    <div>
      <Navbar systemStatus={systemStatus} />

      <main className="container">
        <section className="hero">
          <h1>Intelligent, Secure File Transfer</h1>
          <p>
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
    </div>
  );
};

export default App;
