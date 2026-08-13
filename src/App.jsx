import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import AdminDashboard from './components/dashboard/AdminDashboard';
import CustomerDashboard from './components/dashboard/CustomerDashboard';
import LeadsKanban from './components/leads/LeadsKanban';
import ProposalsList from './components/proposals/ProposalsList';
import CustomerNewProjectRequest from './components/projects/CustomerNewProjectRequest';
import AdminProjectRequests from './components/projects/AdminProjectRequests';
import ProjectDetailWorkspace from './components/projects/ProjectDetailWorkspace';
import AuditLogsView from './components/audit/AuditLogsView';
import ReportsView from './components/analytics/ReportsView';
import { Briefcase, ChevronRight } from 'lucide-react';
import { api } from './services/api';

function MainContent() {
  const { user, activeTab, setActiveTab, selectedProjectId, setSelectedProjectId } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [projects, setProjects] = React.useState([]);

  React.useEffect(() => {
    if (activeTab === 'active_projects' || activeTab === 'my_projects') {
      api.getProjects().then(res => setProjects(res || []));
    }
  }, [activeTab]);

  return (
    <main className="flex-1 overflow-y-auto p-6 bg-slate-950/40">
      {activeTab === 'dashboard' && (isAdmin ? <AdminDashboard /> : <CustomerDashboard />)}
      
      {activeTab === 'leads' && <LeadsKanban />}
      
      {activeTab === 'proposals' && <ProposalsList />}
      
      {activeTab === 'project_requests' && <AdminProjectRequests />}

      {activeTab === 'new_request' && <CustomerNewProjectRequest />}

      {activeTab === 'project_detail' && selectedProjectId && (
        <ProjectDetailWorkspace projectId={selectedProjectId} />
      )}

      {(activeTab === 'active_projects' || activeTab === 'my_projects') && (
        <div className="space-y-6 pb-10">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              <span>{isAdmin ? 'All Active CRM Projects' : 'My Projects'}</span>
            </h1>
          </div>

          {projects.length === 0 ? (
            <div className="glass-panel p-10 text-center rounded-2xl border border-slate-800 text-slate-400 text-sm">
              No active projects found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((p) => (
                <div key={p.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold px-2 py-0.5 rounded bg-slate-800 text-slate-300">{p.project_code}</span>
                    <span className="font-extrabold px-2 py-0.5 rounded badge-dev">{p.status}</span>
                  </div>
                  <h3 className="font-bold text-slate-100 text-sm">{p.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{p.overview}</p>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                    <span className="text-xs font-bold text-emerald-400">{p.overall_progress}% Progress</span>
                    <button
                      onClick={() => {
                        setSelectedProjectId(p.id);
                        setActiveTab('project_detail');
                      }}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 text-white flex items-center space-x-1"
                    >
                      <span>Open Workspace</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && <ReportsView />}

      {activeTab === 'audit_logs' && <AuditLogsView />}
    </main>
  );
}

function AuthenticatedApp() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <MainContent />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
