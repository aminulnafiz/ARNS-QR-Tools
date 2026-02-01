
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './store';
import { AppView } from './types';
import { 
  ScanIcon, QRIcon, HistoryIcon, SettingsIcon, ChatIcon 
} from './components/Icons';
import Scanner from './components/Scanner';
import Generator from './components/Generator';
import History from './components/History';
import Settings from './components/Settings';
import AIChat from './components/AIChat';
import Sidebar from './components/Sidebar';
import AdminPanel from './components/AdminPanel';

const Main: React.FC = () => {
  const { config, isAdmin } = useApp();
  const [activeView, setActiveView] = useState<AppView>('SCANNER');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'SCANNER': return <Scanner />;
      case 'GENERATOR': return <Generator />;
      case 'HISTORY': return <History />;
      case 'SETTINGS': return <Settings />;
      case 'AICHT': return <AIChat />;
      case 'ADMIN': return <AdminPanel />;
      default: return <Scanner />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden">
      {/* Desktop Sidebar - Hidden on Mobile/Tablet */}
      {isDesktop && (
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
      )}

      <div className="flex flex-col flex-1 h-full relative overflow-hidden transition-all duration-300">
        
        {/* Mobile/Tablet Header */}
        {!isDesktop && (
          <header className="pt-safe px-5 py-4 flex items-center justify-between bg-slate-950/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <QRIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent italic">
                {config.appName.split(' ')[0]} <span className="text-blue-500">{config.appName.split(' ').slice(1).join(' ')}</span>
              </h1>
            </div>
            <div className="flex items-center space-x-2">
               {isAdmin && (
                 <button 
                  onClick={() => setActiveView('ADMIN')}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeView === 'ADMIN' ? 'bg-blue-600/20 text-blue-500' : 'text-slate-400 active:bg-white/10'}`}
                 >
                   <SettingsIcon className="w-5 h-5" />
                 </button>
               )}
               <button 
                onClick={() => setActiveView('SETTINGS')}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeView === 'SETTINGS' ? 'bg-blue-600/20 text-blue-500' : 'text-slate-400 active:bg-white/10'}`}
               >
                 <SettingsIcon className="w-5 h-5" />
               </button>
            </div>
          </header>
        )}

        {/* Content Area */}
        <main className={`flex-1 overflow-y-auto custom-scrollbar no-scrollbar ${isDesktop ? 'p-12' : 'px-4 pt-6 pb-32'}`}>
          <div className={`${isDesktop ? 'max-w-5xl mx-auto' : 'max-w-md mx-auto'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            {renderView()}
          </div>
        </main>

        {/* Mobile Navigation */}
        {!isDesktop && (
          <nav className="fixed bottom-0 inset-x-0 px-6 pb-safe pt-2 bg-slate-950/90 backdrop-blur-xl border-t border-white/5 z-50">
            <div className="flex items-center justify-around bg-slate-900/40 p-1.5 rounded-[2rem] border border-white/5 shadow-2xl max-w-md mx-auto mb-2">
              {[
                { id: 'SCANNER', label: 'Scan', icon: ScanIcon },
                { id: 'GENERATOR', label: 'Create', icon: QRIcon },
                { id: 'AICHT', label: 'AI Chat', icon: ChatIcon },
                { id: 'HISTORY', label: 'History', icon: HistoryIcon },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as AppView)}
                  className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 active:scale-95 ${
                    activeView === item.id 
                      ? 'text-blue-400 bg-blue-500/10' 
                      : 'text-slate-500 active:text-slate-300'
                  }`}
                >
                  <item.icon className={`w-6 h-6 mb-1 ${activeView === item.id ? 'animate-pulse' : ''}`} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default () => (
  <AppProvider>
    <Main />
  </AppProvider>
);
