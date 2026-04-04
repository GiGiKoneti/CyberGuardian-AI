import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden text-slate-300">
      <Sidebar />
      <div className="flex-1 flex flex-col relative w-full h-full">
        {/* Cyber grid background layer */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none z-0" />
        
        <Header />
        <main className="flex-1 overflow-hidden p-6 relative z-10 h-full flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};
