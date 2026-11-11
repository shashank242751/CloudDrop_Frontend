import React from 'react';
import { Cloud, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  systemStatus: string;
}

export const Navbar: React.FC<NavbarProps> = ({ systemStatus }) => {
  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 py-3.5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 text-xl font-bold tracking-tight text-white hover:opacity-95 transition-opacity">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center">
            <Cloud size={22} className="text-white" />
          </div>
          <span>CloudDrop</span>
        </a>

        <div className="flex items-center gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
            <span>Secure & Operational</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>256-bit Encrypted</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
