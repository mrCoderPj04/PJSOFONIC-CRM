import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  FileText,
  Plus,
  Zap,
  Sparkles,
  Rocket,
  X,
  Globe,
  Code
} from 'lucide-react';

export default function AdminDashboard() {
  const { setActiveTab, setSelectedProjectId } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [kpiData, projectList] = await Promise.all([
          api.getKPIs(),
          api.getProjects()
        ]);
        setKpis(kpiData);
        setProjects(projectList || []);
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [activeTabFilter, setActiveTabFilter] = useState('ALL_ACTIVE'); // ALL_ACTIVE, NEW, FINAL_APPROVAL, COMPLETED, ALL
  const [submitForm, setSubmitForm] = useState({
    projectId: '',
    live_project_url: '',
    source_code_url: '',
    bug_report_url: '',
    documentation_url: ''
  });

  const newRequests = projects.filter(p => p.status === 'NEW' || p.status === 'UNDER_REVIEW');
  const awaitingApproval = projects.filter(p => p.status === 'FINAL_APPROVAL');
  const activeProjects = projects.filter(p => p.status !== 'COMPLETED' && p.status !== 'REJECTED');
  const completedProjects = projects.filter(p => p.status === 'COMPLETED');
  const selectableProjects = projects.filter(p => p.status !== 'REJECTED');

  const handleAdminSubmitProject = async (e) => {
    e.preventDefault();
    if (!submitForm.projectId) {
      alert('Please select a project.');
      return;
    }
    try {
      await api.submitFinalDeliverables(submitForm.projectId, submitForm);
      alert('🚀 Project Deliverable submitted cleanly to Customer Portal!');
      setShowSubmitModal(false);
      setSubmitForm({ projectId: '', live_project_url: '', source_code_url: '', bug_report_url: '', documentation_url: '' });
      const [kpiData, projectList] = await Promise.all([api.getKPIs(), api.getProjects()]);
      setKpis(kpiData);
      setProjects(projectList || []);
    } catch (err) {
      alert('Failed to submit project deliverable: ' + err.message);
    }
  };

  const openProjectDetail = (projectId) => {
    setSelectedProjectId(projectId);
    setActiveTab('project_detail');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mr-3" />
        Loading Admin Dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <span>PJSOFONIC Executive Dashboard</span>
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time customer relationship metrics, project pipelines, and revenue insights.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white shadow-lg shadow-emerald-500/25 flex items-center space-x-2 transition-all"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Submit Project Deliverables</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-2 transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Sales Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab('project_requests')}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 text-white shadow-lg shadow-indigo-500/25 flex items-center space-x-2 transition-all"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Review Requests ({newRequests.length})</span>
          </button>
        </div>
      </div>

      {/* Admin Submit Project Deliverable Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/40 max-w-lg w-full space-y-5 bg-slate-950 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                {(() => {
                  const selProj = projects.find(p => String(p.id) === String(submitForm.projectId));
                  if (selProj && (selProj.status === 'COMPLETED' || selProj.customer_approved_at)) {
                    return (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-extrabold flex items-center space-x-1 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>✓ Approved by Customer</span>
                      </span>
                    );
                  }
                  return null;
                })()}
                <div className="flex items-center space-x-2 text-emerald-400 font-extrabold text-sm">
                  <Rocket className="w-5 h-5" />
                  <span>Admin Final Deliverables Submission Section</span>
                </div>
              </div>
              <button onClick={() => setShowSubmitModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminSubmitProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Select Project for Deliverables *</label>
                <select
                  required
                  value={submitForm.projectId}
                  onChange={(e) => setSubmitForm(prev => ({ ...prev, projectId: e.target.value }))}
                  className="w-full glass-input p-3 rounded-xl bg-slate-900 text-slate-100 border border-slate-800"
                >
                  <option value="">-- Choose Project --</option>
                  {selectableProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.project_code}) - [{p.status.replace('_', ' ')}] - {p.company_name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">All active, pending, and in-review projects are listed here.</p>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Live Project Demo / Deployment Details (Text or URL) *</label>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. https://demo.clientapp.com or Staging deployed on server port 3000"
                    value={submitForm.live_project_url}
                    onChange={(e) => setSubmitForm(prev => ({ ...prev, live_project_url: e.target.value }))}
                    className="w-full glass-input p-3 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Source Code / Repository / ZIP Location (Text or URL)</label>
                <div className="flex items-center space-x-2">
                  <Code className="w-4 h-4 text-purple-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="e.g. GitHub repo link or ZIP uploaded to Google Drive folder"
                    value={submitForm.source_code_url}
                    onChange={(e) => setSubmitForm(prev => ({ ...prev, source_code_url: e.target.value }))}
                    className="w-full glass-input p-3 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">QA Bug Sheet / Status (Text or URL)</label>
                  <input
                    type="text"
                    placeholder="e.g. All QA test cases passed 100% or Sheet link"
                    value={submitForm.bug_report_url}
                    onChange={(e) => setSubmitForm(prev => ({ ...prev, bug_report_url: e.target.value }))}
                    className="w-full glass-input p-2.5 rounded-xl text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">User Manual / Doc Notes (Text or URL)</label>
                  <input
                    type="text"
                    placeholder="e.g. Documentation attached in files or Doc link"
                    value={submitForm.documentation_url}
                    onChange={(e) => setSubmitForm(prev => ({ ...prev, documentation_url: e.target.value }))}
                    className="w-full glass-input p-2.5 rounded-xl text-[11px]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-extrabold shadow-lg shadow-emerald-500/25"
                >
                  Submit Deliverables to Customer Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Requests</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{kpis?.new_requests || 0}</div>
          <div className="mt-2 text-[11px] text-indigo-400 font-semibold flex items-center space-x-1">
            <span>Requires Admin Review</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Projects</span>
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{kpis?.active_projects || 0}</div>
          <div className="mt-2 text-[11px] text-violet-400 font-semibold flex items-center space-x-1">
            <span>In Execution / Review</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{kpis?.completed_projects || 0}</div>
          <div className="mt-2 text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
            <span>Customer Approved</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue Pipeline</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">₹{kpis?.revenue?.toLocaleString('en-IN') || '12,80,000'}</div>
          <div className="mt-2 text-[11px] text-amber-400 font-semibold flex items-center space-x-1">
            <span>Est. Pipeline Value</span>
          </div>
        </div>
      </div>

      {/* Project Pipeline & Customer Submissions Queue Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Customer Requests & Pipeline View */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-200 flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>Customer Projects Queue (Visible across all stages)</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                From submission to development, deliverables delivery, and customer final approval.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-[11px]">
              <button
                onClick={() => setActiveTabFilter('ALL_ACTIVE')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeTabFilter === 'ALL_ACTIVE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Active ({activeProjects.length})
              </button>
              <button
                onClick={() => setActiveTabFilter('NEW')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeTabFilter === 'NEW' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                New ({newRequests.length})
              </button>
              <button
                onClick={() => setActiveTabFilter('FINAL_APPROVAL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeTabFilter === 'FINAL_APPROVAL' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Awaiting Approval ({awaitingApproval.length})
              </button>
              <button
                onClick={() => setActiveTabFilter('COMPLETED')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeTabFilter === 'COMPLETED' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Completed ({completedProjects.length})
              </button>
            </div>
          </div>

          {/* Project List */}
          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {(() => {
              let displayList = projects;
              if (activeTabFilter === 'ALL_ACTIVE') {
                displayList = activeProjects;
              } else if (activeTabFilter === 'NEW') {
                displayList = newRequests;
              } else if (activeTabFilter === 'FINAL_APPROVAL') {
                displayList = awaitingApproval;
              } else if (activeTabFilter === 'COMPLETED') {
                displayList = completedProjects;
              }

              if (displayList.length === 0) {
                return (
                  <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800 text-slate-400 text-xs">
                    No projects found for this filter.
                  </div>
                );
              }

              return displayList.map((proj) => (
                <div
                  key={proj.id}
                  className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {proj.project_code}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        proj.status === 'NEW' ? 'badge-new' :
                        proj.status === 'COMPLETED' || proj.customer_approved_at ? 'badge-completed' :
                        proj.status === 'FINAL_APPROVAL' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        proj.status === 'IN_DEVELOPMENT' ? 'badge-dev' : 'badge-review'
                      }`}>
                        {proj.status === 'FINAL_APPROVAL' ? '⏳ AWAITING CLIENT APPROVAL' : proj.status.replace('_', ' ')}
                      </span>
                      {proj.customer_approved_at && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          ✓ Customer Approved
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-100 text-sm truncate">{proj.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{proj.overview}</p>
                    <div className="flex items-center space-x-4 text-[11px] text-slate-500 pt-1">
                      <span>Company: <strong className="text-slate-300">{proj.company_name}</strong></span>
                      <span>Target Delivery: <strong className="text-slate-300">{proj.expected_end_date}</strong></span>
                      <span>Progress: <strong className="text-emerald-400">{proj.overall_progress}%</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {proj.status !== 'COMPLETED' && (
                      <button
                        onClick={() => {
                          setSubmitForm(prev => ({ ...prev, projectId: String(proj.id) }));
                          setShowSubmitModal(true);
                        }}
                        className="px-3 py-2 text-xs font-bold rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1 transition-all"
                        title="Submit deliverables for this project"
                      >
                        <Rocket className="w-3.5 h-3.5" />
                        <span>Deliverables</span>
                      </button>
                    )}
                    <button
                      onClick={() => openProjectDetail(proj.id)}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 flex items-center space-x-1.5 transition-all"
                    >
                      <span>VIEW PROJECT</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Right 1 Col: Project Health Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <h2 className="text-base font-bold text-slate-200 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-violet-400" />
            <span>Project Health Matrix</span>
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-emerald-500/20">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-slate-200">On Track</span>
              </div>
              <span className="text-xs font-extrabold text-emerald-400">18 Projects</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-amber-500/20">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-xs font-bold text-slate-200">At Risk</span>
              </div>
              <span className="text-xs font-extrabold text-amber-400">4 Projects</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-rose-500/20">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="text-xs font-bold text-slate-200">Delayed</span>
              </div>
              <span className="text-xs font-extrabold text-rose-400">2 Projects</span>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Today's Reminders</div>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 flex items-center justify-between">
                <span>ABC Tech Proposal Review</span>
                <span className="text-[10px] text-indigo-400 font-semibold">02:00 PM</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 flex items-center justify-between">
                <span>XYZ Mobile App Sprint Sync</span>
                <span className="text-[10px] text-purple-400 font-semibold">04:30 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
