import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, UserPlus, Search, Edit2,
  MoreVertical, Building2, Mail, RefreshCw, 
  Loader2, Filter, X, Layers
} from 'lucide-react';
import { adminService } from '../services/adminService';

export default function AdminManagement({ setView, setEditingAdmin, accentClass, isDark, accentColor }) {
  // 1. Core State
  const [admins, setAdmins] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  // 2. Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    plantId: '',
    status: ''
  });

  // UI Helpers
  const textColor = isDark ? 'text-white' : 'text-slate-800';
  const borderColor = isDark ? 'border-slate-800' : 'border-slate-200';
  const colorName = accentColor || 'blue';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetching Users and Plants both from adminService
      const [userData, plantData] = await Promise.all([
        adminService.getUsers(),
        adminService.getPlants()
      ]);

      // Filter for Administrators (RoleId 2 or roleName)
      const onlyAdmins = (userData || []).filter(user =>
        user.roleId === 2 ||
        user.RoleId === 2 ||
        user.roleName?.toLowerCase() === 'administrator'
      );

      setAdmins(onlyAdmins);
      setPlants(plantData || []);
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

  const clearFilters = () => {
    setFilters({ plantId: '', status: '' });
    setSearchTerm('');
  };

  // 3. Combined Filtering Logic
  const filteredAdmins = admins.filter(admin => {
    const s = searchTerm.toLowerCase();
    
    // Text search across multiple fields
    const matchesSearch = (
      (admin.firstname || '').toLowerCase().includes(s) ||
      (admin.lastname || '').toLowerCase().includes(s) ||
      (admin.companyName || '').toLowerCase().includes(s) ||
      (admin.plantName || '').toLowerCase().includes(s) ||
      (admin.email || admin.Email || '').toLowerCase().includes(s)
    );

    // Dropdown filters
    const matchesPlant = !filters.plantId || String(admin.plantId) === String(filters.plantId);
    const matchesStatus = !filters.status || admin.status === filters.status;

    return matchesSearch && matchesPlant && matchesStatus;
  });

  return (
    <div className="h-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- 1. HEADER SECTION --- */}
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
            onClick={loadData}
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

      {/* --- 2. STATS SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-6 rounded-3xl border ${borderColor} bg-white dark:bg-[#1e293b] shadow-sm`}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Admins</p>
          <div className="flex items-end justify-between">
            <p className={`text-3xl font-black mt-1 ${textColor}`}>{admins.length}</p>
            <ShieldCheck className="text-slate-200 dark:text-slate-700" size={32} />
          </div>
        </div>
      </div>

      {/* --- 3. SEARCH & FILTERS --- */}
      <div className="space-y-4">
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
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border transition-all font-bold ${
              showFilters 
              ? 'bg-blue-50 border-blue-200 text-blue-600' 
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Filter size={18} />
            <span>Filters</span>
            {(filters.plantId || filters.status) && (
               <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            )}
          </button>
        </div>

        {showFilters && (
          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-300">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Plant/Location</label>
              <select
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0f172a] border-none text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.plantId}
                onChange={(e) => setFilters({ ...filters, plantId: e.target.value })}
              >
                <option value="">All Locations</option>
                {plants.map(p => (
                  <option key={p.id || p.plantId} value={p.id || p.plantId}>
                    {p.plantName || p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Status</label>
              <select
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0f172a] border-none text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="A">Active</option>
                <option value="I">Inactive</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <X size={16} /> Reset All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- 4. DATA TABLE --- */}
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Layers size={14} className="text-slate-400" />
                        {admin.plantName || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight transition-colors ${
                        admin.status === 'A'
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      }`}>
                        {admin.status === 'A' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {/* Status Toggle Switch */}
                        <button
                          onClick={() => handleToggleStatus(admin.id)}
                          title="Toggle Active/Inactive"
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            admin.status === 'A' ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            admin.status === 'A' ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditClick(admin)}
                          className="p-2.5 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-400 hover:text-blue-600 dark:bg-slate-700/50 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        
                        {/* More Actions */}
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
              No administrators found matching your search or filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}