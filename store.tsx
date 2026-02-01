
import React, { createContext, useContext, useState, useEffect } from 'react';
import { QRHistoryItem, PlatformConfig, User } from './types';
import { supabase } from './lib/supabase';

interface AppState {
  config: PlatformConfig;
  history: QRHistoryItem[];
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  setConfig: (config: PlatformConfig) => void;
  updateConfig: (config: PlatformConfig) => void;
  addHistory: (item: Omit<QRHistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
  login: (user: User) => void;
  logout: () => void;
}

const STORAGE_KEY_CONFIG = 'arns_qr_config';

const DEFAULT_CONFIG: PlatformConfig = {
  appName: 'Dakhil 2026 QR',
  enableVibration: true,
  autoOpenLinks: true,
  saveHistory: true,
  qrColor: '#000000',
  bgColor: '#ffffff',
  platformName: 'ARNS QR Pro'
};

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfigState] = useState<PlatformConfig>(DEFAULT_CONFIG);
  const [history, setHistory] = useState<QRHistoryItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const savedUser = localStorage.getItem('arns_user');
        const savedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedConfig) setConfigState(JSON.parse(savedConfig));

        const { data: hData } = await supabase
          .from('history')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);

        if (hData) setHistory(hData);

      } catch (err) {
        console.error('Error syncing with Supabase:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const setConfig = (newConfig: PlatformConfig) => {
    setConfigState(newConfig);
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newConfig));
  };

  const updateConfig = setConfig;

  const addHistory = async (item: Omit<QRHistoryItem, 'id' | 'timestamp'>) => {
    if (!config.saveHistory) return;
    const newItem: QRHistoryItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    
    setHistory(prev => [newItem, ...prev].slice(0, 100));
    await supabase.from('history').insert([newItem]);
  };

  const clearHistory = async () => {
    setHistory([]);
    await supabase.from('history').delete().neq('id', '0');
  };

  const deleteHistoryItem = async (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
    await supabase.from('history').delete().eq('id', id);
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('arns_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('arns_user');
  };

  const isAdmin = user?.role === 'admin' || user?.email === 'aminulnafiz90@gmail.com';

  return (
    <AppContext.Provider value={{ 
      config, history, user, isAdmin, loading,
      setConfig, updateConfig, addHistory, clearHistory, deleteHistoryItem,
      login, logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

export const usePlatform = useApp;
