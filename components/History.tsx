
import React, { useState } from 'react';
import { useApp } from '../store';
import { ScanIcon, QRIcon, HistoryIcon } from './Icons';
import { TrashIcon } from './Icon';

const History: React.FC = () => {
  const { history, clearHistory, deleteHistoryItem } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = history.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.content.toLowerCase().includes(query) ||
      (item.qrType || '').toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-black text-white italic tracking-tight">Activity Log</h2>
          <p className="text-slate-400 text-sm">Offline history vault</p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="text-[10px] font-black uppercase text-rose-500 bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20"
          >
            Nuke All
          </button>
        )}
      </div>

      {/* Search Bar */}
      {history.length > 0 && (
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-3 text-white placeholder:text-slate-600 outline-none focus:border-blue-500/50 transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
          <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-6">
            <HistoryIcon className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-500 font-bold tracking-tight italic">Vault is currently empty.</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-slate-600 text-sm font-bold">No matches found for "{searchQuery}"</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <div key={item.id} className="glass p-5 rounded-[1.5rem] border-slate-800 group hover:border-white/20 transition-all animate-in slide-in-from-left-4 duration-300">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  item.type === 'SCAN' ? 'bg-blue-600/20 text-blue-500' : 'bg-emerald-600/20 text-emerald-500'
                }`}>
                  {item.type === 'SCAN' ? <ScanIcon className="w-6 h-6" /> : <QRIcon className="w-6 h-6" />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
                    {item.type} • {item.qrType || 'Standard'}
                  </p>
                  <p className="text-sm font-bold text-white truncate max-w-xs">{item.content}</p>
                </div>
                <div className="flex items-center space-x-2">
                   <button 
                    onClick={() => {
                      navigator.clipboard.writeText(item.content);
                      alert('Copied!');
                    }}
                    className="p-2 text-slate-400 hover:text-white"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                   </button>
                   <button 
                    onClick={() => deleteHistoryItem(item.id)}
                    className="p-2 text-rose-500/40 hover:text-rose-500 transition-colors"
                   >
                     <TrashIcon className="w-4 h-4" />
                   </button>
                </div>
              </div>
              <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mt-4">
                {new Date(item.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
