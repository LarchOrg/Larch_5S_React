import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Loader2, Folder, Keyboard, Layout, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { questionService } from '../services/questionService';

export default function QuestionCreate({ setView, editData, setEditData, accentClass, accentColor }) {
    const isEditMode = !!editData;
    const [formData, setFormData] = useState({
        auditType: '',
        category: '',
        question: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const colorName = accentColor || 'blue';

    // --- POPULATE FORM FOR EDIT MODE ---
    useEffect(() => {
        if (editData) {
            setFormData({
                auditType: editData.auditType || '',
                category: editData.category || '',
                question: editData.question || ''
            });
        }
    }, [editData]);

    // --- ENHANCED VALIDATION ---
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.auditType) {
            newErrors.auditType = 'Audit Type is required';
        }

        if (!formData.category || formData.category.trim() === '') {
            newErrors.category = 'Category selection is required';
        }

        const trimmedQuestion = formData.question.trim();
        if (!trimmedQuestion) {
            newErrors.question = 'Question text cannot be empty';
        } else if (trimmedQuestion.length < 10) {
            newErrors.question = 'Question is too short (min 10 characters)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            
            // Logic: If switching Audit Type, reset or auto-set category
            if (name === 'auditType') {
                updated.category = (value && value !== '5S Audit') ? 'General' : '';
            }
            return updated;
        });
        
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return; 

        setIsSubmitting(true);
        try {
            if (isEditMode) {
                // Update existing record
                await questionService.update(editData.id, { 
                    ...editData, // Keep internal IDs/Dates
                    ...formData 
                });
            } else {
                // Create new record
                await questionService.create(formData);
            }

            await Swal.fire({
                icon: 'success',
                title: isEditMode ? 'Updated Successfully' : 'Saved Successfully',
                timer: 1500,
                showConfirmButton: false
            });
            
            handleBack(); // Reset and exit
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error Saving',
                text: err.message || "Could not connect to the server.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (setEditData) setEditData(null); // Clear the edit state in parent
        setView('question-upload');
    };

    // Reusable Error Component
    const ErrorLabel = ({ message }) => (
        message ? (
            <div className="flex items-center gap-1 mt-1 text-red-500 animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={12} />
                <span className="text-[11px] font-bold uppercase tracking-wider">{message}</span>
            </div>
        ) : null
    );

    return (
        <div className="h-full flex flex-col bg-slate-50/50 dark:bg-[#0f172a] p-4 md:p-8">
            <div className="w-full mx-auto">
                <button 
                    onClick={handleBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white mb-8 transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Audit Checklist</span>
                </button>

                <div className="bg-white dark:bg-[#1e293b] rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className={`p-8 ${accentClass} text-white`}>
                        <h1 className="text-2xl font-bold">
                            {isEditMode ? 'Edit Audit Question' : 'Add New Audit Question'}
                        </h1>
                        <p className="opacity-80 text-sm mt-1">
                            {isEditMode ? 'Modify existing criteria parameters.' : 'Configure your audit criteria accurately.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6" noValidate>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Audit Type */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Folder size={16} className={`text-${colorName}-500`} />
                                    Audit Type
                                    <span className="text-red-500 ml-0.5">*</span>
                                </label>
                                <select
                                    name="auditType"
                                    value={formData.auditType}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-[#0f172a] border rounded-xl outline-none transition-all dark:text-white ${
                                        errors.auditType ? 'border-red-500 ring-2 ring-red-50 dark:ring-red-900/20' : `border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-${colorName}-500`
                                    }`}
                                >
                                    <option value="">-- Select Type --</option>
                                    <option value="5S Audit">5S Audit</option>
                                    <option value="IATF Audit">IATF Audit</option>
                                </select>
                                <ErrorLabel message={errors.auditType} />
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Layout size={16} className={`text-${colorName}-500`} />
                                    Category
                                    <span className="text-red-500 ml-0.5">*</span>
                                </label>
                                <select
                                    name="category"
                                    disabled={formData.auditType !== '5S Audit' && formData.auditType !== ''}
                                    value={formData.category}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-[#0f172a] border rounded-xl outline-none transition-all dark:text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                                        errors.category ? 'border-red-500 ring-2 ring-red-50 dark:ring-red-900/20' : `border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-${colorName}-500`
                                    }`}
                                >
                                    <option value="">-- Select Category --</option>
                                    {formData.auditType === '5S Audit' ? (
                                        <>
                                            <option value="Sort">Sort (Seiri)</option>
                                            <option value="Set in Order">Set in Order (Seiton)</option>
                                            <option value="Shine">Shine (Seiso)</option>
                                            <option value="Standardize">Standardize (Seiketsu)</option>
                                            <option value="Sustain">Sustain (Shitsuke)</option>
                                        </>
                                    ) : (
                                        <option value="General">General</option>
                                    )}
                                </select>
                                <ErrorLabel message={errors.category} />
                            </div>
                        </div>

                        {/* Question Text */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Keyboard size={16} className={`text-${colorName}-500`} />
                                Question Text
                                <span className="text-red-500 ml-0.5">*</span>
                            </label>
                            <textarea
                                name="question"
                                rows="4"
                                value={formData.question}
                                onChange={handleChange}
                                placeholder="Example: Is the floor free from oil spills and debris?"
                                className={`w-full px-4 py-3 bg-slate-50 dark:bg-[#0f172a] border rounded-xl outline-none transition-all dark:text-white resize-none ${
                                    errors.question ? 'border-red-500 ring-2 ring-red-50 dark:ring-red-900/20' : `border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-${colorName}-500`
                                }`}
                            ></textarea>
                            <ErrorLabel message={errors.question} />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-4 ${accentClass} text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-70`}
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="animate-spin" size={20} /> Processing...</>
                                ) : (
                                    <>
                                        <Save size={20} /> 
                                        {isEditMode ? 'Update Question' : 'Save Question'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}