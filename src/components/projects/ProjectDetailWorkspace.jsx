import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Briefcase,
  User,
  Building,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  MessageSquare,
  Video,
  ShieldCheck,
  Plus,
  Send,
  Download,
  Link as LinkIcon,
  Sparkles,
  ChevronRight,
  Rocket,
  Code,
  Bug,
  Globe,
  ExternalLink,
  Check,
  RefreshCw
} from 'lucide-react';

export default function ProjectDetailWorkspace({ projectId }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [files, setFiles] = useState([]);
  const [comments, setComments] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState('overview'); // overview, final_submission, timeline, progress, files, discussion, meetings

  // Form States
  const [newComment, setNewComment] = useState('');
  const [newUpdateTitle, setNewUpdateTitle] = useState('');
  const [newUpdateDesc, setNewUpdateDesc] = useState('');
  const [newUpdateNext, setNewUpdateNext] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [newFileVersion, setNewFileVersion] = useState('v1.0');

  // Final Submission Links Form (Admin)
  const [finalLinks, setFinalLinks] = useState({
    live_project_url: '',
    source_code_url: '',
    bug_report_url: '',
    documentation_url: ''
  });

  const loadProjectData = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [p, ms, ups, fs, comms, mtgs, apps] = await Promise.all([
        api.getProject(projectId),
        api.getMilestones(projectId),
        api.getUpdates(projectId),
        api.getFiles(projectId),
        api.getComments(projectId),
        api.getMeetings(projectId),
        api.getApprovals(projectId)
      ]);
      setProject(p);
      setMilestones(ms || []);
      setUpdates(ups || []);
      setFiles(fs || []);
      setComments(comms || []);
      setMeetings(mtgs || []);
      setApprovals(apps || []);

      if (p) {
        setFinalLinks({
          live_project_url: p.live_project_url || '',
          source_code_url: p.source_code_url || '',
          bug_report_url: p.bug_report_url || '',
          documentation_url: p.documentation_url || ''
        });
      }
    } catch (err) {
      console.error('Failed to load project workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.postComment(projectId, newComment);
      setNewComment('');
      const updated = await api.getComments(projectId);
      setComments(updated);
    } catch (err) {
      alert('Failed to post comment: ' + err.message);
    }
  };

  const handlePublishUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdateTitle.trim()) return;
    try {
      await api.createUpdate(projectId, {
        title: newUpdateTitle,
        description: newUpdateDesc,
        next_steps: newUpdateNext
      });
      setNewUpdateTitle('');
      setNewUpdateDesc('');
      setNewUpdateNext('');
      const updated = await api.getUpdates(projectId);
      setUpdates(updated);
      alert('Update published to customer feed!');
    } catch (err) {
      alert('Failed to publish update: ' + err.message);
    }
  };

  const handleUploadFile = async (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    try {
      await api.uploadFile(projectId, {
        file_name: newFileName,
        file_type: newFileName.endsWith('.pdf') ? 'PDF' : newFileName.endsWith('.fig') ? 'Figma' : 'Document',
        file_size: '2.5 MB',
        file_url: newFileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        version: newFileVersion,
        category: isAdmin ? 'ADMIN_DELIVERABLE' : 'REQUIREMENTS'
      });
      setNewFileName('');
      setNewFileUrl('');
      const updated = await api.getFiles(projectId);
      setFiles(updated);
      alert('File added to Vault!');
    } catch (err) {
      alert('Failed to upload file: ' + err.message);
    }
  };

  const handleAdminFinalSubmission = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.submitFinalDeliverables(projectId, finalLinks);
      setProject(updated);
      alert('Final Deliverable Links submitted! Customer has been notified for Final Approval.');
    } catch (err) {
      alert('Failed to submit final deliverables: ' + err.message);
    }
  };

  const handleCustomerFinalApproval = async (action) => {
    let notes = null;
    if (action === 'REVISION') {
      notes = prompt('Please enter feedback/revision requests for the Admin:');
      if (!notes) return;
    }

    try {
      const updated = await api.customerFinalApproval(projectId, action, notes);
      setProject(updated);
      if (action === 'APPROVE') {
        alert('🎉 Congratulations! You have approved the final project delivery. Status set to COMPLETED.');
      } else {
        alert('Revision request transmitted to Admin.');
      }
    } catch (err) {
      alert('Failed to update final approval: ' + err.message);
    }
  };

  if (loading) {
    return <div className="text-slate-400 text-sm py-12 text-center">Loading Project Execution Workspace...</div>;
  }

  if (!project) {
    return <div className="text-slate-400 text-sm py-12 text-center">Project workspace not found.</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Workspace Top Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="text-xs font-extrabold px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {project.project_code}
              </span>
              <span className={`text-xs font-extrabold px-3 py-0.5 rounded-full ${
                project.status === 'NEW' ? 'badge-new' :
                project.status === 'COMPLETED' ? 'badge-completed' :
                project.status === 'FINAL_APPROVAL' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold' :
                project.status === 'IN_DEVELOPMENT' ? 'badge-dev' : 'badge-review'
              }`}>
                {project.status.replace('_', ' ')}
              </span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Health: {project.health}</span>
              </span>
            </div>

            <h1 className="text-2xl font-black text-white">{project.title}</h1>
            <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
              <span className="flex items-center space-x-1">
                <Building className="w-3.5 h-3.5 text-indigo-400" />
                <span>{project.company_name}</span>
              </span>
              <span>•</span>
              <span>Type: <strong className="text-slate-200">{project.project_type}</strong></span>
              <span>•</span>
              <span>Target: <strong className="text-slate-200">{project.expected_end_date}</strong></span>
            </div>
          </div>

          {/* Overall Progress Widget */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-right shrink-0">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overall Completion</div>
            <div className="text-2xl font-black text-emerald-400">{project.overall_progress}%</div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center space-x-2 border-t border-slate-800/80 pt-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Specs', icon: FileText },
            { id: 'final_delivery', label: 'Final Delivery & Approvals', icon: Rocket, highlight: project.status === 'FINAL_APPROVAL' },
            { id: 'timeline', label: 'Timeline & Milestones', icon: Clock },
            { id: 'progress', label: 'Progress & Updates', icon: Sparkles },
            { id: 'files', label: `Files Vault (${files.length})`, icon: Upload },
            { id: 'discussion', label: `Discussion (${comments.length})`, icon: MessageSquare },
            { id: 'meetings', label: `Meetings & Approvals (${approvals.length})`, icon: Video },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center space-x-2 transition-all ${
                  t.highlight
                    ? 'bg-amber-600 text-white animate-pulse shadow-lg shadow-amber-600/30'
                    : active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FINAL DELIVERY APPROVAL BANNER FOR CUSTOMER & ADMIN */}
      {(project.live_project_url || project.source_code_url || project.bug_report_url || project.status === 'FINAL_APPROVAL' || project.status === 'COMPLETED') && (
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-slate-900 to-indigo-950/20 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Rocket className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-black text-white">Final Project Delivery & Deliverables Vault</h2>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {project.status === 'COMPLETED'
                  ? '🎉 Project officially approved by Customer and marked COMPLETED.'
                  : 'Admin has submitted the final project deliverables. Customer review and final approval required.'}
              </p>
            </div>

            {/* Customer Final Approval Buttons */}
            {!isAdmin && project.status !== 'COMPLETED' && (
              <div className="flex items-center space-x-3 shrink-0">
                <button
                  onClick={() => handleCustomerFinalApproval('APPROVE')}
                  className="px-5 py-2.5 text-xs font-extrabold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white shadow-lg shadow-emerald-500/25 flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ACCEPT & APPROVE FINAL PROJECT</span>
                </button>

                <button
                  onClick={() => handleCustomerFinalApproval('REVISION')}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Request Revision</span>
                </button>
              </div>
            )}

            {project.status === 'COMPLETED' && (
              <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Customer Approved on {new Date(project.customer_approved_at || project.updated_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-2 text-slate-400 font-bold">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Live Project URL</span>
              </div>
              {project.live_project_url ? (
                <a href={project.live_project_url} target="_blank" rel="noreferrer" className="text-indigo-400 font-bold truncate block hover:underline flex items-center space-x-1">
                  <span className="truncate">{project.live_project_url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <span className="text-slate-600 italic">Not provided yet</span>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-2 text-slate-400 font-bold">
                <Code className="w-4 h-4 text-purple-400" />
                <span>Source Code / ZIP</span>
              </div>
              {project.source_code_url ? (
                <a href={project.source_code_url} target="_blank" rel="noreferrer" className="text-purple-400 font-bold truncate block hover:underline flex items-center space-x-1">
                  <span className="truncate">{project.source_code_url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <span className="text-slate-600 italic">Not provided yet</span>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-2 text-slate-400 font-bold">
                <Bug className="w-4 h-4 text-rose-400" />
                <span>Bug & Defect QA Report</span>
              </div>
              {project.bug_report_url ? (
                <a href={project.bug_report_url} target="_blank" rel="noreferrer" className="text-rose-400 font-bold truncate block hover:underline flex items-center space-x-1">
                  <span className="truncate">{project.bug_report_url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <span className="text-slate-600 italic">Not provided yet</span>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-2 text-slate-400 font-bold">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Documentation / Assets</span>
              </div>
              {project.documentation_url ? (
                <a href={project.documentation_url} target="_blank" rel="noreferrer" className="text-amber-400 font-bold truncate block hover:underline flex items-center space-x-1">
                  <span className="truncate">{project.documentation_url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <span className="text-slate-600 italic">Not provided yet</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: FINAL DELIVERY SUBMISSION (FOR ADMIN) */}
      {(tab === 'final_delivery' || isAdmin) && (
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/40 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Rocket className="w-5 h-5 text-amber-400" />
              <span>Admin Final Deliverables Submission Section</span>
            </h2>
            <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Admin Exclusive
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Submit the final project links (Google Drive / GitHub / Live URLs) for customer review and final approval.
          </p>

          <form onSubmit={handleAdminFinalSubmission} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-1.5 flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Live Project URL / Demo Link</span>
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... or https://clientapp.pjsofonic.com"
                  value={finalLinks.live_project_url}
                  onChange={(e) => setFinalLinks({ ...finalLinks, live_project_url: e.target.value })}
                  className="w-full glass-input p-3 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1.5 flex items-center space-x-1.5">
                  <Code className="w-3.5 h-3.5 text-purple-400" />
                  <span>Source Code / ZIP Drive Link</span>
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/... or GitHub URL"
                  value={finalLinks.source_code_url}
                  onChange={(e) => setFinalLinks({ ...finalLinks, source_code_url: e.target.value })}
                  className="w-full glass-input p-3 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-1.5 flex items-center space-x-1.5">
                  <Bug className="w-3.5 h-3.5 text-rose-400" />
                  <span>Bug & Defect Report Drive Link</span>
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/... (QA Bug Spreadsheet)"
                  value={finalLinks.bug_report_url}
                  onChange={(e) => setFinalLinks({ ...finalLinks, bug_report_url: e.target.value })}
                  className="w-full glass-input p-3 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1.5 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Documentation & Handover Drive Link</span>
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/... (User Manual / Architecture)"
                  value={finalLinks.documentation_url}
                  onChange={(e) => setFinalLinks({ ...finalLinks, documentation_url: e.target.value })}
                  className="w-full glass-input p-3 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3 text-xs font-extrabold rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 text-white shadow-lg shadow-amber-500/25 flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Rocket className="w-4 h-4" />
                <span>Submit Final Deliverables to Customer</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 1: OVERVIEW & SPECS */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Project Requirements Specification</span>
            </h2>

            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <div className="font-semibold text-slate-400">Overview:</div>
              <p className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">{project.overview}</p>

              <div className="font-semibold text-slate-400 pt-2">Full Specifications:</div>
              {project.requirements_html ? (
                <div
                  className="prose prose-invert max-w-none text-xs p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-emerald-300"
                  dangerouslySetInnerHTML={{ __html: project.requirements_html }}
                />
              ) : (
                <p className="text-slate-500 italic">No detailed HTML requirements specified.</p>
              )}
            </div>
          </div>

          {/* Right Column: Customer Info from EMS */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
              <User className="w-4 h-4 text-emerald-400" />
              <span>Customer Information (EMS)</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center space-x-3">
                <img
                  src={project.customer?.avatar_url || '/pjsofonic_crm.png'}
                  alt="Customer"
                  className="w-10 h-10 rounded-xl object-contain bg-slate-900 border border-slate-800 p-1"
                />
                <div>
                  <div className="font-bold text-slate-100">{project.customer?.name}</div>
                  <div className="text-slate-400 text-[11px]">{project.customer?.email}</div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-slate-400">
                <div className="flex justify-between">
                  <span>EMS User ID:</span>
                  <strong className="text-slate-200">{project.customer?.ems_user_id}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Company:</span>
                  <strong className="text-slate-200">{project.customer?.company}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <strong className="text-slate-200">{project.customer?.phone}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TIMELINE & MILESTONES */}
      {tab === 'timeline' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-violet-400" />
            <span>Interactive Phase Timeline & Milestones</span>
          </h2>

          <div className="space-y-4">
            {milestones.map((ms, idx) => (
              <div key={ms.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    ms.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {ms.phase}
                      </span>
                      <h3 className="font-bold text-slate-100 text-sm">{ms.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{ms.description || 'Assigned Execution Phase'}</p>
                    <div className="flex items-center space-x-4 text-[11px] text-slate-500 mt-2">
                      <span>Dates: <strong className="text-slate-300">{ms.start_date} → {ms.end_date}</strong></span>
                      <span>Team: <strong className="text-indigo-300">{ms.assigned_team}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-48 text-right space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">{ms.status}</span>
                    <span className="font-bold text-emerald-400">{ms.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${ms.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PROGRESS & UPDATES */}
      {tab === 'progress' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sub-system Breakdown */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-3">Sub-System Completion %</h2>
            <div className="space-y-4 text-xs">
              {Object.entries(project.subsystem_progress || {}).map(([key, val]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-semibold">{key}</span>
                    <span className="text-emerald-400 font-extrabold">{val}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Published Updates Feed */}
          <div className="lg:col-span-2 space-y-6">
            {isAdmin && (
              <form onSubmit={handlePublishUpdate} className="glass-panel p-5 rounded-2xl border border-indigo-500/30 space-y-3">
                <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Publish Progress Update for Customer</h3>
                <input
                  type="text"
                  required
                  placeholder="Update Title (e.g. Frontend Implementation 80% Complete)"
                  value={newUpdateTitle}
                  onChange={(e) => setNewUpdateTitle(e.target.value)}
                  className="w-full glass-input p-2.5 rounded-xl text-xs"
                />
                <textarea
                  rows={2}
                  placeholder="Update summary details..."
                  value={newUpdateDesc}
                  onChange={(e) => setNewUpdateDesc(e.target.value)}
                  className="w-full glass-input p-2.5 rounded-xl text-xs"
                />
                <input
                  type="text"
                  placeholder="Next steps..."
                  value={newUpdateNext}
                  onChange={(e) => setNewUpdateNext(e.target.value)}
                  className="w-full glass-input p-2.5 rounded-xl text-xs"
                />
                <div className="flex justify-end">
                  <button type="submit" className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white">
                    Publish Update
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-100">Published Progress Updates Feed</h2>
              {updates.map((u) => (
                <div key={u.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400">{u.author_name}</span>
                    <span className="text-[11px] text-slate-500">{new Date(u.published_at).toLocaleString()}</span>
                  </div>
                  <h3 className="font-bold text-slate-100 text-sm">{u.title}</h3>
                  <p className="text-xs text-slate-300">{u.description}</p>
                  {u.next_steps && (
                    <div className="text-[11px] text-emerald-400 font-semibold pt-1">Next Step: {u.next_steps}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FILES VAULT */}
      {tab === 'files' && (
        <div className="space-y-6">
          <form onSubmit={handleUploadFile} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Upload Asset / Document to Vault</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="File Name (e.g. Design_v2.fig)"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="glass-input p-2.5 rounded-xl"
              />
              <input
                type="url"
                placeholder="File URL / Drive Link"
                value={newFileUrl}
                onChange={(e) => setNewFileUrl(e.target.value)}
                className="glass-input p-2.5 rounded-xl"
              />
              <select
                value={newFileVersion}
                onChange={(e) => setNewFileVersion(e.target.value)}
                className="glass-input p-2.5 rounded-xl bg-slate-900 text-slate-300"
              >
                <option value="v1.0">v1.0 Initial</option>
                <option value="v2.0">v2.0 Revision</option>
                <option value="v-Final">v-Final Release</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500">
                Upload File
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((f) => (
              <div key={f.id} className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 text-xs">{f.file_name}</div>
                    <div className="text-[10px] text-slate-400">
                      Uploaded by {f.uploaded_by_name} ({f.uploaded_by_role}) • <span className="text-indigo-400 font-bold">{f.version}</span>
                    </div>
                  </div>
                </div>

                <a
                  href={f.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DISCUSSION */}
      {tab === 'discussion' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Direct Project Discussion Thread</span>
          </h2>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {comments.map((c) => (
              <div
                key={c.id}
                className={`p-3.5 rounded-2xl max-w-xl text-xs space-y-1 ${
                  c.sender_role === user?.role
                    ? 'ml-auto bg-indigo-600/20 border border-indigo-500/30 text-slate-100'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                  <span>{c.sender_name} ({c.sender_role})</span>
                  <span>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="leading-snug">{c.message}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handlePostComment} className="flex items-center space-x-2 pt-2">
            <input
              type="text"
              placeholder="Type message to Admin/Customer..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 glass-input p-3 rounded-xl text-xs"
            />
            <button type="submit" className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 6: MEETINGS & APPROVALS */}
      {tab === 'meetings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Meetings List */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Video className="w-4 h-4 text-purple-400" />
              <span>Scheduled Meetings</span>
            </h2>

            {meetings.map((m) => (
              <div key={m.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-slate-100">{m.title}</div>
                <div className="text-slate-400">{m.agenda}</div>
                <div className="text-indigo-400 font-semibold">{m.meeting_time}</div>
                <a
                  href={m.meeting_link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-[11px] mt-2"
                >
                  Join Meeting
                </a>
              </div>
            ))}
          </div>

          {/* Approvals Review */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Deliverable Approvals Review</span>
            </h2>

            {approvals.map((a) => (
              <div key={a.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-100">{a.title} ({a.version})</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                    a.status === 'APPROVED' ? 'badge-completed' : 'badge-review'
                  }`}>
                    {a.status}
                  </span>
                </div>
                {a.customer_notes && <div className="text-slate-400 italic">Notes: {a.customer_notes}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
