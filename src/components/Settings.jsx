import React, { useEffect, useState } from "react";
import { Settings as SettingsIcon, Moon, Sun, Monitor, CheckCircle2, RefreshCcw, Clock } from "lucide-react";

export default function Settings({ isDark, setIsDark }) {
  const [loading, setLoading] = useState(true);
  const [accent, setAccent] = useState(localStorage.getItem("accent") || "blue");
  const [autoRefresh, setAutoRefresh] = useState(localStorage.getItem("autoRefresh") || "12");
  const [shiftStart, setShiftStart] = useState(localStorage.getItem("shiftStart") || "06:00");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    localStorage.setItem("accent", accent);
    localStorage.setItem("autoRefresh", autoRefresh);
    localStorage.setItem("shiftStart", shiftStart);
    
    // Trigger global accent change
    window.dispatchEvent(new Event('storage')); 
    setShowSuccess(true);
  };

  const accents = [
    { name: "blue", bg: "bg-blue-600", border: "border-blue-600" },
    { name: "green", bg: "bg-green-600", border: "border-green-600" },
    { name: "purple", bg: "bg-purple-600", border: "border-purple-600" },
    { name: "orange", bg: "bg-orange-600", border: "border-orange-600" },
    { name: "red", bg: "bg-red-600", border: "border-red-600" },
  ];

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
      <div className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon size={24} className="text-slate-400" /> System Configuration
        </h2>
        <p className="text-slate-500 dark:text-slate-400">Manage dashboard behavior and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance Card */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold mb-6 flex items-center gap-2 dark:text-white">
             Display & Theme
          </h3>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-3">Theme Mode</label>
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
                <button 
                  onClick={() => setIsDark(false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${!isDark ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                  <Sun size={16} /> Light
                </button>
                <button 
                  onClick={() => setIsDark(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${isDark ? 'bg-slate-700 shadow-sm text-blue-400' : 'text-slate-500'}`}
                >
                  <Moon size={16} /> Dark
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-3">Accent Color</label>
              <div className="flex flex-wrap gap-3">
                {accents.map((a) => (
                  <button
                    key={a.name}
                    onClick={() => setAccent(a.name)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${a.bg} ${accent === a.name ? 'ring-4 ring-offset-2 dark:ring-offset-[#1e293b] ring-slate-300' : 'opacity-80 hover:opacity-100'}`}
                  >
                    {accent === a.name && <CheckCircle2 size={20} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Audit Preferences Card */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold mb-6 flex items-center gap-2 dark:text-white">
             Audit Preferences
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">
                <RefreshCcw size={14} className="inline mr-1" /> Auto-Refresh Interval (Hours)
              </label>
              <input 
                type="number" 
                value={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">
                <Clock size={14} className="inline mr-1" /> Shift 1 Start Time
              </label>
              <input 
                type="time" 
                value={shiftStart}
                onChange={(e) => setShiftStart(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
        >
          Save Configuration
        </button>
      </div>

      {/* Success Modal Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold dark:text-white mb-2">Saved Successfully</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Your system preferences have been updated.</p>
            <button 
              onClick={() => setShowSuccess(false)}
              className="w-full py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-xl"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}