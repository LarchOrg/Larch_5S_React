import React, { useState, useEffect } from 'react';
import { ChevronLeft, ClipboardCheck, MessageSquare, ImageIcon, Award, Eye, X } from 'lucide-react'; // Added X for close
import { adminService } from '../services/adminService';
import { API_BASE_URL } from '../services/authService';


const AuditReportView = ({ audit, accentClass, onBack }) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    // State to handle the modal popup
    const [selectedImg, setSelectedImg] = useState(null);
    const FILE_BASE_URL= `${API_BASE_URL.replace('/api', '')}`;
    
    useEffect(() => {
        const fetchResults = async () => {
            try {
                setLoading(true);
                const data = await adminService.getAuditResults(audit.id);
                setResults(data);
            } catch (err) {
                console.error("Error fetching results:", err);
            } finally {
                setLoading(false);
            }
        };
        if (audit?.id) fetchResults();
    }, [audit]);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 relative">
            {/* --- IMAGE POPUP MODAL --- */}
            {selectedImg && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedImg(null)}
                >
                    <div className="relative max-w-4xl w-full flex flex-col items-center">
                        <button 
                            className="absolute -top-12 right-0 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                            onClick={() => setSelectedImg(null)}
                        >
                            <X size={32} />
                        </button>
                        <img 
                            src={`${FILE_BASE_URL}${selectedImg}`} 
                            alt="Evidence Large" 
                            className="max-h-[85vh] w-auto rounded-2xl shadow-2xl border-4 border-white/10"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                        />
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 p-4 flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                    <ChevronLeft className="text-slate-500" />
                </button>
                <div>
                    <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                        Audit Report: {audit.title}
                    </h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {audit.department} • {audit.scheduledDate}
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Score Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border dark:border-slate-700 shadow-sm flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${accentClass} text-white`}>
                            <Award size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Score</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white">{audit.totalScore} / {audit.maxScore}</p>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border dark:border-slate-700 shadow-sm flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-emerald-500 text-white">
                            <ClipboardCheck size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance</p>
                            <p className="text-2xl font-black text-emerald-500">{audit.percentage}%</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border dark:border-slate-700 shadow-sm flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-blue-500 text-white">
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white">{results.length}</p>
                        </div>
                    </div>
                </div>

                {/* Question Details */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Detailed Findings</h3>
                    {results.map((item, index) => (
                        <div key={index} className="bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start gap-4 mb-4">
                                    <div className="space-y-1">
                                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md text-white ${accentClass}`}>
                                            {item.category}
                                        </span>
                                        <h4 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                                            {item.questionText}
                                        </h4>
                                    </div>
                                    <div className="text-center bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border dark:border-slate-700 min-w-[80px]">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Score</p>
                                        <p className="text-xl font-black text-blue-600">{item.score}</p>
                                    </div>
                                </div>

                                {item.comments && (
                                    <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed dark:border-slate-700">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Auditor Comments</p>
                                        <p className="text-slate-600 dark:text-slate-300 text-sm italic">"{item.comments}"</p>
                                    </div>
                                )}

                                {item.imageUrls && item.imageUrls.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                            <ImageIcon size={12} /> Evidence Photos
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            {item.imageUrls.map((url, i) => (
                                                <button 
                                                    key={i} 
                                                    onClick={() => setSelectedImg(url)} // Open Popup
                                                    className="group relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-md hover:scale-105 transition-transform"
                                                >
                                                    <img 
                                                        src={`${FILE_BASE_URL}${url}`} 
                                                        alt="evidence" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <Eye className="text-white" size={20} />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AuditReportView;