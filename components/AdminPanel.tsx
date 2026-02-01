
import React, { useState } from 'react';
import { usePlatform } from '../store';
import { SettingsIcon } from './Icon';

const AdminPanel: React.FC = () => {
  const { 
    config, isAdmin, login, logout, updateConfig 
  } = usePlatform();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'aminulnafiz90@gmail.com' && password === '@Ainafiz90') {
      login({ name: 'Aminul Nafiz', email, role: 'admin' });
      setError('');
    } else {
      setError('Invalid admin credentials');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="glass-panel p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl border-blue-500/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
              <SettingsIcon className="text-blue-500 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white">Admin Secure Access</h2>
            <p className="text-slate-400 text-sm mt-1">Authorized personnel only</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Access Key</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                required
              />
            </div>
            {error && <p className="text-rose-500 text-xs font-bold bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95">
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-slate-800 pb-8">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter">Master Control</h2>
          <p className="text-slate-400">Live system configuration & branding.</p>
        </div>
        <button onClick={logout} className="bg-rose-600/10 text-rose-500 border border-rose-500/20 px-6 py-3 rounded-xl text-xs font-black uppercase hover:bg-rose-600 hover:text-white transition-all">
          Logout Session
        </button>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <section className="glass p-8 rounded-[2.5rem] space-y-6">
          <h3 className="text-xl font-bold flex items-center"><span className="w-2 h-6 bg-blue-500 rounded-full mr-3" />System Identity</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Platform Branding Name</label>
              <input type="text" value={config.platformName} onChange={(e) => updateConfig({...config, platformName: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Global App Heading</label>
              <input type="text" value={config.appName} onChange={(e) => updateConfig({...config, appName: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-bold" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPanel;
