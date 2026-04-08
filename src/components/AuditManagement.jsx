import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import Swal from 'sweetalert2';
import {
  Search, Calendar, Loader2, Pencil, Trash2, CheckCircle2, Clock, CalendarDays
} from 'lucide-react';

export default function AuditList({ setView, accentClass, accentColor, setSelectedAuditId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const colorName = accentColor || 'blue';

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAuditList();
      setAudits(data);
    } catch (err) {
      console.error("Failed to fetch audits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Audit?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!',
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#1e293b'
    });

    if (result.isConfirmed) {
      try {
        await adminService.deleteAudit(id);
        await fetchAudits();
        Swal.fire({
          title: 'Deleted!',
          text: 'Audit schedule has been removed.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (err) {
        Swal.fire('Error', err.message || 'Delete failed', 'error');
      }
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <CheckCircle2 size={12} /> Completed
          </span>
        );
      case 'in progress':
        return (
          <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
            <Clock size={12} /> In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <CalendarDays size={12} /> {status || 'Scheduled'}
          </span>
        );
    }
  };

  const filteredAudits = audits.filter(audit =>
    (audit.auditor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (audit.department || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center space-y-4">
        <Loader2 className={`animate-spin text-${colorName}-500`} size={40} />
        <p className="text-slate-500 font-medium">Refreshing audit list...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section: Title and Button separated from Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Audit <span className={`text-${colorName}-600`}>Management</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track, schedule, and review your ongoing audits
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedAuditId(null);
            setView('initiate-audit');
          }}
          className={`flex items-center justify-center gap-2 ${accentClass} text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98] whitespace-nowrap w-full md:w-auto`}
        >
          <Calendar size={20} />
          <span>New Audit</span>
        </button>
      </div>

      {/* Search Bar Section: Separate container below the header */}
      <div className="bg-white dark:bg-[#1e293b] p-4 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search audits..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-[#0f172a] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>



      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 font-bold text-slate-700 dark:text-slate-300 text-xs uppercase text-center w-16">#</th>
                <th className="p-4 font-bold text-slate-700 dark:text-slate-300 text-xs uppercase">Auditor</th>
                <th className="p-4 font-bold text-slate-700 dark:text-slate-300 text-xs uppercase">Department</th>
                <th className="p-4 font-bold text-slate-700 dark:text-slate-300 text-xs uppercase">Date</th>
                <th className="p-4 font-bold text-slate-700 dark:text-slate-300 text-xs uppercase text-center">Status</th>
                <th className="p-4 font-bold text-slate-700 dark:text-slate-300 text-xs uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAudits.map((audit, index) => {
                const isLocked = audit.status?.toLowerCase() === 'completed' || audit.status?.toLowerCase() === 'in progress';

                return (
                  <tr key={audit.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="p-4 text-center text-slate-400 font-bold text-xs">{index + 1}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{audit.auditor}</p>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">{audit.department || 'N/A'}</td>
                    <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">{audit.scheduledDate || audit.date}</td>
                    <td className="p-4 text-center">
                      {getStatusBadge(audit.status)}
                    </td>
                    <td className="p-4 text-right">
                      {/* Hide actions if audit is already in progress or completed */}
                      {!isLocked ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedAuditId(audit.id);
                              setView('initiate-audit');
                            }}
                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                            title="Edit Schedule"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(audit.id)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                            title="Delete Schedule"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase italic pr-2">
                          Locked
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredAudits.length === 0 && (
            <div className="p-10 text-center text-slate-500 font-medium uppercase tracking-widest text-xs">No audits found.</div>
          )}
        </div>
      </div>
    </div>
  );
}