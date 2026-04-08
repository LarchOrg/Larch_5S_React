import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import {
  ArrowLeft,
  PlayCircle,
  Users,
  Building2,
  Calendar,
  Clock,
  ClipboardCheck,
  MapPin,
  Loader2,
  Pencil
} from 'lucide-react';

export default function InitiateAudit({ setView, accent, selectedAuditId, setSelectedAuditId }) {
  // Form State
  const [formData, setFormData] = useState({
    auditor: '',
    department: '',
    plant: '',
    date: '',
    time: '',
    auditType: '5S Audit'
  });

  // Master Data State
  const [masterData, setMasterData] = useState({
    auditors: [],
    plants: [],
    departments: [],
    loading: true,
    error: null
  });

  // UI States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colorName = accent?.split('-')[1] || 'blue';

  // 1. Fetch Master Data & Existing Audit Data (if editing)
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [auditors, plants, depts] = await Promise.all([
          adminService.getAuditors(),
          adminService.getPlants(),
          adminService.getDepartments()
        ]);

        setMasterData({
          auditors,
          plants,
          departments: depts,
          loading: false,
          error: null
        });

        // If we have an ID, fetch existing details
        if (selectedAuditId) {
          const audit = await adminService.getAuditById(selectedAuditId);
          setFormData({
            auditor: audit.auditorId.toString(),
            plant: audit.plantId.toString(),
            department: audit.deptId?.toString() || '',
            date: audit.date,
            time: audit.time,
            auditType: audit.auditType
          });
        }
      } catch (err) {
        console.error("Data Load Error:", err);
        setMasterData(prev => ({ ...prev, loading: false, error: "Load failed." }));
      }
    };

    fetchAllData();
  }, [selectedAuditId]);

  // 2. Filter Departments based on selected Plant
  const filteredDepartments = masterData.departments.filter(
    d => d.plantId === parseInt(formData.plant)
  );

  // 3. Handle Input Changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    if (field === 'plant') setFormData(prev => ({ ...prev, department: '' }));
  };

  // 4. Submit logic (Create vs Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple Validation
    const newErrors = {};
    if (!formData.auditor) newErrors.auditor = 'Required';
    if (!formData.plant) newErrors.plant = 'Required';
    if (!formData.date) newErrors.date = 'Required';
    if (!formData.time) newErrors.time = 'Required';
    if (formData.auditType === '5S Audit' && !formData.department) newErrors.department = 'Required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        auditorId: parseInt(formData.auditor),
        plantId: parseInt(formData.plant),
        deptId: formData.department ? parseInt(formData.department) : null,
        auditType: formData.auditType,
        date: formData.date,
        time: formData.time,
        companyId: 1,
        createdBy: 101
      };

      if (selectedAuditId) {
        await adminService.updateAudit(selectedAuditId, payload);
      } else {
        await adminService.initiateAudit(payload);
      }

      setSelectedAuditId(null);
      setView('audit-management');
    } catch (err) {
      alert("Submission failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field) => `w-full pl-10 pr-4 py-3 bg-white dark:bg-[#0f172a] border ${errors[field] ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
    } rounded-xl focus:ring-2 focus:ring-${colorName}-500 outline-none transition-all dark:text-white disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:cursor-not-allowed text-sm`;

  if (masterData.loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className={`animate-spin text-${colorName}-500`} size={40} />
        <p className="text-slate-500 font-medium">Loading audit parameters...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            setSelectedAuditId(null);
            setView('audit-management');
          }}
          className={`flex items-center gap-2 text-slate-500 hover:text-${colorName}-600 transition-colors font-medium`}
        >
          <ArrowLeft size={20} /> Back to List
        </button>
      </div>

      <div className="flex-1 bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col overflow-hidden">
        {/* Banner Section */}
        <div className={`${accent} p-8 relative overflow-hidden`}>
          <div className="relative z-10 text-white">
            <h2 className="text-2xl font-bold">{selectedAuditId ? "Edit Audit" : "Initiate New Audit"}</h2>
            <p className="opacity-80 mt-1 font-medium">
              {selectedAuditId ? "Modify existing schedule details." : "Define the auditor, location, and schedule for the next inspection."}
            </p>
          </div>
          {selectedAuditId ? (
            <Pencil className="absolute right-8 top-1/2 -translate-y-1/2 text-white/10" size={120} />
          ) : (
            <PlayCircle className="absolute right-8 top-1/2 -translate-y-1/2 text-white/10" size={120} />
          )}
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} noValidate className="p-10 flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Auditor */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Assign Auditor <span className="text-red-500">*</span></label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select className={inputClass('auditor')} value={formData.auditor} onChange={(e) => handleChange('auditor', e.target.value)} disabled={isSubmitting}>
                  <option value="">Select Auditor</option>
                  {masterData.auditors.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                </select>
              </div>
              {errors.auditor && <p className="text-red-500 text-[11px] font-bold mt-1 ml-1">Required</p>}
            </div>

            {/* Plant */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Plant Location <span className="text-red-500">*</span></label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select className={inputClass('plant')} value={formData.plant} onChange={(e) => handleChange('plant', e.target.value)} disabled={isSubmitting}>
                  <option value="">Select Plant</option>
                  {masterData.plants.map(p => <option key={p.id || p.cpIId} value={p.id || p.cpIId}>{p.plantName || p.cpVPlantName}</option>)}
                </select>
              </div>
              {errors.plant && <p className="text-red-500 text-[11px] font-bold mt-1 ml-1">Required</p>}
            </div>

            {/* Audit Type */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Audit Type <span className="text-red-500">*</span></label>
              <div className="relative">
                <ClipboardCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select className={inputClass('auditType')} value={formData.auditType} onChange={(e) => handleChange('auditType', e.target.value)} disabled={isSubmitting}>
                  <option value="5S Audit">5S Audit</option>
                  <option value="IATF Audit">IATF Audit</option>
                </select>
              </div>
            </div>

            {/* Department */}
            {formData.auditType === '5S Audit' && (
              <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Department <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select className={inputClass('department')} value={formData.department} disabled={!formData.plant || isSubmitting} onChange={(e) => handleChange('department', e.target.value)}>
                    <option value="">{formData.plant ? "Select Department" : "Select a plant first"}</option>
                    {filteredDepartments.map(d => <option key={d.id} value={d.id}>{d.deptName}</option>)}
                  </select>
                </div>
                {errors.department && <p className="text-red-500 text-[11px] font-bold mt-1 ml-1">Required</p>}
              </div>
            )}

            {/* Date */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Schedule Date <span className="text-red-500">*</span></label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="date" className={inputClass('date')} value={formData.date} onChange={(e) => handleChange('date', e.target.value)} disabled={isSubmitting} />
              </div>
              {errors.date && <p className="text-red-500 text-[11px] font-bold mt-1 ml-1">Required</p>}
            </div>

            {/* Time */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Schedule Time <span className="text-red-500">*</span></label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="time" className={inputClass('time')} value={formData.time} onChange={(e) => handleChange('time', e.target.value)} disabled={isSubmitting} />
              </div>
              {errors.time && <p className="text-red-500 text-[11px] font-bold mt-1 ml-1">Required</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => { setSelectedAuditId(null); setView('audit-management'); }}
              className="px-8 py-3 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-10 py-3 ${accent} text-white rounded-xl font-bold shadow-lg flex items-center gap-2 active:scale-95 disabled:opacity-70`}
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <PlayCircle size={20} />}
              {isSubmitting ? "Saving..." : selectedAuditId ? "Update Audit" : "Confirm & Initiate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}