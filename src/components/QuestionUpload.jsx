import React, { useEffect, useState } from "react";
import { Search, Plus, Edit2, Trash2, Loader2, HelpCircle, AlertCircle } from "lucide-react";
import { questionService } from '../services/questionService';
import Swal from "sweetalert2";

export default function QuestionGridModern({ setView, setEditData, accentClass, accentColor }) {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const colorName = accentColor || 'blue';

    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = async () => {
        setLoading(true);
        try {
            const data = await questionService.getAll();
            setQuestions(data);
        } catch (err) {
            // Error logging restored
            console.error("Fetch error:", err);
            Swal.fire("Error", "Could not load questions from the database.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (question) => {
        setEditData(question); 
        setView('question-create');
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This will permanently remove this question from the checklist.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await questionService.delete(id);
                setQuestions(prev => prev.filter(q => q.id !== id));
                Swal.fire("Deleted!", "Question has been removed.", "success");
            } catch (err) {
                console.error("Delete error:", err);
                Swal.fire("Error", "Failed to delete question", "error");
            }
        }
    };

    // Restored full Search UX including auditType
    const filteredQuestions = questions.filter(q =>
        (q.question || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.auditType || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full bg-slate-50/50 dark:bg-[#0f172a] p-4 md:p-8">
            <div className="w-full mx-auto">
                {/* Header with Subtitle restored */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Audit <span className={`text-${colorName}-600`}>Checklist</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and configure your audit criteria</p>
                    </div>

                    <button
                        onClick={() => {
                            setEditData(null);
                            setView('question-create');
                        }}
                        className={`flex items-center justify-center gap-2 px-6 py-3 ${accentClass} text-white rounded-2xl font-bold shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98]`}
                    >
                        <Plus size={20} />
                        Add New Question
                    </button>
                </div>

                {/* Search Bar - Full UI */}
                <div className="bg-white dark:bg-[#1e293b] p-4 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search questions, categories, or audit types..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-[#0f172a] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content Area with Restored Loading UX */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className={`animate-spin text-${colorName}-500 mb-4`} size={40} />
                        <p className="text-slate-500 font-medium">Connecting to API...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuestions.length === 0 ? (
                            /* Restored Empty State UI */
                            <div className="col-span-full text-center py-20 bg-white dark:bg-[#1e293b] rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <HelpCircle size={48} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500">No questions found matching your search.</p>
                            </div>
                        ) : (
                            filteredQuestions.map((q) => (
                                <div key={q.id} className="group bg-white dark:bg-[#1e293b] p-6 rounded-3xl shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-800 transition-all flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${q.auditType?.includes('5S') ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {q.auditType}
                                            </span>
                                            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                {q.category || 'General'}
                                            </span>
                                        </div>
                                        <h3 className="text-slate-800 dark:text-slate-100 font-medium leading-relaxed mb-6">
                                            {q.question}
                                        </h3>
                                    </div>

                                    <div className="flex justify-end gap-2 border-t border-slate-50 dark:border-slate-800 pt-4">
                                        <button 
                                            onClick={() => handleEdit(q)}
                                            className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(q.id)}
                                            className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}