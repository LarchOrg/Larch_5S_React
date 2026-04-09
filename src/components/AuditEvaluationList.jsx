import React, { useState, useEffect } from "react";
import { Search, ArrowRight, LayoutGrid, Eye, Award } from 'lucide-react';
import { adminService } from "../services/adminService";

const AuditEvaluationList = ({
  accentClass,
  onSelectAudit,
  onViewResults,
  userRole = "Auditor",
  accentColor,
  currentUserId // Receive the ID from App.jsx
}) => {
  const [audits, setAudits] = useState([]);
  const [activeTab, setActiveTab] = useState("5S");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const colorName = accentColor || 'blue';

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        setLoading(true);
        const data = await adminService.getAuditList();

        // --- ROLE BASED FILTERING ---
        // If user is an Auditor, only show their assigned audits

        if (userRole?.toLowerCase() === "auditor") {
          // Ensure 'auditorId' matches the property name returned by your API
          const myAudits = data.filter(audit =>
            String(audit.auditorId) === String(currentUserId)
          );
          setAudits(myAudits);
        } else {
          // Admin, Super Admin, etc., see all audits
          setAudits(data);
        }
        /*setAudits(data);*/
      } catch (err) {
        console.error("Error fetching audits:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAudits();
  }, [currentUserId, userRole]); // Re-run if user context changes

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Completed': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20';
      case 'Over Time': return 'text-red-500 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20';
      case 'Upcoming': return 'text-orange-500 bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20';
      default: return 'text-blue-500 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20';
    }
  };

  const filteredAudits = audits.filter((a) => {
    const matchesTab = a.auditType?.toUpperCase().includes(activeTab.toUpperCase());
    const search = searchQuery.toLowerCase();
    const matchesSearch =
      (a.title?.toLowerCase().includes(search) ||
        a.department?.toLowerCase().includes(search) ||
        a.auditor?.toLowerCase().includes(search));

    return matchesTab && matchesSearch;
  });

  const isAuditor = userRole?.toLowerCase() === "auditor";

  return (
    <div className="h-full w-full bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* Header Section */}
      <div className="shrink-0 p-6 lg:p-10 pb-4 lg:pb-6">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 mb-2">
              <LayoutGrid size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                {isAuditor ? "My Assignments" : "System Overview"}
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Audit<span className={`text-${colorName}-600`}> Dashboard</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search audits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white"
              />
            </div>

            <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm">
              {["5S", "IATF"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === tab
                    ? `${accentClass} text-white shadow-md`
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-10 pb-20 custom-scrollbar">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse rounded-[2rem]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredAudits.length > 0 ? filteredAudits.map((audit) => {
              const statusStyle = getStatusStyles(audit.status);
              const isCompleted = audit.status === 'Completed';

              return (
                <div
                  key={audit.id}
                  className={`group bg-white dark:bg-slate-900 border rounded-[2rem] p-6 transition-all flex flex-col justify-between hover:shadow-xl ${isCompleted ? 'border-emerald-100 dark:border-emerald-900/20' : 'border-slate-100 dark:border-slate-800'
                    }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 tracking-widest uppercase italic">ID: {audit.id}</span>
                      <div className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${statusStyle}`}>
                        {audit.status}
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight mb-1">
                      {audit.department}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                      Auditor: {audit.auditor}
                    </p>

                    {isCompleted && (
                      <div className="flex items-center gap-4 mb-6 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed dark:border-slate-700">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Total Score</span>
                          <span className="text-sm font-black text-slate-700 dark:text-white">{audit.totalScore}/{audit.maxScore}</span>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700" />
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Percentage</span>
                          <span className="text-sm font-black text-emerald-500">{audit.percentage}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="relative h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`absolute top-0 left-0 h-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : accentClass}`}
                        style={{ width: `${isCompleted ? 100 : audit.progress}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase">
                          {isCompleted ? 'Finished Date' : 'Deadline'}
                        </span>
                        <span className={`text-xs font-bold ${isCompleted ? 'text-emerald-500' : 'text-slate-600 dark:text-slate-400'}`}>
                          {audit.dueDate}
                        </span>
                      </div>

                      {isAuditor && !isCompleted ? (
                        <button
                          onClick={async () => {
                            try {
                              await adminService.startAudit(audit.id);
                            } catch (e) {
                              console.error("Status update failed", e);
                            }
                            onSelectAudit(audit)
                          }}
                          className={`w-28 h-10 rounded-xl text-white flex items-center justify-center gap-2 hover:translate-x-1 transition-all shadow-lg text-[10px] font-black uppercase tracking-tighter ${accentClass}`}
                        >
                          {audit.status === 'In Progress' ? 'Resume' : 'Start'} <ArrowRight size={14} strokeWidth={3} />
                        </button>
                      ) : (
                        <button
                          onClick={() => onViewResults(audit)}
                          disabled={audit.status !== 'Completed'}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${isCompleted
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                            : audit.status !== 'Completed'
                              ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed opacity-60'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                        >
                          {isCompleted ? <Award size={14} /> : <Eye size={14} />}
                          <span className="text-[9px] font-black uppercase tracking-widest">
                            {isCompleted ? 'View Report' : 'View Only'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                No {activeTab} audits found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditEvaluationList;