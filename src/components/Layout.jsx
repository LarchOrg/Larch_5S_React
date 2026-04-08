import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Menu,
  Sun,
  Moon,
  LogOut,
  ClipboardCheck,
  Settings,
  PlayCircle,
  ShieldCheck,
  Upload
} from 'lucide-react';

const NavItem = ({ icon, label, active, collapsed, onClick, accent }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all mb-2
      ${active
        ? `${accent} text-white shadow-lg`
        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
      }`}
  >
    {icon}
    {!collapsed && <span className="font-medium text-sm">{label}</span>}
  </button>
);

export default function Layout({
  children,
  onLogout,
  isDark,
  setIsDark,
  isCollapsed,
  setIsCollapsed,
  currentView,
  setView,
  accent,
  setAccent,
  accentClass,
  userRole
}) {
  const [openSettings, setOpenSettings] = useState(false);

  const accentMap = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700'
  };

  // Logic to keep "Dashboard" highlighted when Super Admin is in sub-management views
  const isDashboardActive =
    currentView === 'dashboard' ||
    currentView === 'admin-management' ||
    currentView === 'admin-create';

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0b1120] text-slate-900 dark:text-white transition-colors duration-500">

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-full z-40 ${isCollapsed ? 'w-20' : 'w-64'
          } bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 shadow-xl`}
      >
        <div className="p-4 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 h-16">
          <div className={`${accentClass} p-2 rounded-lg transition-colors duration-500 shadow-md`}>
            <ClipboardCheck className="text-white" size={20} />
          </div>
          {!isCollapsed && (
            <div className="leading-none">
              <h1 className="font-bold text-lg tracking-tight">5S Audit</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Platform</p>
            </div>
          )}
        </div>

        <nav className="p-4">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={isDashboardActive}
            onClick={() => setView('dashboard')}
            collapsed={isCollapsed}
            accent={accentClass}
          />

          {/* AUDITOR & ADMIN SECTION */}
          {(userRole === 'admin' || userRole === 'auditor') && (
            <div className="mt-6">
              {!isCollapsed && (
                <p className="text-[10px] font-bold text-slate-400 uppercase px-3 mb-2 tracking-widest">
                  Execution
                </p>
              )}
              <NavItem
                icon={<ShieldCheck size={20} />}
                label="Audit Evaluation"
                active={currentView === 'audit-evaluation-list' || currentView === 'audit-evaluation-perform'}
                onClick={() => setView('audit-evaluation-list')}
                collapsed={isCollapsed}
                accent={accentClass}
              />
            </div>
          )}

          {/* ADMIN OPERATIONS SECTION - Only for Organization Admins */}
          {userRole === 'admin' && (
            <div className="mt-6">
              {!isCollapsed && (
                <p className="text-[10px] font-bold text-slate-400 uppercase px-3 mb-2 tracking-widest">
                  Operations
                </p>
              )}
              <NavItem
                icon={<Users size={20} />}
                label="User Management"
                active={currentView === 'management' || currentView === 'user-create'}
                onClick={() => setView('management')}
                collapsed={isCollapsed}
                accent={accentClass}
              />
              <NavItem
                icon={<Upload size={20} />}
                label="Checklist Upload"
                active={currentView === 'question-upload'}
                onClick={() => setView('question-upload')}
                collapsed={isCollapsed}
                accent={accentClass}
              />
              <NavItem
                icon={<PlayCircle size={20} />}
                label="Audit Management"
                active={currentView === 'audit-management'}
                onClick={() => setView('audit-management')}
                collapsed={isCollapsed}
                accent={accentClass}
              />

            </div>
          )}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className={`flex-1 ${isCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300 flex flex-col`}>

        {/* HEADER */}
        <header className="h-16 sticky top-0 z-30 flex items-center justify-between px-6 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCollapsed(prev => !prev)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => setIsDark(prev => !prev)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={() => setOpenSettings(prev => !prev)}
              className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${openSettings ? 'text-blue-600' : 'text-slate-500'}`}
            >
              <Settings size={20} />
            </button>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

            <div className="flex items-center gap-3 pl-2">
              <div className="hidden md:block text-right">
                <p className="text-sm font-extrabold leading-none capitalize tracking-tight">
                  {userRole.replace('_', ' ')}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">
                  {userRole === 'super_admin' ? 'System Proprietor' : 'Org Administrator'}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold shadow-lg transition-colors duration-500 ${accentClass}`}
              >
                {userRole === 'super_admin' ? 'SA' : userRole.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* SETTINGS DROPDOWN */}
            {openSettings && (
              <div className="absolute right-0 top-14 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">Personalization</p>

                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] text-slate-500 mb-2 px-1">Brand Accent</p>
                    <div className="flex gap-3 px-1">
                      {Object.keys(accentMap).map((c) => (
                        <button
                          key={c}
                          onClick={() => setAccent(c)}
                          className={`w-8 h-8 rounded-full border-2 transition-all active:scale-90 ${accent === c ? 'border-slate-400 scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                            } ${accentMap[c].split(' ')[0]}`}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setOpenSettings(false)}
                    className={`w-full py-2.5 text-white text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95 ${accentClass}`}
                  >
                    Save Preferences
                  </button>

                  <div className="h-[1px] bg-slate-100 dark:bg-slate-700 mx-1" />

                  <button
                    onClick={onLogout}
                    className="w-full text-red-500 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors"
                  >
                    <LogOut size={18} /> Logout Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="p-6 flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#0b1120] transition-colors duration-500">
          <div /*className="max-w-7xl mx-auto"*/ className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}