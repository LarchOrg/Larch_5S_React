import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ShieldCheck, Users, AlertTriangle, Factory, CheckCircle2, Clock } from 'lucide-react';

const auditorAuditStatus = [
  { name: 'Arun Kumar', completed: 12, pending: 2, accuracy: 94 },
  { name: 'Priya Sharma', completed: 10, pending: 4, accuracy: 88 },
  { name: 'Rajesh V', completed: 15, pending: 0, accuracy: 98 },
  { name: 'Suresh Raina', completed: 8, pending: 5, accuracy: 82 },
];

export default function AdminDashboard({ isDark }) {
  const strokeColor = isDark ? '#334155' : '#e2e8f0';

  return (
    <div className="space-y-6">
      
      {/* Existing Stat Cards... */}
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
            <ShieldCheck className="text-blue-500" size={20}/> Auditor Audit Tracking (Monthly)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-4">Auditor Name</th>
                  <th className="pb-4 text-center">Completed</th>
                  <th className="pb-4 text-center">Pending</th>
                  <th className="pb-4">Accuracy</th>
                  <th className="pb-4">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {auditorAuditStatus.map((auditor, i) => (
                  <tr key={i} className="text-sm">
                    <td className="py-4 font-bold dark:text-white">{auditor.name}</td>
                    <td className="py-4 text-center">
                      <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-md text-xs font-bold">
                        {auditor.completed}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-md text-xs font-bold">
                        {auditor.pending}
                      </span>
                    </td>
                    <td className="py-4 font-medium dark:text-slate-300">{auditor.accuracy}%</td>
                    <td className="py-4 w-48">
                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${(auditor.completed / (auditor.completed + auditor.pending)) * 100}%` }} 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Existing Global 5S Trend Graph... */}
    </div>
  );
}