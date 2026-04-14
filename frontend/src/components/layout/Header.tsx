import React from 'react';
// import { AlertTriangle } from 'lucide-react';
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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#ff003c]"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <span className="font-mono font-semibold">{alertsCount} CRITICAL</span>
        </div>
      </div>
    </header>
  );
};
