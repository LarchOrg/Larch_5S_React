import React, { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import { adminService } from "../services/adminService";

const AuditEvaluation = ({ audit, accentClass, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  const scoringSystem = [
    { value: 1, label: "Very Poor", color: "bg-red-500" },
    { value: 2, label: "Needs Imp.", color: "bg-orange-500" },
    { value: 3, label: "Satisfactory", color: "bg-emerald-500" },
    { value: 4, label: "Good", color: "bg-green-600" },
    { value: 5, label: "Excellent", color: "bg-green-700" },
  ];

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const data = await adminService.getChecklist(audit.auditType);
        setQuestions(data);
      } catch (err) {
        Swal.fire("Error", "Could not load checklist", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [audit.auditType]);

  const updateResponse = (field, value) => {
    const qId = questions[currentIdx].id;
    setResponses(prev => ({
      ...prev,
      [qId]: { ...prev[qId], [field]: value }
    }));
  };

  // MULTI-PHOTO LOGIC FROM CODE 2
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const qId = questions[currentIdx].id;
    const existingFiles = responses[qId]?.evidence || [];
    updateResponse("evidence", [...existingFiles, ...files]);
    e.target.value = null; 
  };

  const removeFile = (fileIndex) => {
    const qId = questions[currentIdx].id;
    const existingFiles = responses[qId]?.evidence || [];
    updateResponse("evidence", existingFiles.filter((_, i) => i !== fileIndex));
  };

  const uploadInChunks = async (file) => {
    const CHUNK_SIZE = 1024 * 512;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const fileUid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    let finalPath = "";

    for (let i = 0; i < totalChunks; i++) {
      const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      const formData = new FormData();
      formData.append("Chunk", chunk);
      formData.append("FileName", file.name);
      formData.append("ChunkNumber", i);
      formData.append("TotalChunks", totalChunks);
      formData.append("FileUid", fileUid);
      const result = await adminService.uploadChunk(formData);
      if (result.filePath) finalPath = result.filePath;
    }
    return finalPath;
  };

  const handleFinish = async () => {
    const { isConfirmed } = await Swal.fire({
      title: 'Submit Audit?',
      text: "Final scores and all evidence will be recorded.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Submit Final Report'
    });

    if (!isConfirmed) return;

    try {
      setIsSubmitting(true);
      const finalResponses = [];

      for (const q of questions) {
        const resp = responses[q.id] || { score: 0, description: "", comments: "", evidence: [] };
        const evidenceUrls = [];

        if (resp.evidence && resp.evidence.length > 0) {
          for (const file of resp.evidence) {
            const url = await uploadInChunks(file);
            evidenceUrls.push(url);
          }
        }

        finalResponses.push({
          ChecklistId: q.id,
          Score: resp.score || 0,
          Description: resp.description || "",
          Comments: resp.comments || "",
          ImageUrls: evidenceUrls 
        });
      }

      const totalScore = finalResponses.reduce((sum, r) => sum + r.Score, 0);
      const maxPossible = questions.length * 5;

      const payload = {
        AuditId: audit.id || audit.faiIId,
        TotalScore: totalScore,
        MaxPossibleScore: maxPossible,
        Percentage: ((totalScore / maxPossible) * 100).toFixed(2),
        Responses: finalResponses
      };

      await adminService.submitEvaluation(payload);
      await Swal.fire('Success', 'Audit Completed Successfully', 'success');
      onBack();
    } catch (err) {
      Swal.fire('Error', 'Submission failed: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center dark:text-white">Loading...</div>;
  if (questions.length === 0) return <div className="h-full flex items-center justify-center dark:text-white">No questions found.</div>;

  const currentQ = questions[currentIdx];
  const currentResp = responses[currentQ.id] || { score: null, description: "", comments: "", evidence: [] };
  const progressPercent = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="h-full w-full bg-slate-50 dark:bg-slate-950 flex flex-col p-4 overflow-hidden">
      <div className="flex-1 flex flex-col w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        <div className="shrink-0 h-1.5 w-full bg-slate-100 dark:bg-slate-800">
          <div className={`h-full transition-all duration-500 ${accentClass}`} style={{ width: `${progressPercent}%` }} />
        </div>

        {/* HEADER */}
        <div className="shrink-0 p-5 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-black uppercase tracking-[0.2em] text-blue-500">{audit.auditType} Protocol</span>
              <span className="text-slate-300">•</span>
              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                {currentQ.category || 'General'}
              </span>
            </div>
            <h2 className="text-lg font-bold dark:text-white leading-tight mt-1">{audit.title || 'Ongoing Audit'}</h2>
          </div>
          <button onClick={onBack} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full">
            <svg className="w-5 h-5 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto">
            
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                   <span className={`h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold ${accentClass}`}>
                    {currentIdx + 1}
                  </span>
                  <span className="text-base font-bold text-slate-400">Requirement {currentIdx + 1} of {questions.length}</span>
                </div>
                <h3 className="text-xl font-bold dark:text-white">{currentQ.question}</h3>
                {currentQ.clauseNo && <p className="text-xs text-slate-500 mt-1">Ref: {currentQ.clauseNo}</p>}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {scoringSystem.map((s) => (
                  <button
                    key={s.value}
                    disabled={isSubmitting}
                    onClick={() => updateResponse("score", s.value)}
                    className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all ${
                      currentResp.score === s.value ? `${s.color} text-white scale-105` : "border-slate-100 dark:border-slate-800 text-slate-400"
                    }`}
                  >
                    <span className="text-xl font-black">{s.value}</span>
                    <span className="text-[10px] uppercase font-bold">{s.label}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea
                  disabled={isSubmitting}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 dark:text-white text-sm"
                  rows="4"
                  placeholder="Observation Details"
                  value={currentResp.description || ""}
                  onChange={(e) => updateResponse("description", e.target.value)}
                />
                <textarea
                  disabled={isSubmitting}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 dark:text-white text-sm"
                  rows="4"
                  placeholder="Corrective Actions"
                  value={currentResp.comments || ""}
                  onChange={(e) => updateResponse("comments", e.target.value)}
                />
              </div>
            </div>

            {/* MULTI-PHOTO UI*/}
            <div className="lg:col-span-5">
              <label className="text-[12px] font-black uppercase text-slate-500 mb-3 block">Evidence Photos</label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {currentResp.evidence?.map((file, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="preview" />
                    <button 
                        onClick={() => removeFile(idx)}
                        className="absolute top-2 right-2 bg-red-500/80 backdrop-blur-md text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" /></svg>
                    </button>
                  </div>
                ))}
                
                {!isSubmitting && (
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    className="aspect-square border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors group"
                  >
                    <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round"/></svg>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Add Evidence</span>
                  </button>
                )}
              </div>
              <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={handleFileChange} />
            </div>
          </div>
        </div>

        <div className="shrink-0 p-4 px-8 border-t dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <button 
            disabled={currentIdx === 0 || isSubmitting}
            onClick={() => setCurrentIdx(prev => prev - 1)}
            className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 disabled:opacity-0"
          >
            Previous
          </button>
          
          <button
            onClick={currentIdx === questions.length - 1 ? handleFinish : () => setCurrentIdx(prev => prev + 1)}
            disabled={currentResp.score === null || isSubmitting}
            className={`px-10 py-3 rounded-xl text-white text-sm font-black shadow-lg flex items-center gap-2 ${accentClass} disabled:opacity-30 active:scale-95 transition-all`}
          >
            {isSubmitting && (
               <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            )}
            {isSubmitting ? "Uploading..." : (currentIdx === questions.length - 1 ? "Finish Audit" : "Next Question")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditEvaluation;