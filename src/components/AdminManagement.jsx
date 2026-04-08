import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, UserPlus, Search, Edit2,
  MoreVertical, Building2, Mail, ExternalLink, RefreshCw, Loader2, Filter
} from 'lucide-react';
import { adminService } from '../services/adminService';

export default function AdminManagement({ setView, setEditingAdmin, accentClass, isDark, accentColor }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const textColor = isDark ? 'text-white' : 'text-slate-800';
  const borderColor = isDark ? 'border-slate-800' : 'border-slate-200';
  const colorName = accentColor || 'blue';

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers();

      // Filter for Administrators (RoleId 2 or Name)
      const onlyAdmins = data.filter(user =>
        user.roleId === 2 ||
        user.RoleId === 2 ||
        user.roleName?.toLowerCase() === 'administrator'
      );

      setAdmins(onlyAdmins);
      setError(null);
    } catch (err) {
      setError("Failed to load administrators. Please check the API connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (admin) => {
    setEditingAdmin(admin);
    setView('admin-create');
  };

  const handleToggleStatus = async (adminId) => {
    try {
      await adminService.toggleStatus(adminId);
      setAdmins(prevAdmins => prevAdmins.map(admin => {
        if (admin.id === adminId) {
          const nextStatus = admin.status === 'A' ? 'I' : 'A';
          return { ...admin, status: nextStatus };
        }
        return admin;
      }));
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Could not update administrator status.");
    }
  };

  const filteredAdmins = admins.filter(admin => {
    const search = searchTerm.toLowerCase();
    return (
      (admin.firstname || '').toLowerCase().includes(search) ||
      (admin.lastname || '').toLowerCase().includes(search) ||
      (admin.companyName || '').toLowerCase().includes(search) ||
      (admin.email || admin.Email || '').toLowerCase().includes(search)
    );
  });

  return (
    <div className="h-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            System <span className={`text-${colorName}-600`}>Administration</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Oversee company-level administrators and access rights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdmins}
            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          
          <button
            onClick={() => { setEditingAdmin(null); setView('admin-create'); }}
            className={`flex items-center justify-center gap-2 px-6 py-3 ${accentClass} text-white rounded-2xl font-bold shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98] whitespace-nowrap`}
          >
            <UserPlus size={20} />
            <span>Create New Admin</span>
          </button>
        </div>
      </div>

      {/* 2. Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-6 rounded-3xl border ${borderColor} bg-white dark:bg-[#1e293b] shadow-sm`}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Admins</p>
          <p className={`text-3xl font-black mt-1 ${textColor}`}>{admins.length}</p>
        </div>
      </div>

      {/* 3. Search & Filter Bar - Standalone UI */}
      <div className="bg-white dark:bg-[#1e293b] p-4 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, company, or email..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-[#0f172a] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold">
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      {/* 4. Table Section */}
      <div className={`bg-white dark:bg-[#1e293b] border ${borderColor} rounded-3xl shadow-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className={`animate-spin ${accentClass?.replace('bg-', 'text-')}`} size={40} />
              <p className="text-slate-500 animate-pulse font-medium">Loading system administrators...</p>
            </div>
          ) : error ? (
            <div className="py-24 text-center text-red-500 px-6 font-medium">{error}</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-6 py-5">Administrator</th>
                  <th className="px-6 py-5">Assigned Company</th>
                  <th className="px-6 py-5">Plant Location</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${accentClass} bg-opacity-10 flex items-center justify-center text-xs font-bold ${accentClass?.replace('bg-', 'text-')}`}>
                          {admin.firstname?.[0]}{admin.lastname?.[0]}
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${textColor}`}>{admin.firstname} {admin.lastname}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail size={12} /> {admin.email || admin.Email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <Building2 size={14} className="text-slate-400" />
                        {admin.companyName || "N/A"}
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {admin.plantName || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight transition-colors ${admin.status === 'A'
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                        }`}>
                        {admin.status === 'A' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {/* Status Toggle Switch */}
                        <div className="flex items-center gap-2 mr-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            {/*admin.status === 'A' ? 'Active' : 'Inactive'*/}
                          </span>
                          <button
                            onClick={() => handleToggleStatus(admin.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${admin.status === 'A' ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${admin.status === 'A' ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Action Buttons */}
                        <button
                          onClick={() => handleEditClick(admin)}
                          className="p-2.5 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-400 hover:text-blue-600 dark:bg-slate-700/50 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filteredAdmins.length === 0 && !error && (
            <div className="py-24 text-center text-slate-500 font-medium">
              No administrators found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}