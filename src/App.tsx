import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FileUploader } from './components/FileUploader';
import { FileList } from './components/FileList';
import { AwsArchitectureModal } from './components/AwsArchitectureModal';
import { FileRecord } from './types';
import { api } from './services/api';
import { ShieldCheck, Zap, HardDrive, Cpu, Terminal } from 'lucide-react';

export const App: React.FC = () => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [systemStatus, setSystemStatus] = useState<string>('CHECKING');
  const [isArchModalOpen, setIsArchModalOpen] = useState<boolean>(false);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const data = await api.listFiles();
      setFiles(data);
    } catch (err) {
      console.warn('Could not fetch files from backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkHealth = async () => {
    try {
      const res = await api.getHealth();
      setSystemStatus(res.status || 'UP');
    } catch {
      setSystemStatus('OFFLINE');
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
      <Navbar
        onOpenArchModal={() => setIsArchModalOpen(true)}
        systemStatus={systemStatus}
      />

      <main className="container">
        <section className="hero">
          <h1>CloudDrop Intelligent File Transfer</h1>
          <p>
            Enterprise-grade, cloud-native file distribution powered by AWS S3,
            DynamoDB, Lambda, and EC2 Auto Scaling behind an Apache reverse proxy.
          </p>
        </section>

        {/* AWS architecture interactive summary bar */}
        <div className="aws-architecture-strip">
          <div className="arch-pill">
            <span className="arch-pill-dot"></span>
            <span>NLB: Port 80 (TCP)</span>
          </div>
          <div className="arch-pill">
            <span className="arch-pill-dot"></span>
            <span>Apache: Reverse Proxy</span>
          </div>
          <div className="arch-pill">
            <span className="arch-pill-dot"></span>
            <span>ASG: t2/t3.micro (EBS gp3)</span>
          </div>
          <div className="arch-pill">
            <span className="arch-pill-dot"></span>
            <span>S3: Direct Pre-Signed URLs</span>
          </div>
          <div className="arch-pill">
            <span className="arch-pill-dot"></span>
            <span>DynamoDB: TTL Auto-Expire</span>
          </div>
          <div className="arch-pill">
            <span className="arch-pill-dot"></span>
            <span>Lambda: S3 Event Trigger</span>
          </div>
        </div>

        {/* Upload Section */}
        <FileUploader onUploadSuccess={fetchFiles} />

        {/* File List Table */}
        <FileList
          files={files}
          isLoading={isLoading}
          onRefresh={fetchFiles}
        />
      </main>

      <AwsArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />
    </div>
  );
};

export default App;

