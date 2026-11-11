import React from 'react';
import { Cloud, BookOpen, Layers, Activity } from 'lucide-react';

interface NavbarProps {
  onOpenArchModal: () => void;
  systemStatus: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenArchModal, systemStatus }) => {
  return (
    <nav className="navbar">
      <div className="container nav-container">
        <a href="/" className="brand">
          <div className="brand-icon">
            <Cloud size={22} color="#ffffff" />
          </div>
          <span>CloudDrop</span>
          <span className="badge-aws">AWS Demo</span>
        </a>

        <div className="nav-links">
          <div className="arch-pill" style={{ display: 'inline-flex' }}>
            <span
              className="arch-pill-dot"
              style={{ background: systemStatus === 'UP' ? '#10b981' : '#f59e0b' }}
            ></span>
            <span>NLB Status: {systemStatus}</span>
          </div>

          <button onClick={onOpenArchModal} className="btn btn-secondary">
            <Layers size={16} />
            <span>Architecture & Topics</span>
          </button>

          <a
            href="/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            <BookOpen size={16} />
            <span>Swagger Docs</span>
          </a>
        </div>
      </div>
    </nav>
  );
};

