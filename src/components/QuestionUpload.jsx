import React, { useEffect, useState } from "react";
import { 
  Search, Plus, Edit2, Trash2, Loader2, HelpCircle, 
  Filter, X, RefreshCw, ClipboardCheck, Tag
} from "lucide-react";
import { questionService } from '../services/questionService';
import Swal from "sweetalert2";

export default function QuestionGridModern({ setView, setEditData, accentClass, accentColor }) {
  // 1. Core State
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // 2. Filter Specific State
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    auditType: '',
    category: ''
  });

  const colorName = accentColor || 'blue';

  // Derived data for dropdowns
  const categories = [...new Set(questions.map(q => q.category).filter(Boolean))].sort();
  const auditTypes = [...new Set(questions.map(q => q.auditType).filter(Boolean))].sort();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await questionService.getAll();
      setQuestions(data || []);
    } catch (err) {
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

  // 3. Combined Filter Logic
  const filteredQuestions = questions.filter(q => {
    const s = searchTerm.toLowerCase();
    
    // Search matches: Question text, Category, or Audit Type
    const matchesSearch = 
      (q.question || "").toLowerCase().includes(s) ||
      (q.category || "").toLowerCase().includes(s) ||
      (q.auditType || "").toLowerCase().includes(s);

    // Dropdown matches
    const matchesType = !filters.auditType || q.auditType === filters.auditType;
    const matchesCategory = !filters.category || q.category === filters.category;

    return matchesSearch && matchesType && matchesCategory;
  });

  const clearFilters = () => {
    setFilters({ auditType: '', category: '' });
    setSearchTerm('');
  };

  return (
    <div className="h-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Audit <span className={`text-${colorName}-600`}>Checklist</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Configure and manage evaluation criteria for standard audits
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadQuestions}
            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => { setEditData(null); setView('question-create'); }}
            className={`flex items-center justify-center gap-2 px-6 py-3 ${accentClass} text-white rounded-2xl font-bold shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98]`}
          >
            <Plus size={20} />
            Add Question
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
              placeholder="Search questions, categories, or types..."
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
            {(filters.auditType || filters.category) && (
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            )}
          </button>
        </div>

        {/* Expanded Filters Drawer */}
        {showFilters && (
          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-300">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Audit Standard</label>
              <select
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0f172a] border-none text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.auditType}
                onChange={(e) => setFilters({ ...filters, auditType: e.target.value })}
              >
                <option value="">All Types</option>
                {auditTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Category</label>
              <select
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0f172a] border-none text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <X size={16} /> Reset All Criteria
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className={`animate-spin text-${colorName}-500`} size={40} />
          <p className="text-slate-500 font-medium">Fetching checklist...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuestions.length === 0 ? (
            <div className="col-span-full text-center py-24 bg-white dark:bg-[#1e293b] rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <HelpCircle size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">No results found.</p>
              <button onClick={clearFilters} className="text-blue-500 text-sm font-bold mt-2 hover:underline">Clear all filters</button>
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <div 
                key={q.id} 
                className="group bg-white dark:bg-[#1e293b] p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 border border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-2">
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        q.auditType?.includes('5S') 
                        ? 'bg-orange-50 text-orange-600 border border-orange-100' 
                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        <ClipboardCheck size={10} />
                        {q.auditType}
                      </span>
                      <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-tight ml-1">
                        <Tag size={10} />
                        {q.category || 'General'}
                      </span>
                    </div>
                    <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 tracking-tighter italic">
                      ID: {q.id}
                    </span>
                  </div>
                  
                  <h3 className="text-slate-800 dark:text-slate-100 font-bold leading-relaxed mb-8 text-lg">
                    {q.question}
                  </h3>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                  <button 
                    onClick={() => handleEdit(q)}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                    title="Edit Question"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(q.id)}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    title="Delete Question"
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
  );
}