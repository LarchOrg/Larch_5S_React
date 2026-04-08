import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar 
} from 'recharts';
import { Calendar, Zap, Factory, Clock, Camera, MessageSquare, Info, TrendingUp, AlertCircle } from 'lucide-react';

// --- NEW DATA FOR CHARTS ---
const trendData = [
  { month: 'Jan', score: 65 },
  { month: 'Feb', score: 72 },
  { month: 'Mar', score: 68 },
  { month: 'Apr', score: 85 },
  { month: 'May', score: 92 },
];

const pillarData = [
  { subject: 'Sort', A: 80 },
  { subject: 'Set', A: 98 },
  { subject: 'Shine', A: 86 },
  { subject: 'Stand.', A: 55 }, // <--- This will trigger a "Red Flag"
  { subject: 'Sustain', A: 45 }, // <--- This will trigger a "Red Flag"
];
// ---------------------------

const mySchedule = [
  { time: '09:00 AM', zone: 'Warehouse North', type: 'Full Audit' },
  { time: '01:30 PM', zone: 'Loading Bay', type: 'Spot Check' },
];

const performanceData = [
  { level: 'Plant A', score: 88, color: '#3b82f6' },
  { level: 'Zone 4', score: 74, color: '#10b981' },
  { level: 'Shift 1', score: 92, color: '#8b5cf6' },
];

const zoneGrid = {
  GF1: Array.from({ length: 16 }, (_, i) => ({ id: `GF1-${i + 1}`, status: i % 3 === 0 ? 'completed' : 'pending', champion: 'Arun Kumar' })),
  GF2: Array.from({ length: 22 }, (_, i) => ({ id: `GF2-${i + 1}`, status: i % 4 === 0 ? 'completed' : 'pending', champion: 'Priya Sharma' }))
};

export default function AuditorDashboard({ isDark, accentClass }) {
  const [activePlant, setActivePlant] = useState('GF1');
  const [selectedZone, setSelectedZone] = useState(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* 1. Zone Quick-Switcher Grid (Existing) */}
      <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
            <Factory size={20} className="text-blue-500"/> Zone Status Grid
          </h3>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {['GF1', 'GF2'].map(p => (
              <button key={p} onClick={() => setActivePlant(p)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activePlant === p ? `${accentClass} text-white` : 'text-slate-500'}`}>{p}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-11 gap-2">
          {zoneGrid[activePlant].map((zone) => (
            <button
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              className={`h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all border-2 
                ${zone.status === 'completed' ? 'bg-green-500/10 border-green-500 text-green-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}
                ${selectedZone?.id === zone.id ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' : ''}`}
            >
              {zone.id.split('-')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* 2. NEW: Insights Row (Trend & Radar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500"/> Score Velocity
            </h3>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md tracking-tighter">+12% IMPROVEMENT</span>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart with "Red Flag" Logic */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <h3 className="font-bold dark:text-white flex items-center gap-2 mb-4">
             <AlertCircle size={18} className="text-rose-500"/> 5S Compliance Radar
          </h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={pillarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={({payload, x, y, textAnchor, stroke, radius}) => (
                    <text x={x} y={y} textAnchor={textAnchor} fontSize={10} fontWeight="bold" fill={pillarData.find(p => p.subject === payload.value).A < 60 ? '#f43f5e' : '#94a3b8'}>
                      {payload.value}
                    </text>
                  )} 
                />
                <Radar name="5S" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} strokeWidth={3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          {/* Legend for Red Flags */}
          <div className="absolute top-6 right-6 flex flex-col items-end gap-1">
            {pillarData.filter(p => p.A < 60).map(p => (
              <span key={p.subject} className="text-[8px] font-bold text-rose-500 animate-pulse flex items-center gap-1">
                <AlertCircle size={10} /> CRITICAL: {p.subject}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Top Stats (Existing) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border-l-4 border-blue-500 shadow-sm">
          <p className="text-xs text-slate-500 font-bold uppercase">My Audits Today</p>
          <p className="text-2xl font-bold dark:text-white">04</p>
        </div>
        <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border-l-4 border-green-500 shadow-sm">
          <p className="text-xs text-slate-500 font-bold uppercase">Completed</p>
          <p className="text-2xl font-bold dark:text-white">02</p>
        </div>
        
        {/* Champion Contact Card (Existing) */}
        {selectedZone && (
          <div className="lg:col-span-2 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center justify-between animate-in slide-in-from-right-4">
            <div>
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Zone {selectedZone.id} Champion</p>
              <p className="text-sm font-bold dark:text-white">{selectedZone.champion}</p>
            </div>
            <button className={`${accentClass} text-white p-2 rounded-lg flex items-center gap-2 text-xs font-bold`}>
              <MessageSquare size={14} /> Notify
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Performance Insights (Existing) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold mb-6 flex items-center gap-2 dark:text-white">
            <Factory size={18} className="text-blue-500"/> Live Performance Insights
          </h3>
          {/* ... Existing BarChart and Progress Bars ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {performanceData.map((item, i) => (
                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.level} Performance</span>
                    <span className="text-sm font-bold dark:text-white">{item.score}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.score}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <XAxis dataKey="level" hide />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Start Audit & Schedule (Existing) */}
        <div className="space-y-6">
          <button className={`${accentClass} hover:opacity-90 text-white p-6 rounded-2xl flex flex-col items-center gap-2 shadow-lg transition-transform active:scale-95 w-full`}>
            <Zap size={28} fill="white" />
            <span className="font-bold text-lg">Start New Audit</span>
            {selectedZone && <span className="text-xs opacity-80">Currently: {selectedZone.id}</span>}
          </button>
          
          <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold mb-4 flex items-center gap-2 dark:text-white">
              <Calendar size={18} className="text-blue-500"/> Schedule
            </h3>
            <div className="space-y-3">
              {mySchedule.map((s, i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-blue-500">{s.time}</p>
                  <p className="font-medium text-sm dark:text-white">{s.zone}</p>
                  <p className="text-[10px] text-slate-500">{s.type}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}