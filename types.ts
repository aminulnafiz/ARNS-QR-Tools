
export type AppView = 'SCANNER' | 'GENERATOR' | 'HISTORY' | 'SETTINGS' | 'ADMIN' | 'AICHT';

export interface QRHistoryItem {
  id: string;
  type: 'SCAN' | 'GENERATE';
  content: string;
  timestamp: number;
  qrType?: string;
}

export interface PlatformConfig {
  appName: string;
  enableVibration: boolean;
  autoOpenLinks: boolean;
  saveHistory: boolean;
  qrColor: string;
  bgColor: string;
  platformName: string;
}

export interface User {
  name: string;
  email: string;
  role: 'admin' | 'student';
}
