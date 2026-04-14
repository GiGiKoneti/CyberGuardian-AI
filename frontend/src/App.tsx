import React, { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { Toaster } from 'react-hot-toast';
import { NetworkTopology } from './components/visualization/NetworkTopology';
import { useSimulationStore } from './store/simulationStore';
// Icons removed to improve load times

function App() {
  const { nodes, links, logs, isConnected, startSimulation, generateStep, apiBaseUrl, setApiBaseUrl } = useSimulationStore();
  const [urlInput, setUrlInput] = useState(apiBaseUrl);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setApiBaseUrl(urlInput);
    startSimulation();
  };

  return (
    <MainLayout>
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#0a192f',
          color: '#e2e8f0',
          border: '1px solid rgba(0, 240, 255, 0.2)',
          fontFamily: 'monospace'
        }
      }} />
      <div className="flex flex-col gap-4 h-full p-2 relative z-50">
        
        {/* Controls Bar */}
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between z-50 shrink-0 pointer-events-auto">
          <form onSubmit={handleConnect} className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#00f0ff] pointer-events-auto"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            <input 
              type="text" 
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://your-ngrok-url.app"
              className="bg-[#0a0a0f] border border-[#00f0ff]/30 rounded px-3 py-1.5 focus:outline-none focus:border-[#00f0ff] text-[#00f0ff] font-mono text-sm w-64 pointer-events-auto"
            />
            <button 
              type="submit" 
              disabled={isConnected}
              className={`px-4 py-1.5 rounded font-mono text-sm pointer-events-auto cursor-pointer ${isConnected ? 'bg-[#00ff41]/20 text-[#00ff41] border border-[#00ff41]/30 cursor-default' : 'bg-[#0a0a0f] hover:bg-[#00f0ff]/10 text-white border border-[#00f0ff]/50 transition-colors'}`}
            >
              {isConnected ? 'API CONNECTED' : 'INITIALIZE SIMULATION'}
            </button>
          </form>

          <div className="flex gap-3 relative pointer-events-auto">
            <button 
              onClick={() => generateStep()}
              disabled={!isConnected}
              className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/30 hover:bg-[#00ff41]/20 disabled:opacity-50 disabled:cursor-not-allowed font-mono cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:fill-current transition-all"><polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon></svg>
              TRIGGER AI THINK STEP
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 pointer-events-none">
          {/* Main Visualization Area */}
          <div className="col-span-2 glass-panel rounded-xl flex items-center justify-center p-2 min-h-[400px] pointer-events-auto overflow-hidden">
             {nodes.length > 0 ? (
               <NetworkTopology nodes={nodes} links={links} />
             ) : (
               <span className="text-[#00f0ff] font-mono opacity-50 flex flex-col items-center gap-2">
                 <div className="tracking-[0.2em] font-semibold">[AWAITING CONNECTION]</div>
                 <div className="text-xs">Provide ngrok URL and initialize to boot visualizer.</div>
               </span>
             )}
          </div>
          
          {/* Telemetry Panels */}
          <div className="space-y-6 flex flex-col h-full overflow-hidden pointer-events-auto">
            <div className="glass-panel rounded-xl flex-1 flex flex-col min-h-0">
              <h2 className="font-mono text-[#ff003c] font-semibold p-4 border-b border-[#ff003c]/20 shrink-0">THREAT / RED TEAM FEED</h2>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm">
                {logs.filter(l => ['scan', 'exploit', 'lateral_movement', 'exfiltration', 'beacon'].includes(l.type)).map((log, i) => (
                  <div key={i} className="bg-[#ff003c]/10 border border-[#ff003c]/20 p-2 rounded text-slate-300">
                    <span className="text-[#ff003c] font-bold">[{log.type.toUpperCase()}]</span> Target: {log.target || log.destination || log.source}
                  </div>
                ))}
                {logs.length === 0 && <span className="text-slate-500 italic">Waiting for Red Agent telemetry...</span>}
              </div>
            </div>
            
            <div className="glass-panel rounded-xl flex-1 flex flex-col min-h-0">
              <h2 className="font-mono text-[#00ff41] font-semibold p-4 border-b border-[#00ff41]/20 shrink-0">BLUE TEAM LOGS</h2>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm">
                 {logs.filter(l => ['monitor', 'isolate', 'patch', 'block_ip', 'reset_creds', 'investigate'].includes(l.type)).map((log, i) => (
                  <div key={i} className="bg-[#00ff41]/10 border border-[#00ff41]/20 p-2 rounded text-slate-300">
                    <span className="text-[#00ff41] font-bold">[{log.type.toUpperCase()}]</span> Target: {log.target}
                  </div>
                ))}
                 {logs.length === 0 && <span className="text-slate-500 italic">Standby mode...</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default App;
