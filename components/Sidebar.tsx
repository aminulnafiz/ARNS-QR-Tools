
import React from 'react';
import { AppView } from '../types';
import { usePlatform } from '../store';
import { SettingsIcon, BookOpenIcon, CalendarIcon } from './Icon';
import { ScanIcon, QRIcon, ChatIcon, HistoryIcon } from './Icons';

interface SidebarProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const { config, isAdmin } = usePlatform();

  const navItems = [
    { id: 'SCANNER', label: 'QR Scanner', icon: ScanIcon, enabled: true },
    { id: 'GENERATOR', label: 'QR Studio', icon: QRIcon, enabled: true },
    { id: 'AICHT', label: 'AI Assistant', icon: ChatIcon, enabled: true },
    { id: 'HISTORY', label: 'History', icon: HistoryIcon, enabled: true },
    { id: 'DIVIDER', label: '', icon: null, enabled: true, isDivider: true },
    { id: 'SETTINGS', label: 'Preferences', icon: SettingsIcon, enabled: true },
    { id: 'ADMIN', label: 'Master Hub', icon: SettingsIcon, enabled: isAdmin, isSpecial: true },
  ];

  const externalLinks = [
    { label: 'Study Zone', url: 'https://arns-study-zone.vercel.app/', icon: BookOpenIcon, color: 'text-blue-400' },
    { label: 'Exam Routine', url: 'https://arns-exam-routine.vercel.app/', icon: CalendarIcon, color: 'text-cyan-400' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-slate-950 border-r border-white/5 z-50 h-full no-print shrink-0">
      <div className="p-10">
        <h1 className="text-3xl font-black italic bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent tracking-tighter">
          ARNS<span className="text-slate-200">.</span>
        </h1>
        <p className="text-[8px] font-black uppercase text-slate-600 tracking-[0.4em] mt-2">Hybrid Ecosystem</p>
      </div>

      <nav className="flex-1 px-6 space-y-1 overflow-y-auto no-scrollbar py-4">
        {navItems.map((item) => {
          if (!item.enabled) return null;
          if (item.isDivider) return <div key="div" className="h-px bg-white/5 my-6 mx-2" />;
          
          const isActive = activeView === item.id;
          const Icon = item.icon as any;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as AppView)}
              className={`w-full flex items-center space-x-4 px-6 py-4 rounded-[1.25rem] transition-all duration-300 group
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                ${item.isSpecial ? 'mt-8 border border-white/5' : ''}
              `}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="text-[13px] font-extrabold uppercase tracking-wide">{item.label}</span>
            </button>
          );
        })}

        <div className="pt-8 pb-4">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 px-6">External Portals</p>
          <div className="space-y-2">
            {externalLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center space-x-4 px-6 py-4 rounded-[1.25rem] text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-300 border border-transparent hover:border-white/5"
              >
                <link.icon className={`w-5 h-5 ${link.color}`} />
                <span className="text-[13px] font-bold tracking-tight">{link.label}</span>
                <svg className="w-3 h-3 ml-auto opacity-30" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3h6v6m-11 5L22 3"/></svg>
              </a>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-8">
        <div className="bg-slate-900/50 rounded-[2rem] p-5 border border-white/5">
           <div className="flex items-center space-x-3 mb-2">
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">System Cloud Live</span>
           </div>
           <p className="text-[10px] text-slate-600 font-medium italic">© 2025 ARNS Industry LTD</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
