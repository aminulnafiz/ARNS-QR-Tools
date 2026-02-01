
import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../store';
import { ScanIcon } from './Icons';

const Scanner: React.FC = () => {
  const { addHistory, config } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [libReady, setLibReady] = useState(false);

  // Check for jsQR library
  useEffect(() => {
    const checkLib = () => {
      if ((window as any).jsQR) {
        setLibReady(true);
        return true;
      }
      return false;
    };

    if (checkLib()) return;
    const interval = setInterval(() => {
      if (checkLib()) clearInterval(interval);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!libReady) return;

    let stream: MediaStream | null = null;
    let animationFrameId: number;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Camera error:', err);
        setError('Camera access denied. Please enable permissions.');
      }
    };

    const tick = () => {
      if (!scanning) return;
      
      if (videoRef.current?.readyState === videoRef.current?.HAVE_ENOUGH_DATA && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          const jsQR = (window as any).jsQR;
          if (jsQR) {
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });

            if (code) {
              handleResult(code.data);
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    startCamera();
    tick();

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(animationFrameId);
    };
  }, [scanning, libReady]);

  const handleResult = (data: string) => {
    setScanning(false);
    setResult(data);
    addHistory({ type: 'SCAN', content: data });

    if (config.enableVibration && 'vibrate' in navigator) {
      navigator.vibrate(100);
    }

    if (config.autoOpenLinks && (data.startsWith('http://') || data.startsWith('https://'))) {
      window.open(data, '_blank');
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result || '');
  };

  const resetScanner = () => {
    setResult(null);
    setScanning(true);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-white italic tracking-tight">Smart Scanner</h2>
        <p className="text-slate-400 text-sm">Aim your camera at any QR code</p>
      </div>

      <div className="relative aspect-square w-full rounded-[2.5rem] overflow-hidden bg-slate-900 border border-white/10 shadow-2xl">
        {!libReady ? (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest italic">Booting Engine...</p>
          </div>
        ) : scanning ? (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-blue-500/30 rounded-3xl relative">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-xl" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-xl" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />
                <div className="scanner-line" />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mb-6">
              <ScanIcon className="text-blue-500 w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-4">Scan Successful</h3>
            <div className="w-full bg-slate-800 rounded-2xl p-4 mb-8 max-h-32 overflow-y-auto break-all text-slate-300 text-sm font-medium border border-white/5">
              {result}
            </div>
            <div className="flex w-full space-x-3">
              <button 
                onClick={copyResult}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl border border-white/5 transition-all active:scale-95"
              >
                Copy Text
              </button>
              <button 
                onClick={resetScanner}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              >
                Scan Again
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-center text-sm font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="glass p-4 rounded-3xl text-center border-slate-800">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Status</p>
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${scanning ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-sm font-bold text-slate-200">{scanning ? 'Ready' : 'Captured'}</span>
          </div>
        </div>
        <div className="glass p-4 rounded-3xl text-center border-slate-800">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Mode</p>
          <span className="text-sm font-bold text-slate-200">Auto Detect</span>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
