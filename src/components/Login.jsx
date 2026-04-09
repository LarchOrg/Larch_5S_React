import React, { useState } from 'react';
import { ClipboardCheck, User, Lock, Loader2, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

export default function Login({ onLogin, accentClass, accentColor }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const colorName = accentColor || 'blue';

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Call the backend API
      const data = await authService.login(credentials.email, credentials.password);
      
      // 2. On success, pass the role returned by the database to the App component
      onLogin(data); 
    } catch (err) {
      // 3. Handle errors (Invalid password, user not found, etc.)
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = `w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-${colorName}-500 transition-all font-medium`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0b1120] px-4 relative overflow-hidden">
      
      {/* Background Decoration */}
      <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] ${accentClass} opacity-[0.03] rounded-full blur-[120px]`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] ${accentClass} opacity-[0.03] rounded-full blur-[120px]`} />

      <div className="relative z-10 bg-white dark:bg-[#1e293b] p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-800 text-center">
        
        {/* Logo Icon */}
        <div className={`${accentClass} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
          <ClipboardCheck className="text-white w-8 h-8" />
        </div>

        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Smart Kappa</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium text-sm">5S Audit Management System</p>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm animate-shake">
            <AlertCircle size={18} />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-5 text-left">
          
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="email"
                placeholder="Enter your email"
                className={inputStyle}
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="password"
                placeholder="Enter your password"
                className={inputStyle}
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className={`w-full ${accentClass} text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] mt-4 flex items-center justify-center gap-2 disabled:opacity-70`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Verifying...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="mt-8 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-bold">
          Efficiency through Standardisation
        </p>
      </div>
    </div>
  );
}