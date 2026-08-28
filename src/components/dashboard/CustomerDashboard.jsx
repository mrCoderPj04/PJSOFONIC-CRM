import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Briefcase,
  PlusCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  FileCheck,
  Calendar,
  Sparkles,
  AlertCircle,
  Globe,
  Code,
  Bug,
  FileText,
  ExternalLink,
  X,
  RefreshCw
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user, setActiveTab, setSelectedProjectId } = useAuth();
  const [projects, setProjects] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDeliverableProject, setSelectedDeliverableProject] = useState(null);
  const [approving, setApproving] = useState(false);

  const loadCustomerData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [kpiData, projectList] = await Promise.all([
        api.getKPIs(),
        api.getProjects()
      ]);
      setKpis(kpiData);
      setProjects(projectList || []);
    } catch (err) {
      if (!isSilent) console.error('Failed to load customer dashboard:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
    // Real-time polling every 3 seconds to immediately catch Admin deliverables submissions
    const interval = setInterval(() => {
      loadCustomerData(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const openProjectDetail = (id, tabName = 'overview') => {
    setSelectedProjectId(id);
    setActiveTab('project_detail');
  };

  const handleDashboardApprove = async (projectId, action) => {
    let notes = null;
    if (action === 'REVISION') {
      notes = prompt('Please enter feedback/revision details for the Admin:');
      if (!notes) return;
    }

    setApproving(true);
    try {
      await api.customerFinalApproval(projectId, action, notes);
      alert(action === 'APPROVE' ? '🎉 Congratulations! You have approved the project deliverables. Status set to COMPLETED.' : 'Revision request submitted to Admin.');
      setSelectedDeliverableProject(null);
      await loadCustomerData();
    } catch (err) {
      alert('Failed to process approval: ' + err.message);
    } finally {
      setApproving(false);
    }
  };

  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, FINAL_APPROVAL, COMPLETED

  const pendingDeliverables = projects.filter(p => p.status === 'FINAL_APPROVAL');
  const activeProjects = projects.filter(p => p.status !== 'COMPLETED' && p.status !== 'REJECTED');
  const completedProjects = projects.filter(p => p.status === 'COMPLETED');

  const filteredProjects = projects.filter(p => {
    if (filter === 'ACTIVE') return p.status !== 'COMPLETED' && p.status !== 'REJECTED';
    if (filter === 'FINAL_APPROVAL') return p.status === 'FINAL_APPROVAL';
    if (filter === 'COMPLETED') return p.status === 'COMPLETED';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mr-3" />
        Loading Customer Portal...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {user?.company}
            </span>
            <span className="text-xs text-slate-400">EMS User ID: {user?.ems_user_id}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track your project progress, submit new requirements, upload design files, and review deliverables.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('new_request')}
          className="px-5 py-3 text-xs font-extrabold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white shadow-lg shadow-emerald-500/25 flex items-center space-x-2 transition-all shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Project Request</span>
        </button>
      </div>

      {/* High-Priority Deliverables Ready for Approval Banner */}
      {pendingDeliverables.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 space-y-3 shadow-xl">
          <div className="flex items-center space-x-2 text-amber-400 font-extrabold text-sm">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>Action Required: Deliverables Submitted for Your Approval ({pendingDeliverables.length})</span>
          </div>
          <p className="text-xs text-slate-300">
            Admin has completed development and submitted live project demo links, source code, and QA bug reports for the following project(s). Please review and approve:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {pendingDeliverables.map(p => (
              <div key={p.id} className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {p.project_code}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">{p.company_name}</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1.5">{p.title}</div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">{p.overview}</div>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setSelectedDeliverableProject(p)}
                    className="flex-1 py-2 text-xs font-extrabold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Quick Review & Approve</span>
                  </button>
                  <button
                    onClick={() => openProjectDetail(p.id, 'final_delivery')}
                    className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Full Workspace</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Quick Review & Approval Modal */}
      {selectedDeliverableProject && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/40 max-w-2xl w-full space-y-6 bg-slate-950 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">{selectedDeliverableProject.title}</h2>
                  <p className="text-xs text-slate-400">{selectedDeliverableProject.project_code} • Deliverables Approval Section</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDeliverableProject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-slate-200">Project Overview:</div>
              <p>{selectedDeliverableProject.overview}</p>
            </div>

            {/* 4 Deliverable Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* 1. Live URL */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-slate-300 font-bold">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Live Project Demo / Deployment Notes</span>
                </div>
                {selectedDeliverableProject.live_project_url ? (
                  selectedDeliverableProject.live_project_url.startsWith('http://') || selectedDeliverableProject.live_project_url.startsWith('https://') ? (
                    <a
                      href={selectedDeliverableProject.live_project_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 font-bold flex items-center justify-between block truncate transition-all"
                    >
                      <span className="truncate">{selectedDeliverableProject.live_project_url}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1" />
                    </a>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 font-medium whitespace-pre-wrap break-words">
                      {selectedDeliverableProject.live_project_url}
                    </div>
                  )
                ) : (
                  <div className="text-slate-500 italic p-2 rounded-lg bg-slate-950/40">Not uploaded</div>
                )}
              </div>

              {/* 2. Source Code */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-slate-300 font-bold">
                  <Code className="w-4 h-4 text-purple-400" />
                  <span>Source Code / ZIP / Access Notes</span>
                </div>
                {selectedDeliverableProject.source_code_url ? (
                  selectedDeliverableProject.source_code_url.startsWith('http://') || selectedDeliverableProject.source_code_url.startsWith('https://') ? (
                    <a
                      href={selectedDeliverableProject.source_code_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 font-bold flex items-center justify-between block truncate transition-all"
                    >
                      <span className="truncate">{selectedDeliverableProject.source_code_url}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1" />
                    </a>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-purple-200 font-medium whitespace-pre-wrap break-words">
                      {selectedDeliverableProject.source_code_url}
                    </div>
                  )
                ) : (
                  <div className="text-slate-500 italic p-2 rounded-lg bg-slate-950/40">Not uploaded</div>
                )}
              </div>

              {/* 3. Bug QA Sheet */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-slate-300 font-bold">
                  <Bug className="w-4 h-4 text-rose-400" />
                  <span>QA Bug & Defect Sheet / Notes</span>
                </div>
                {selectedDeliverableProject.bug_report_url ? (
                  selectedDeliverableProject.bug_report_url.startsWith('http://') || selectedDeliverableProject.bug_report_url.startsWith('https://') ? (
                    <a
                      href={selectedDeliverableProject.bug_report_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 font-bold flex items-center justify-between block truncate transition-all"
                    >
                      <span className="truncate">{selectedDeliverableProject.bug_report_url}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1" />
                    </a>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-rose-200 font-medium whitespace-pre-wrap break-words">
                      {selectedDeliverableProject.bug_report_url}
                    </div>
                  )
                ) : (
                  <div className="text-slate-500 italic p-2 rounded-lg bg-slate-950/40">Not uploaded</div>
                )}
              </div>

              {/* 4. Documentation */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-slate-300 font-bold">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Documentation / Handover Notes</span>
                </div>
                {selectedDeliverableProject.documentation_url ? (
                  selectedDeliverableProject.documentation_url.startsWith('http://') || selectedDeliverableProject.documentation_url.startsWith('https://') ? (
                    <a
                      href={selectedDeliverableProject.documentation_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 font-bold flex items-center justify-between block truncate transition-all"
                    >
                      <span className="truncate">{selectedDeliverableProject.documentation_url}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1" />
                    </a>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-amber-200 font-medium whitespace-pre-wrap break-words">
                      {selectedDeliverableProject.documentation_url}
                    </div>
                  )
                ) : (
                  <div className="text-slate-500 italic p-2 rounded-lg bg-slate-950/40">Not uploaded</div>
                )}
              </div>
            </div>

            {/* Approval Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                disabled={approving}
                onClick={() => handleDashboardApprove(selectedDeliverableProject.id, 'REVISION')}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                Request Revisions
              </button>
              <button
                type="button"
                disabled={approving}
                onClick={() => handleDashboardApprove(selectedDeliverableProject.id, 'APPROVE')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white text-xs font-black shadow-lg shadow-emerald-500/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{approving ? 'Approving Project...' : '✅ APPROVE & ACCEPT DELIVERABLES'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>My Projects</span>
            <Briefcase className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{projects.length}</div>
          <div className="mt-1 text-[11px] text-slate-400">Total Submitted</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>In Execution / Review</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{activeProjects.length}</div>
          <div className="mt-1 text-[11px] text-indigo-400">Active Pipeline</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Completed & Approved</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{completedProjects.length}</div>
          <div className="mt-1 text-[11px] text-purple-400">Successfully Delivered</div>
        </div>
      </div>

      {/* Active Projects List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-200 flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>My Project Status & Progress (Visible across all stages)</span>
          </h2>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-[11px]">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({projects.length})
            </button>
            <button
              onClick={() => setFilter('ACTIVE')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filter === 'ACTIVE' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active ({activeProjects.length})
            </button>
            <button
              onClick={() => setFilter('FINAL_APPROVAL')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filter === 'FINAL_APPROVAL' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Awaiting Approval ({pendingDeliverables.length})
            </button>
            <button
              onClick={() => setFilter('COMPLETED')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filter === 'COMPLETED' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Completed ({completedProjects.length})
            </button>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No projects found in this category.</p>
            <button
              onClick={() => setActiveTab('new_request')}
              className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white"
            >
              Submit First Project Request
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {proj.project_code}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      proj.status === 'NEW' ? 'badge-new' :
                      proj.status === 'COMPLETED' || proj.customer_approved_at ? 'badge-completed' :
                      proj.status === 'FINAL_APPROVAL' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      proj.status === 'IN_DEVELOPMENT' ? 'badge-dev' : 'badge-review'
                    }`}>
                      {proj.status === 'FINAL_APPROVAL' ? '🚀 DELIVERABLES READY' : proj.status.replace('_', ' ')}
                    </span>
                    {proj.customer_approved_at && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ✓ Approved
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{proj.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{proj.overview}</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Overall Progress</span>
                    <span className="text-emerald-400 font-extrabold">{proj.overall_progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${proj.overall_progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-slate-400">
                    Expected Delivery: <strong className="text-slate-200">{proj.expected_end_date}</strong>
                  </div>

                  <button
                    onClick={() => openProjectDetail(proj.id)}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 flex items-center space-x-1 transition-all cursor-pointer"
                  >
                    <span>{proj.status === 'FINAL_APPROVAL' ? 'Review & Approve' : 'View Portal'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
