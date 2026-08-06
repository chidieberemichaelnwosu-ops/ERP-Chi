import React, { useEffect, useState } from 'react';
import { Sparkles, ShoppingBag, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  businessName?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ businessName }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 70);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-white text-slate-800 flex flex-col items-center justify-center p-6 select-none overflow-hidden animate-in fade-in duration-300">
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm space-y-8">
        
        {/* LOGO BADGE */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#6A1B9A] via-purple-600 to-[#EC407A] p-0.5 shadow-2xl shadow-purple-900/20 animate-bounce duration-1000">
            <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center text-slate-900 relative overflow-hidden">
              <Sparkles className="w-12 h-12 text-[#6A1B9A] animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/10 to-transparent" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#EC407A] text-white flex items-center justify-center shadow-lg border-2 border-white">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>

        {/* TITLES */}
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Cosmetics ERP
          </h1>
          <p className="text-xs font-black text-[#6A1B9A] tracking-wider uppercase">
            Smart Retail Management
          </p>
          {businessName && businessName !== 'Not Configured' && (
            <p className="text-xs font-semibold text-slate-500 pt-1">
              {businessName}
            </p>
          )}
        </div>

        {/* PROGRESS BAR & LOADER */}
        <div className="w-full space-y-3 pt-4">
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200 shadow-inner">
            <div
              className="bg-gradient-to-r from-[#6A1B9A] via-purple-600 to-[#EC407A] h-full rounded-full transition-all duration-150 ease-out shadow-xs"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verifying Security Credentials...
            </span>
            <span>{progress}%</span>
          </div>
        </div>

      </div>

      {/* FOOTER METADATA */}
      <div className="absolute bottom-6 text-center text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
        Enterprise Cloud Edition • v2.5
      </div>
    </div>
  );
};
