
import React, { useState } from 'react';
import { usePlatform } from '../store';
import { AppView } from '../types';

interface LandingPageProps {
  onStart: (view: AppView) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const { config, login } = usePlatform();
  const [showAuth, setShowAuth] = useState<'login' | 'register' | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    login({ name: formData.name || 'Power User', email: formData.email, role: 'student' });
    onStart('SCANNER');
  };

  return (
    <div className="min-h-screen bg-slate-950 selection:bg-blue-500/30">
      <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 px-8 py-5 flex items-center justify-between">
        <h1 className="text-2xl font-black italic text-white tracking-tighter">ARNS <span className="text-blue-500">QR.</span></h1>
        <div className="flex items-center space-x-8">
           <button onClick={() => setShowAuth('login')} className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Sign In</button>
           <button onClick={() => setShowAuth('register')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg shadow-blue-600/20 active:scale-95">Get Started</button>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-8 mb-32">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em]">Next-Gen Utility Hub</span>
          </div>
          <h2 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter leading-none">
            Elite Scanning. <br />
            <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 bg-clip-text text-transparent">Smarter Results.</span>
          </h2>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            The world's most advanced QR toolkit. Instant scanning, customizable studio generation, and Gemini-powered AI intelligence in one unified interface.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
             <button onClick={() => onStart('SCANNER')} className="w-full sm:w-auto bg-white text-slate-950 px-10 py-5 rounded-2xl font-black text-lg hover:bg-blue-500 hover:text-white transition-all shadow-xl shadow-white/10 active:scale-95">Open Scanner</button>
             <button onClick={() => onStart('GENERATOR')} className="w-full sm:w-auto bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-lg border border-slate-800 hover:border-slate-600 transition-all active:scale-95">Create QR</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Vision Scanner', desc: 'Hybrid lightning-speed engine for instant detection.', color: 'blue' },
            { title: 'Design Studio', desc: 'Craft professional, branded QR codes with precision.', color: 'emerald' },
            { title: 'AI Intelligence', desc: 'Consult Gemini 3 Pro for complex data insights.', color: 'purple' }
          ].map((f, i) => (
            <div key={i} className="glass-panel p-10 rounded-[2.5rem] border border-slate-800 group hover:border-blue-500/30 transition-all cursor-default">
              <div className={`w-12 h-12 rounded-2xl bg-${f.color}-500/20 mb-6 flex items-center justify-center border border-${f.color}-500/30 group-hover:scale-110 transition-transform`}>
                 <div className={`w-3 h-3 rounded-full bg-${f.color}-500 shadow-lg shadow-${f.color}-500`} />
              </div>
              <h4 className="text-2xl font-black text-white mb-4 italic tracking-tight">{f.title}</h4>
              <p className="text-slate-500 leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {showAuth && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="glass-panel p-10 rounded-[3rem] w-full max-w-md relative border-slate-800/50 shadow-2xl">
              <button onClick={() => setShowAuth(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              <div className="text-center mb-10">
                <h3 className="text-3xl font-black text-white italic">{showAuth === 'login' ? 'Welcome Back' : 'Join ARNS QR'}</h3>
                <p className="text-slate-500 text-sm mt-2">{showAuth === 'login' ? 'Sign in to access your dashboard' : 'Access the world\'s smartest QR suite'}</p>
              </div>
              <form onSubmit={handleAuth} className="space-y-4">
                 {showAuth === 'register' && (
                    <input type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-blue-600" required />
                 )}
                 <input type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-blue-600" required />
                 <input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-blue-600" required />
                 <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95">
                    {showAuth === 'login' ? 'Sign In' : 'Register Now'}
                 </button>
              </form>
           </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 opacity-10 hover:opacity-100 transition-opacity">
        <button onClick={() => onStart('ADMIN')} className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-500 hover:text-white">Admin</button>
      </div>
    </div>
  );
};

export default LandingPage;
