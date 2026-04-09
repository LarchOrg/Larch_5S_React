import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './components/Login';

// Auth Service
import { authService } from './services/authService';

// Dashboards
import SuperAdminDashboard from './components/Dashboard/SuperAdminDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import AuditorDashboard from './components/Dashboard/AuditorDashboard';
import DepartmentHeadDashboard from './components/Dashboard/DepartmentHeadDashboard';

// Components
import DepartmentManagement from './components/DepartmentManagement';
import UserCreate from './components/UserCreate';
import AdminManagement from './components/AdminManagement';
import AdminCreate from './components/Dashboard/AdminCreate';
import InitiateAudit from './components/InitiateAudit';
import AuditManagement from './components/AuditManagement';
import Settings from './components/Settings';
import UserManagement from './components/admin/UserManagement';
import AuditEvaluationList from './components/AuditEvaluationList';
import AuditEvaluation from './components/AuditEvaluation';
import QuestionGridModern from './components/QuestionUpload';
import QuestionCreate from './components/QuestionCreate';
import AuditReportView from './components/AuditReportView';

export default function App() {
  // --- AUTH STATE (Persistent) ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => authService.isAuthenticated());
  const [userRole, setUserRole] = useState(() => authService.getCurrentRole());
  const [userName, setUserName] = useState(() => authService.getUserName() || 'Guest User');
  const [userId, setUserId] = useState(() => authService.getUserId());

  // --- ROUTER LOGIC ---
  const [view, setView] = useState(() => {
    const path = window.location.pathname.replace(/^\//, '');
    return path || 'dashboard';
  });

  useEffect(() => {
    const newPath = '/' + view;
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  }, [view]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '');
      setView(path || 'dashboard');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- UI STATES ---
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [selectedAuditId, setSelectedAuditId] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // --- ACCENT LOGIC ---
  const [accent, setAccent] = useState(() => {
    return localStorage.getItem('accent') || 'blue';
  });

  const accentMap = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700'
  };

  const accentClass = accentMap[accent];

  useEffect(() => {
    localStorage.setItem('accent', accent);
  }, [accent]);

  // --- THEME LOGIC ---
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // --- HANDLERS ---
  const handleLogin = (data) => {
    setUserId(data.id || data.userId);
    setUserRole(data.role);
    setUserName(data.fullName || data.userName || 'User');
    setIsLoggedIn(true);
    setView('dashboard');
  };

  const handleLogout = () => {
    authService.logout(); // Clears localStorage (token, role, etc)
    setIsLoggedIn(false);
    setUserRole(null);
    setView('dashboard');
  };

  const handleStartAudit = (audit) => {
    setSelectedAudit(audit);
    setView('audit-evaluation-perform');
  };

  const handleViewResults = (audit) => {
    setSelectedAudit(audit);
    setView('audit-report-view');
  };

  // --- RENDER HELPERS ---
  const renderDashboardByRole = () => {
    switch (userRole) {
      case 'super_admin':
        return <SuperAdminDashboard isDark={isDark} accentClass={accentClass} setView={setView} />;
      case 'admin':
        return <AdminDashboard isDark={isDark} accentClass={accentClass} />;
      case 'auditor':
        return <AuditorDashboard isDark={isDark} accentClass={accentClass} />;
      case 'dept_head':
        return <DepartmentHeadDashboard isDark={isDark} accentClass={accentClass} />;
      default:
        return <AdminDashboard isDark={isDark} accentClass={accentClass} />;
    }
  };

  const renderContent = () => {
    switch (view?.toLowerCase()) {
      case 'dashboard':
      case '':
      case '/':
        return renderDashboardByRole();

      case 'admin-management':
        return userRole === 'super_admin'
          ? <AdminManagement
            setView={setView}
            isDark={isDark}
            accentClass={accentClass}
            accentColor={accent}
            setEditingAdmin={setEditingAdmin}
          />
          : renderDashboardByRole();

      case 'admin-create':
        return userRole === 'super_admin'
          ? <AdminCreate
            setView={setView}
            accentClass={accentClass}
            accentColor={accent}
            editData={editingAdmin}
            setEditData={setEditingAdmin}
          />
          : renderDashboardByRole();

      case 'audit-evaluation-list':
        return (
          <AuditEvaluationList
            setView={setView}
            accentClass={accentClass}
            onSelectAudit={handleStartAudit}
            onViewResults={handleViewResults}
            userRole={userRole}
            currentUserId={userId}
          />
        );

      case 'audit-evaluation-perform':
        if (userRole !== 'auditor') {
          return <AuditEvaluationList setView={setView} accentClass={accentClass} userRole={userRole} />;
        }
        return (
          <AuditEvaluation
            audit={selectedAudit}
            accentClass={accentClass}
            accentColor={accent}
            onBack={() => setView('audit-evaluation-list')}
          />
        );

      case 'audit-report-view':
        return (
          <AuditReportView
            audit={selectedAudit}
            accentClass={accentClass}
            onBack={() => setView('audit-evaluation-list')}
          />
        );

      case 'management':
        return userRole === 'admin'
          ? <DepartmentManagement
            setView={setView}
            isDark={isDark}
            accentClass={accentClass}
            accentColor={accent}
            setEditData={setEditingUser} />
          : renderDashboardByRole();

      case 'admin-users':
        return (userRole === 'admin' || userRole === 'super_admin')
          ? <UserManagement />
          : renderDashboardByRole();

      case 'user-create':
        return <UserCreate
          setView={setView}
          accentClass={accentClass}
          accentColor={accent}
          editData={editingUser}
          setEditData={setEditingUser} />;

      case 'audit-management':
        return (
          <AuditManagement
            setView={setView}
            accentClass={accentClass}
            accentColor={accent}
            setSelectedAuditId={setSelectedAuditId}
          />
        );

      case 'initiate-audit':
        return (
          <InitiateAudit
            setView={setView}
            accent={accentClass}
            selectedAuditId={selectedAuditId}
            setSelectedAuditId={setSelectedAuditId}
          />
        );

      case 'settings':
        return <Settings isDark={isDark} setIsDark={setIsDark} />;

      case 'question-upload':
      case 'questionupload':
        return userRole === 'admin' ? (
          <QuestionGridModern
            setView={setView}
            accentClass={accentClass}
            accentColor={accent}
            setEditData={setEditingQuestion}
          />
        ) : renderDashboardByRole();

      case 'question-create':
      case 'questioncreate':
        return userRole === 'admin' ? (
          <QuestionCreate
            setView={setView}
            accentClass={accentClass}
            accentColor={accent}
            editData={editingQuestion}
            setEditData={setEditingQuestion} />
        ) : renderDashboardByRole();

      default:
        return renderDashboardByRole();
    }
  };

  // --- CONDITIONAL RENDER ---
  if (!isLoggedIn) {
    return (
      <Login
        onLogin={handleLogin}
        isDark={isDark}
        accentClass={accentClass}
        accentColor={accent}
      />
    );
  }

  return (
    <Layout
      isDark={isDark}
      setIsDark={setIsDark}
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      currentView={view}
      setView={setView}
      onLogout={handleLogout}
      userName={userName}
      userRole={userRole}
      accent={accent}
      setAccent={setAccent}
      accentClass={accentClass}
    >
      {renderContent()}
    </Layout>
  );
}