import React from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    ShieldCheck, Users, Building2, UserPlus,
    PlusCircle, Activity, Globe, MoreVertical
} from 'lucide-react';

// Mock data for Super Admin perspective
const companyData = [
    { name: 'TechCorp Industries', admins: 4, audits: 145, status: 'Active', growth: '+12%' },
    { name: 'Global Logistics', admins: 2, audits: 89, status: 'Active', growth: '+5%' },
    { name: 'EcoSystems Ltd', admins: 6, audits: 230, status: 'Pending Review', growth: '+18%' },
    { name: 'Swift Manufacturing', admins: 3, audits: 67, status: 'Active', growth: '+2%' },
];

const platformTrend = [
    { month: 'Jan', totalAudits: 450 },
    { month: 'Feb', totalAudits: 520 },
    { month: 'Mar', totalAudits: 610 },
    { month: 'Apr', totalAudits: 800 },
];

export default function SuperAdminDashboard({ isDark, accentClass, setView }) {
    const borderColor = isDark ? 'border-slate-800' : 'border-slate-200';
    const bgColor = isDark ? 'bg-[#1e293b]' : 'bg-white';
    const textColor = isDark ? 'text-white' : 'text-slate-800';

    // Extract hex or color name for Recharts if needed, 
    // but we can use CSS variables or common defaults
    const accentColorHex = accentClass?.includes('blue') ? '#3b82f6' :
        accentClass?.includes('green') ? '#10b981' :
            accentClass?.includes('purple') ? '#8b5cf6' : '#3b82f6';

    return (
        <div className="space-y-6">

            {/* Header Section with Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={`text-2xl font-bold ${textColor}`}>Platform Overview</h1>
                    <p className="text-slate-500 text-sm">Managing global companies and system administrators</p>
                </div>


                <div className="flex gap-3">
                    <button
                        onClick={() => setView('admin-management')}
                        className={`flex items-center gap-2 ${accentClass} text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 hover:opacity-90`}
                    >
                        <ShieldCheck size={18} />
                        Manage Administration
                    </button>
                </div>
            </div>

            {/* Top Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Companies', value: '42', icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'System Admins', value: '128', icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { label: 'Active Users', value: '1,420', icon: Users, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'Global Compliance', value: '94.2%', icon: Globe, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                ].map((stat, i) => (
                    <div key={i} className={`${bgColor} ${borderColor} border p-5 rounded-xl shadow-sm transition-all hover:shadow-md`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                                <h3 className={`text-2xl font-bold mt-1 ${textColor}`}>{stat.value}</h3>
                            </div>
                            <div className={`${stat.bg} p-3 rounded-xl`}>
                                <stat.icon className={stat.color} size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Company Management Table */}
                <div className={`lg:col-span-2 ${bgColor} ${borderColor} border rounded-xl shadow-sm overflow-hidden`}>
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <h3 className={`font-bold flex items-center gap-2 ${textColor}`}>
                            <Activity className={accentClass?.split(' ')[0].replace('bg-', 'text-')} size={20} />
                            Company Management
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-6 py-4">Company Name</th>
                                    <th className="px-6 py-4">Admins</th>
                                    <th className="px-6 py-4">Total Audits</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {companyData.map((company, i) => (
                                    <tr key={i} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className={`px-6 py-4 font-bold ${textColor}`}>{company.name}</td>
                                        <td className="px-6 py-4 dark:text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <Users size={14} className="text-slate-400" /> {company.admins}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 dark:text-slate-300">{company.audits}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${company.status === 'Active'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                }`}>
                                                {company.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-slate-400 hover:text-blue-500 transition-colors p-1">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Growth Chart */}
                <div className={`${bgColor} ${borderColor} border p-6 rounded-xl shadow-sm flex flex-col`}>
                    <h3 className={`font-bold mb-6 ${textColor}`}>Platform Scaling Trend</h3>
                    <div className="h-[250px] w-full flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={platformTrend}>
                                <defs>
                                    <linearGradient id="superAccent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={accentColorHex} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={accentColorHex} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#1e293b' : '#fff',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="totalAudits"
                                    stroke={accentColorHex}
                                    fillOpacity={1}
                                    fill="url(#superAccent)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${accentClass} bg-opacity-10`}>
                                <Activity size={16} className={accentClass?.split(' ')[0].replace('bg-', 'text-')} />
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Platform activity is up <span className="font-bold text-green-500">24%</span>. Monitoring infrastructure load.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}