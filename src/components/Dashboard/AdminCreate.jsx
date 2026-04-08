import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, User, Mail, Lock, 
  Building2, MapPin, Plus, X 
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import Swal from 'sweetalert2';

export default function AdminCreate({ setView, editData, setEditData, accentClass, accentColor }) {
  const isEditMode = !!editData;

  const [formData, setFormData] = useState({
    Firstname: '',
    Lastname: '',
    Email: '',
    Password: '',
    RoleId: 2, 
    CompanyId: '',
    PlantId: '',
    MobileNo: '',
    Experience: 0,
    Dob: '',
    Doj: ''
  });

  const [companies, setCompanies] = useState([]);
  const [plants, setPlants] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({}); 
  
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [newMasterItem, setNewMasterItem] = useState("");

  const colorName = accentColor || 'blue';

  useEffect(() => {
    fetchMasterData();
    if (editData) {
      // Explicitly map incoming API data to the state keys
      console.log("Raw Edit Data:", editData);
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return dateStr.split('T')[0]; 
      };
      setFormData({
        Firstname: editData.firstname || editData.Firstname || '',
        Lastname: editData.lastname || editData.Lastname || '',
        Email: editData.email || editData.Email || '',
        Password: '', // Always empty for security on edit
        RoleId: editData.roleId || editData.RoleId || 2,
        CompanyId: editData.companyId || editData.CompanyId || '',
        PlantId: editData.plantId || editData.PlantId || '',
        MobileNo: editData.mobileNo || editData.MobileNo || '',
        Experience: editData.experience || editData.Experience || 0,
        // Ensure dates are formatted correctly for <input type="date" /> (YYYY-MM-DD)
        Dob: formatDate(editData.dob || editData.Dob),
        Doj: formatDate(editData.doj || editData.Doj)
      });
    }
  }, [editData]);

  const fetchMasterData = async () => {
    try {
      const [companyList, plantList] = await Promise.all([
        adminService.getCompanies(),
        adminService.getPlants()
      ]);
      setCompanies(companyList);
      setPlants(plantList);
    } catch (error) {
      console.error("Failed to load master data", error);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    const alphaRegex = /^[A-Za-z\s]+$/; 
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!formData.Firstname.trim()) {
      newErrors.Firstname = "First name is required";
    } else if (!alphaRegex.test(formData.Firstname)) {
      newErrors.Firstname = "Name can only contain letters";
    }

    if (!formData.Lastname.trim()) {
      newErrors.Lastname = "Last name is required";
    } else if (!alphaRegex.test(formData.Lastname)) {
      newErrors.Lastname = "Name can only contain letters";
    }

    if (!formData.Email) {
      newErrors.Email = "Email is required";
    } else if (!emailRegex.test(formData.Email)) {
      newErrors.Email = "Invalid corporate email";
    }

    if (!isEditMode && !formData.Password) {
      newErrors.Password = "Password is required for new accounts";
    }

    const requiredFields = ['CompanyId', 'PlantId', 'Dob', 'Doj'];
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        newErrors[field] = "This field is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if ((name === 'Firstname' || name === 'Lastname') && /\d/.test(value)) {
        return; 
    }
    const finalValue = (name.includes('Id') || name === 'Experience') ? (parseInt(value) || '') : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleMasterSubmit = async (type) => {
    if (!newMasterItem.trim()) return;
    try {
      if (type === 'Company') {
        const result = await adminService.createCompany(newMasterItem);
        setCompanies(prev => [...prev, result]);
        setFormData(prev => ({ ...prev, CompanyId: result.id }));
      } else {
        const result = await adminService.createPlant(newMasterItem);
        setPlants(prev => [...prev, result]);
        setFormData(prev => ({ ...prev, PlantId: result.id }));
      }
      setNewMasterItem("");
      setShowCompanyModal(false);
      setShowPlantModal(false);
      Swal.fire("Success", `${type} added to Master Table`, "success");
    } catch (error) {
      Swal.fire("Error", `Failed to save ${type}`, "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await Swal.fire({
        title: isEditMode ? 'Updating Administrator' : 'Provisioning Admin Account',
        html: `<div class="flex flex-col items-center gap-4 py-3"><div class="text-sm font-medium text-slate-500">Processing database update...</div></div>`,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: async () => {
          Swal.showLoading();
          try {
            if (isEditMode) {
              await adminService.updateUser(editData.id, formData);
            } else {
              await adminService.createUser(formData);
            }
            Swal.close();
          } catch (error) {
            Swal.fire("Error", error.message, "error");
            throw error;
          }
        }
      });

      await Swal.fire({ icon: 'success', title: isEditMode ? 'Account Updated' : 'Admin Created Successfully', timer: 2000, showConfirmButton: false });
      setEditData(null);
      setView('admin-management'); 
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getInputClass = (fieldName, hasIcon = true) => {
    const base = `w-full ${hasIcon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-white dark:bg-[#0f172a] border rounded-xl outline-none transition-all dark:text-white`;
    const state = errors[fieldName] 
      ? 'border-red-500 focus:ring-2 focus:ring-red-100' 
      : `border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-${colorName}-500`;
    return `${base} ${state}`;
  };

  const ErrorMsg = ({ field }) => errors[field] ? (
    <p className="text-red-500 text-[11px] mt-1 font-semibold ml-1 animate-in fade-in slide-in-from-top-1">
        {errors[field]}
    </p>
  ) : null;

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => { setEditData(null); setView('admin-management'); }}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> Back to Admin Management
        </button>
      </div>

      <div className="flex-1 bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col overflow-hidden relative">
        <div className={`${accentClass} p-8`}>
          <h2 className="text-2xl font-bold text-white">{isEditMode ? 'Edit Administrator' : 'Provision Admin Account'}</h2>
          <p className="text-white/80 mt-1 font-medium">{isEditMode ? 'Modify account details and access levels.' : 'Create a new organizational lead with letters-only name fields.'}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-10 space-y-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">First Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.Firstname ? 'text-red-400' : 'text-slate-400'}`} size={18} />
                <input name="Firstname" value={formData.Firstname} onChange={handleChange} placeholder="John" className={getInputClass('Firstname')} />
              </div>
              <ErrorMsg field="Firstname" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Last Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.Lastname ? 'text-red-400' : 'text-slate-400'}`} size={18} />
                <input name="Lastname" value={formData.Lastname} onChange={handleChange} placeholder="Doe" className={getInputClass('Lastname')} />
              </div>
              <ErrorMsg field="Lastname" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Corporate Email <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.Email ? 'text-red-400' : 'text-slate-400'}`} size={18} />
                <input name="Email" type="email" disabled={isEditMode} value={formData.Email} onChange={handleChange} placeholder="admin@domain.com" className={`${getInputClass('Email')} ${isEditMode ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`} />
              </div>
              <ErrorMsg field="Email" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{isEditMode ? 'Update Password (Optional)' : 'Set Password *'}</label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.Password ? 'text-red-400' : 'text-slate-400'}`} size={18} />
                <input name="Password" type="password" value={formData.Password} onChange={handleChange} placeholder="••••••••" className={getInputClass('Password')} />
              </div>
              <ErrorMsg field="Password" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Assign Company <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Building2 className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.CompanyId ? 'text-red-400' : 'text-slate-400'}`} size={18} />
                  <select name="CompanyId" value={formData.CompanyId} onChange={handleChange} className={`${getInputClass('CompanyId')} appearance-none pr-10`}>
                    <option value="">Select Company</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                  </select>
                </div>
                <button type="button" onClick={() => setShowCompanyModal(true)} className={`p-3 ${accentClass} text-white rounded-xl shadow-md flex-shrink-0 active:scale-90 transition-all`}><Plus size={20} /></button>
              </div>
              <ErrorMsg field="CompanyId" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Assign Plant <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.PlantId ? 'text-red-400' : 'text-slate-400'}`} size={18} />
                  <select name="PlantId" value={formData.PlantId} onChange={handleChange} className={`${getInputClass('PlantId')} appearance-none pr-10`}>
                    <option value="">Select Plant</option>
                    {plants.map(p => <option key={p.id} value={p.id}>{p.plantName}</option>)}
                  </select>
                </div>
                <button type="button" onClick={() => setShowPlantModal(true)} className={`p-3 ${accentClass} text-white rounded-xl shadow-md flex-shrink-0 active:scale-90 transition-all`}><Plus size={20} /></button>
              </div>
              <ErrorMsg field="PlantId" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date of Birth <span className="text-red-500">*</span></label>
              <input type="date" name="Dob" value={formData.Dob} onChange={handleChange} className={getInputClass('Dob', false)} />
              <ErrorMsg field="Dob" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date of Joining <span className="text-red-500">*</span></label>
              <input type="date" name="Doj" value={formData.Doj} onChange={handleChange} className={getInputClass('Doj', false)} />
              <ErrorMsg field="Doj" />
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
            <button type="button" onClick={() => { setEditData(null); setView('admin-management'); }} className="px-8 py-3 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Cancel</button>
            <button type="submit" disabled={isSaving} className={`px-12 py-3 ${accentClass} text-white rounded-xl font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95`}>
              <Save size={20} /> {isSaving ? 'Processing...' : isEditMode ? 'Update Administrator' : 'Provision Admin Account'}
            </button>
          </div>
        </form>

        {(showCompanyModal || showPlantModal) && (
          <div className="absolute inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white dark:bg-[#1e293b] w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold dark:text-white">Add New {showCompanyModal ? 'Company' : 'Plant'}</h3>
                <button onClick={() => {setShowCompanyModal(false); setShowPlantModal(false); setNewMasterItem("");}} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
              </div>
              <input autoFocus type="text" placeholder={`Enter name`} className={getInputClass('newMaster', false)} value={newMasterItem} onChange={(e) => setNewMasterItem(e.target.value)} />
              <div className="mt-6 flex gap-3">
                <button onClick={() => handleMasterSubmit(showCompanyModal ? 'Company' : 'Plant')} className={`flex-1 py-3 ${accentClass} text-white rounded-xl font-bold active:scale-95 transition-all`}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}