import React from 'react';
import { AlertTriangle } from 'lucide-react';
// import { useSimulationStore } from '../../store/simulationStore';

export const Header: React.FC = () => {
  // Mock connection state initially
  const isConnected = false; 
  const alertsCount = 0;

  return (
    <header className="h-16 border-b border-[#00f0ff]/20 bg-[#0a0a0f]/90 backdrop-blur-md flex items-center justify-between px-6 z-20">
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-[#00ff41] glow-green' : 'bg-[#facc15] glow-yellow'} animate-pulse`} />
        <span className="font-mono text-sm text-slate-400 tracking-wider">
          API: {isConnected ? 'CONNECTED' : 'STANDBY'}
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#ff003c]/30 text-[#ff003c] bg-[#ff003c]/10">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-mono font-semibold">{alertsCount} CRITICAL</span>
        </div>
      </div>
    </header>
  );
};
