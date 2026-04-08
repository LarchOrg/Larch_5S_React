import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, User, Mail, Lock, Building2,
  Layers, Loader2, Phone, Plus, X
} from 'lucide-react';
import { userService } from '../services/userService';
import { adminService } from '../services/adminService';
import Swal from 'sweetalert2';

export default function UserCreate({ setView, editData, setEditData, accentClass, accentColor }) {
  const isEditMode = !!editData;
  const [formData, setFormData] = useState({
    firstname: '', lastname: '', email: '',
    password: '', mobileNo: '', roleId: '',
    plant: '', deptId: ''
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [plants, setPlants] = useState([]);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");

  const colorName = accentColor || 'blue';
  const selectedRole = roles.find(r => r.roleId == formData.roleId);
  const isAuditor = selectedRole?.roleName?.toLowerCase().includes('auditor');
  const isDeptRequired = formData.roleId && formData.roleId != 1 && !isAuditor;

  useEffect(() => {
    fetchMasterData();
    if (isEditMode) {
      setFormData({
        firstname: editData.firstname || '',
        lastname: editData.lastname || '',
        email: editData.emailId || '',
        password: '', // Kept empty for security on edit
        mobileNo: editData.mobileNo || '',
        roleId: editData.roleId || '',
        plant: editData.plantId || '',
        deptId: editData.deptId || editData.DepartmentId || ''
      });
    }
  }, [editData]);

  const fetchMasterData = async () => {
    try {
      const [r, d, p] = await Promise.all([
        userService.getRoles(),
        userService.getDepartments(),
        userService.getPlants()
      ]);
      setRoles(r || []); setDepartments(d || []); setPlants(p || []);
    } catch (err) { console.error(err); }
  };

  const validateForm = () => {
    let newErrors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const alphaRegex = /^[A-Za-z\s]+$/;

    if (!formData.firstname.trim()) newErrors.firstname = "Required";
    else if (!alphaRegex.test(formData.firstname)) newErrors.firstname = "Letters only";

    if (!formData.lastname.trim()) newErrors.lastname = "Required";
    else if (!alphaRegex.test(formData.lastname)) newErrors.lastname = "Letters only";

    if (!formData.email) newErrors.email = "Required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid format";

    if (!isEditMode && !formData.password) newErrors.password = "Required";
    else if (!isEditMode && formData.password.length < 6) newErrors.password = "Min. 6 chars";

    if (!formData.mobileNo) newErrors.mobileNo = "Required";
    else if (formData.mobileNo.length < 10) newErrors.mobileNo = "10 digits required";

    if (!formData.roleId) newErrors.roleId = "Required";
    if (!formData.plant) newErrors.plant = "Required";
    if (isDeptRequired && !formData.deptId) newErrors.deptId = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDeptToMaster = async () => {
    if (!newDeptName.trim()) return;
    if (!formData.plant) {
      Swal.fire("Wait", "Please select a Plant first", "warning");
      return;
    }
    try {
      const payload = { cdVDeptName: newDeptName, cdIPlantId: Number(formData.plant), cdICompanyId: 1 };
      await userService.saveDepartment(payload);
      const updatedDepts = await userService.getDepartments();
      setDepartments(updatedDepts);
      setNewDeptName("");
      setShowDeptModal(false);
      Swal.fire("Success", "Department added", "success");
    } catch (err) { Swal.fire("Error", err.message, "error"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        roleId: Number(formData.roleId),
        plantId: Number(formData.plant),
        deptId: isDeptRequired ? Number(formData.deptId) : null,
        companyId: 1
      };

      Swal.fire({ title: isEditMode ? 'Updating...' : 'Creating...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      if (isEditMode) await userService.updateUser(editData.id, payload);
      else await userService.saveUser(payload);

      Swal.close();
      await Swal.fire({ icon: 'success', title: 'Success', timer: 1500, showConfirmButton: false });
      setEditData(null);
      setView('management');
    } catch (err) {
      Swal.fire("Error", err.message || "Action failed", "error");
    } finally { setIsSaving(false); }
  };

  const getInputClass = (field, hasIcon = true) => {
    const base = `w-full ${hasIcon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-white dark:bg-[#0f172a] border rounded-xl outline-none transition-all dark:text-white`;
    const state = errors[field]
      ? 'border-red-500 ring-2 ring-red-50'
      : `border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-${colorName}-500`;
    return `${base} ${state}`;
  };

  const ErrorMsg = ({ field }) => errors[field] ? (
    <p className="text-red-500 text-[10px] mt-1 font-black uppercase tracking-tighter ml-1">{errors[field]}</p>
  ) : null;

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 relative">
      <button onClick={() => { setEditData(null); setView('management'); }} className="flex items-center gap-2 text-slate-500 mb-6 font-medium hover:text-slate-800 transition-colors">
        <ArrowLeft size={20} /> Back to Management
      </button>

      <div className="flex-1 bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col relative">
        <div className={`${accentClass} p-8`}>
          <h2 className="text-2xl font-bold text-white">{isEditMode ? 'Edit User Profile' : 'Create New User'}</h2>
          <p className="text-white/80 text-sm mt-1">Fill in the staff details below.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-10 space-y-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* FIRST NAME */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">First Name</label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.firstname ? 'text-red-400' : 'text-slate-400'}`} size={18} />
                <input className={getInputClass("firstname")} value={formData.firstname} placeholder="John" onChange={e => setFormData({ ...formData, firstname: e.target.value })} />
              </div>
              <ErrorMsg field="firstname" />
            </div>

            {/* LAST NAME */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Last Name</label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.lastname ? 'text-red-400' : 'text-slate-400'}`} size={18} />
                <input className={getInputClass("lastname")} value={formData.lastname} placeholder="Doe" onChange={e => setFormData({ ...formData, lastname: e.target.value })} />
              </div>
              <ErrorMsg field="lastname" />
            </div>

            {/* EMAIL */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.email ? 'text-red-400' : 'text-slate-400'}`} size={18} />
                <input disabled={isEditMode} className={`${getInputClass("email")} ${isEditMode ? 'bg-slate-50 opacity-70 cursor-not-allowed' : ''}`} value={formData.email} placeholder="email@company.com" onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <ErrorMsg field="email" />
            </div>

            {/* MOBILE */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Mobile Number</label>
              <div className="relative">
                <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.mobileNo ? 'text-red-400' : 'text-slate-400'}`} size={18} />
                <input className={getInputClass("mobileNo")} value={formData.mobileNo} placeholder="10-digit number" onChange={e => setFormData({ ...formData, mobileNo: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
              </div>
              <ErrorMsg field="mobileNo" />
            </div>

            {/* PASSWORD */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">{isEditMode ? 'New Password (Optional)' : 'Password'}</label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.password ? 'text-red-400' : 'text-slate-400'}`} size={18} />
                <input type="password" placeholder="••••••••" className={getInputClass("password")} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </div>
              <ErrorMsg field="password" />
            </div>

            {/* ROLE */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">User Role</label>
              <div className="relative">
                <Layers className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.roleId ? 'text-red-400' : 'text-slate-400'}`} size={18} />
                <select className={getInputClass("roleId")} value={formData.roleId} onChange={(e) => setFormData({ ...formData, roleId: e.target.value, deptId: '' })}>
                  <option value="">Select Role</option>
                  {roles
                    .filter(r => {
                      const name = r.roleName?.toLowerCase() || "";
                      return !name.includes('super admin') && !name.includes('administrator');
                    })
                    .map(r => <option key={r.roleId} value={r.roleId}>{r.roleName}</option>)}
                </select>
              </div>
              <ErrorMsg field="roleId" />
            </div>

            {/* PLANT */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Plant Location</label>
              <div className="relative">
                <Building2 className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.plant ? 'text-red-400' : 'text-slate-400'}`} size={18} />
                <select className={getInputClass("plant")} value={formData.plant} onChange={e => setFormData({ ...formData, plant: e.target.value, deptId: '' })}>
                  <option value="">Select Plant</option>
                  {plants.map(p => <option key={p.id} value={p.id}>{p.plantName}</option>)}
                </select>
              </div>
              <ErrorMsg field="plant" />
            </div>

            {/* DEPARTMENT */}
            {isDeptRequired && (
              <div className="space-y-1 md:col-span-2 animate-in slide-in-from-top-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Department Assignment</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Building2 className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.deptId ? 'text-red-400' : 'text-slate-400'}`} size={18} />
                    <select className={getInputClass("deptId")} value={formData.deptId} onChange={(e) => setFormData({ ...formData, deptId: e.target.value })}>
                      <option value="">Select Department</option>
                      {departments.filter(d => d.plantId == formData.plant).map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.deptName}</option>
                      ))}
                    </select>
                  </div>
                  <button type="button" onClick={() => setShowDeptModal(true)} className={`p-3 ${accentClass} text-white rounded-xl shadow-md active:scale-90 transition-all flex-shrink-0`}>
                    <Plus size={20} />
                  </button>
                </div>
                <ErrorMsg field="deptId" />
              </div>
            )}
          </div>

          <div className="pt-8 flex justify-end gap-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => { setEditData(null); setView('management'); }} className="px-8 py-3 font-semibold text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
            <button type="submit" disabled={isSaving} className={`px-12 py-3 ${accentClass} text-white rounded-xl font-bold shadow-lg flex items-center gap-2 active:scale-95 transition-transform`}>
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : null}
              {isSaving ? 'Processing...' : isEditMode ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>

        {/* DEPT MODAL */}
        {showDeptModal && (
          <div className="absolute inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white dark:bg-[#1e293b] w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold dark:text-white">Quick Add Department</h3>
                <button onClick={() => setShowDeptModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <input autoFocus placeholder="Enter Dept Name" className={getInputClass("newDept", false)} value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} />
              <button onClick={handleSaveDeptToMaster} className={`w-full mt-6 py-3 ${accentClass} text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all`}>Save to Master</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}