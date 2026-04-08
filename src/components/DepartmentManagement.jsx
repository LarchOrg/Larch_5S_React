import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { adminService } from '../services/adminService';
import {
  Search, Edit2, UserPlus, Filter, Loader2,
  Mail, RefreshCw, Building2, Layers, X
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function DepartmentManagement({ setView, editData, setEditData, accentClass, accentColor, isDark }) {
  // 1. Core State
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Filter Specific State
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    plantId: '',
    deptId: '',
    status: ''
  });

  const textColor = isDark ? 'text-white' : 'text-slate-800';
  const borderColor = isDark ? 'border-slate-800' : 'border-slate-200';
  const colorName = accentColor || 'blue';

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userData, roleData, deptData, plantData] = await Promise.all([
        userService.getUsers(),
        userService.getRoles(),
        userService.getDepartments(),
        userService.getPlants()
      ]);
      setUsers(userData || []);
      setRoles(roleData || []);
      setDepartments(deptData || []);
      setPlants(plantData || []);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await adminService.toggleStatus(userId);
      setUsers(prevUsers => prevUsers.map(user =>
        user.id === userId ? { ...user, status: user.status === 'A' ? 'I' : 'A' } : user
      ));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Status Update Failed',
        confirmButtonColor: '#3b82f6',
      });
    }
  };

  // Helper Functions
  const getRoleName = (roleId) => {
    const role = roles.find(r => (r.id === roleId || r.roleId === roleId));
    return role ? (role.roleName || role.name) : "Unknown Role";
  };

  const getPlantName = (plantId) => {
    const plant = plants.find(p => (p.id === plantId || p.plantId === plantId));
    return plant ? (plant.plantName || plant.name) : "-";
  };

  const getDeptName = (id1, id2, roleId) => {
  // 1. Explicitly check for Auditor Role (Role ID 3)
  if (roleId === 3) return "N/A";

  const idToFind = id1 || id2;

  // 2. Strict check: If no ID exists, don't even search the array
  if (!idToFind) return "-";

  // 3. Use loose equality (==) in case one is a string and the other a number
  const dept = departments.find(d => 
    (d.id == idToFind || d.deptId == idToFind || d.DepartmentId == idToFind)
  );

  return dept ? (dept.departmentName || dept.name || dept.deptName) : "-";
};
  // 3. Combined Filter Logic
  const filteredUsers = users
    .filter(u => {
      const role = getRoleName(u.roleId).toLowerCase();
      return role.includes("auditor") || role.includes("dept head") || role.includes("department head");
    })
    .filter(u => {
      const s = (searchTerm || '').toLowerCase();
      const dName = (getDeptName(u.deptId, u.DepartmentId) || '').toLowerCase();

      // Search logic
      const matchesSearch = (
        u.firstname?.toLowerCase().includes(s) ||
        u.lastname?.toLowerCase().includes(s) ||
        u.emailId?.toLowerCase().includes(s) ||
        dName.includes(s)
      );

      // Dropdown logic
      const matchesPlant = !filters.plantId || String(u.plantId) === String(filters.plantId);
      const matchesDept = !filters.deptId || String(u.deptId || u.DepartmentId) === String(filters.deptId);
      const matchesStatus = !filters.status || u.status === filters.status;

      return matchesSearch && matchesPlant && matchesDept && matchesStatus;
    });

  const clearFilters = () => {
    setFilters({ plantId: '', deptId: '', status: '' });
    setSearchTerm('');
  };

  return (
    <div className="h-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            User <span className={`text-${colorName}-600`}>Management</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage departmental heads, auditors, and their location assignments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => { setEditData(null); setView('user-create'); }}
            className={`flex items-center justify-center gap-2 px-6 py-3 ${accentClass} text-white rounded-2xl font-bold shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98]`}
          >
            <UserPlus size={20} />
            Create User
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4">
        <div className="bg-white dark:bg-[#1e293b] p-4 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or department..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-[#0f172a] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border transition-all font-bold ${showFilters
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
          >
            <Filter size={18} />
            <span>Filters</span>
            {(filters.plantId || filters.deptId || filters.status) && (
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            )}
          </button>
        </div>

        {/* Expanded Filters Drawer */}
        {showFilters && (
          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-300">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Plant/Location</label>
              <select
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0f172a] border-none text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.plantId}
                onChange={(e) => setFilters({ ...filters, plantId: e.target.value })}
              >
                <option value="">All Locations</option>
                {plants.map(p => <option key={p.id} value={p.id}>{p.plantName || p.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Department</label>
              <select
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0f172a] border-none text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.deptId}
                onChange={(e) => setFilters({ ...filters, deptId: e.target.value })}
              >
                <option value="">All Departments</option>
                {departments.map(d => {
                  const deptId = d.id || d.deptId || d.departmentId;
                  const deptName = d.departmentName || d.name || d.deptName;

                  return (
                    <option key={deptId} value={deptId}>
                      {deptName}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Account Status</label>
              <select
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0f172a] border-none text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="A">Active Only</option>
                <option value="I">Inactive Only</option>
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

      {/* Table Container */}
      <div className={`bg-white dark:bg-[#1e293b] border ${borderColor} rounded-3xl shadow-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className={`animate-spin ${accentClass?.replace('bg-', 'text-')}`} size={40} />
              <p className="text-slate-500 animate-pulse font-medium">Loading user data...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-6 py-5">User Details</th>
                  <th className="px-6 py-5">Role</th>
                  <th className="px-6 py-5">Plant / Location</th>
                  <th className="px-6 py-5">Department</th>
                  <th className="px-6 py-5 text-right">Status / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${accentClass} bg-opacity-10 flex items-center justify-center text-xs font-bold ${accentClass?.replace('bg-', 'text-')}`}>
                          {user.firstname?.[0]}{user.lastname?.[0]}
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${textColor}`}>{user.firstname} {user.lastname}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Mail size={12} /> {user.emailId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-[10px] font-black uppercase rounded-full border bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400">
                        {getRoleName(user.roleId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-slate-400" />
                        {getPlantName(user.plantId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Layers size={14} className="text-slate-400" />
                        {getDeptName(user.deptId, user.DepartmentId,user.roleId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase ${user.status === 'A' ? 'text-green-500' : 'text-slate-400'}`}>
                            {user.status === 'A' ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className={`relative h-6 w-11 rounded-full transition-colors ${user.status === 'A' ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                          >
                            <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${user.status === 'A' ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                        <button
                          onClick={() => { setEditData(user); setView('user-create'); }}
                          className="p-2.5 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-400 hover:text-blue-600 dark:bg-slate-700/50 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-slate-400 italic">
                      No users found matching the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}