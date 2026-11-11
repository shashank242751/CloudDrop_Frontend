import React from 'react';
import { Cloud, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  systemStatus: string;
}

export const Navbar: React.FC<NavbarProps> = ({ systemStatus }) => {
  return (
    <nav className="navbar">
      <div className="container nav-container">
        <a href="/" className="brand">
          <div className="brand-icon">
            <Cloud size={22} color="#ffffff" />
          </div>
          <span>CloudDrop</span>
        </a>

        <div className="nav-links">
          <div className="status-indicator-pill">
            <span
              className="status-dot"
              style={{ background: systemStatus === 'UP' ? '#10b981' : '#10b981' }}
            ></span>
            <span>Secure & Operational</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <ShieldCheck size={16} color="#10b981" />
            <span>256-bit Encrypted</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
