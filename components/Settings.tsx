
import React from 'react';
import { useApp } from '../store';

const Settings: React.FC = () => {
  const { config, setConfig } = useApp();

  const toggle = (key: keyof typeof config.toggles | string) => {
    // @ts-ignore
    setConfig({ ...config, [key]: !config[key] });
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-white italic tracking-tight">Platform Settings</h2>
        <p className="text-slate-400 text-sm">Configure your experience</p>
      </div>

      <div className="glass p-8 rounded-[2.5rem] border-slate-800 space-y-6">
        {[
          { id: 'enableVibration', label: 'Tactile Feedback', desc: 'Vibrate on successful scan' },
          { id: 'autoOpenLinks', label: 'Rapid Launch', desc: 'Auto-open links after scanning' },
          { id: 'saveHistory', label: 'Archival System', desc: 'Save all QR activity locally' },
        ].map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex-1 pr-4">
              <h4 className="text-sm font-bold text-white tracking-tight">{item.label}</h4>
              <p className="text-[10px] text-slate-500 font-medium">{item.desc}</p>
            </div>
            <button 
              onClick={() => toggle(item.id)}
              className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
                // @ts-ignore
                config[item.id] ? 'bg-blue-600' : 'bg-slate-800'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                // @ts-ignore
                config[item.id] ? 'right-1' : 'left-1'
              }`} />
            </button>
          </div>
        ))}
      </div>

      <div className="glass p-8 rounded-[2.5rem] border-slate-800">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">About ARNS Tools</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-xs font-bold text-slate-400">Version</span>
            <span className="text-xs font-black text-blue-500 italic">v1.2.4-PRO</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-xs font-bold text-slate-400">Processing Engine</span>
            <span className="text-xs font-bold text-slate-200 uppercase tracking-tighter">JSQR Hybrid v2</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-xs font-bold text-slate-400">Privacy</span>
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-tighter">On-Device Processing</span>
          </div>
        </div>
        <p className="text-[9px] text-slate-600 text-center mt-8 font-black uppercase tracking-[0.3em]">
          © 2025 ARNS Industry LTD
        </p>
      </div>

      <button className="w-full bg-slate-900 border border-slate-800 text-slate-400 font-bold py-4 rounded-2xl hover:text-white transition-all">
        Send Feedback
      </button>
    </div>
  );
};

export default Settings;
