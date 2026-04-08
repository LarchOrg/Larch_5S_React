import React from 'react';
import { CheckSquare, AlertCircle, MapPin, ArrowRight } from 'lucide-react';

const redTags = [
  { area: 'Assembly Line A', issue: 'Leaking Hydraulic Pipe', priority: 'High', date: '2h ago' },
  { area: 'Packaging', issue: 'Unmarked Tool Shadow Board', priority: 'Medium', date: '5h ago' },
  { area: 'QC Lab', issue: 'Expired Calibration Sticker', priority: 'High', date: '1d ago' },
];

export default function DeptHeadDashboard({ isDark, accentClass  }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold dark:text-white">Manufacturing Dept. Overview</h2>
        <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">84% Dept. Score</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2 dark:text-white">
              <AlertCircle size={18} className="text-red-500"/> Action Items (Red Tags)
            </h3>
            <button className="text-blue-500 text-sm font-medium flex items-center gap-1">View All <ArrowRight size={14}/></button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {redTags.map((tag, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex gap-4">
                  <div className={`w-1 h-10 rounded-full ${tag.priority === 'High' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <div>
                    <p className="font-bold text-sm dark:text-white">{tag.issue}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={12}/> {tag.area}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${tag.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    {tag.priority}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">{tag.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-400 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20 flex flex-col justify-between">
          <div>
            <CheckSquare size={32} className="mb-4 opacity-80" />
            <h3 className="text-xl font-bold mb-2">Weekly Review</h3>
            <p className="text-gray-100 text-sm">You have 4 zones pending for weekly standard certification.</p>
          </div>
          <button className="w-full py-3 bg-white text-gray-600 rounded-xl font-bold mt-6 shadow-lg">
            Start Review
          </button>
        </div>
      </div>
    </div>
  );
}
