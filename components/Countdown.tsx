
import React, { useState, useEffect } from 'react';
import { usePlatform } from '../store';

const Countdown: React.FC = () => {
  const { config } = usePlatform();
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00'
  });

  useEffect(() => {
    const targetDate = new Date(config.countdownDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days: days.toString().padStart(2, '0'),
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [config.countdownDate]);

  if (!config.toggles.showCountdown) return null;

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700">
        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
      </div>

      <h3 className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-4 flex items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2" />
        Countdown to {config.examName}
      </h3>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Minutes', value: timeLeft.minutes },
          { label: 'Seconds', value: timeLeft.seconds },
        ].map((unit, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className="bg-slate-800/80 w-full aspect-square flex items-center justify-center rounded-2xl border border-slate-700 mb-2 relative group">
                <span className="text-3xl md:text-5xl font-black text-white tabular-nums">
                    {unit.value}
                </span>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-500/20 rounded-b-2xl" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Countdown;
