import React from 'react';
import { Activity, Shield, BookOpen, Settings, Fingerprint } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 h-screen border-r border-[#00f0ff]/20 bg-[#0a0a0f] flex flex-col z-20">
      <div className="p-6 flex items-center gap-3 border-b border-[#00f0ff]/20">
        <Fingerprint className="w-8 h-8 text-[#00ff41] animate-pulse" />
        <h1 className="text-xl font-mono font-bold text-slate-200">Cyber<span className="text-[#00ff41]">Guardian</span></h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <a href="#" className="flex items-center gap-3 p-3 rounded-lg bg-[#00f0ff]/10 text-[#00f0ff] border border-[rgba(0,240,255,0.3)] glow-blue">
          <Activity className="w-5 h-5" />
          <span className="font-mono">Live Simulation</span>
        </a>
        <a href="#" className="flex items-center gap-3 p-3 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all">
          <Shield className="w-5 h-5" />
          <span className="font-mono">Threat Feed</span>
        </a>
        <a href="#" className="flex items-center gap-3 p-3 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all">
          <BookOpen className="w-5 h-5" />
          <span className="font-mono">Playbooks</span>
        </a>
      </nav>
      
      <div className="p-4 border-t border-[#00f0ff]/20">
        <div className="flex items-center gap-3 p-3 rounded-lg text-slate-400 hover:text-slate-100 cursor-pointer">
          <Settings className="w-5 h-5" />
          <span className="font-mono">Settings</span>
        </div>
      </div>
    </div>
  );
};
