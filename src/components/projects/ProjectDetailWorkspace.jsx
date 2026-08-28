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
  RefreshCw,
  Trash2
} from 'lucide-react';

export default function ProjectDetailWorkspace({ projectId }) {
  const { user, setActiveTab } = useAuth();
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

  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingAgenda, setNewMeetingAgenda] = useState('');
  const [newMeetingTime, setNewMeetingTime] = useState('');
  const [newMeetingLink, setNewMeetingLink] = useState('');

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
      // 1. Fetch main project first
      const p = await api.getProject(projectId);
      setProject(p);

      if (p) {
        setFinalLinks({
          live_project_url: p.live_project_url || '',
          source_code_url: p.source_code_url || '',
          bug_report_url: p.bug_report_url || '',
          documentation_url: p.documentation_url || ''
        });

        // Automatically switch to Final Delivery & Approvals tab if project has deliverables pending approval
        if (p.status === 'FINAL_APPROVAL' && !isAdmin) {
          setTab('final_delivery');
        }
      }

      // 2. Fetch sub-resources safely with Promise.allSettled
      const [msRes, upsRes, fsRes, commsRes, mtgsRes, appsRes] = await Promise.allSettled([
        api.getMilestones(projectId),
        api.getUpdates(projectId),
        api.getFiles(projectId),
        api.getComments(projectId),
        api.getMeetings(projectId),
        api.getApprovals(projectId)
      ]);

      setMilestones(msRes.status === 'fulfilled' ? msRes.value || [] : []);
      setUpdates(upsRes.status === 'fulfilled' ? upsRes.value || [] : []);
      setFiles(fsRes.status === 'fulfilled' ? fsRes.value || [] : []);
      setComments(commsRes.status === 'fulfilled' ? commsRes.value || [] : []);
      setMeetings(mtgsRes.status === 'fulfilled' ? mtgsRes.value || [] : []);
      setApprovals(appsRes.status === 'fulfilled' ? appsRes.value || [] : []);
    } catch (err) {
      console.error('Failed to load primary project data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  // Real-time Chat Auto-Polling (Every 3 seconds)
  useEffect(() => {
    if (!projectId) return;
    const interval = setInterval(async () => {
      try {
        const updatedComms = await api.getComments(projectId);
        if (updatedComms) setComments(updatedComms);
      } catch (e) {
        // silent polling catch
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [projectId]);

  const handleDeleteProject = async () => {
    if (!window.confirm(`Are you sure you want to delete project "${project?.title}"? This action cannot be undone.`)) return;
    try {
      await api.deleteProject(projectId);
      alert('Project deleted successfully!');
      setActiveTab(isAdmin ? 'active_projects' : 'my_projects');
    } catch (err) {
      alert('Failed to delete project: ' + err.message);
    }
  };

  const handleAdminApproveProject = async () => {
    try {
      const updated = await api.updateProjectStatus(projectId, 'APPROVED');
      setProject(updated);
      const erpStatus = updated.erp_sync_status === 'SYNCED' ? 'Successfully synced with ERP!' : 'Dispatched to ERP system queue.';
      alert(`Project Approved! Milestones initialized and ${erpStatus}`);
      loadProjectData();
    } catch (err) {
      alert('Failed to approve project: ' + err.message);
    }
  };

  const handleSyncERP = async () => {
    try {
      const updated = await api.syncProjectToERP(projectId);
      setProject(updated);
      const isSynced = updated.erp_sync_status === 'SYNCED';
      alert(isSynced ? 'Project successfully synced with ERP!' : `Project payload dispatched to ERP (Status: ${updated.erp_sync_status}).`);
      loadProjectData();
    } catch (err) {
      alert('Failed to sync to ERP: ' + err.message);
    }
  };

  const handleExportPDF = () => {
    if (!project) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked! Please allow pop-ups to download PDF report.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${project.title} - Workspace Report</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 30px; margin: 0; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #4f46e5; padding-bottom: 15px; margin-bottom: 25px; }
            .logo { font-size: 20px; font-weight: 800; color: #4f46e5; }
            .badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; background: #e0e7ff; color: #3730a3; }
            .badge-completed { background: #dcfce7; color: #15803d; }
            h1 { font-size: 24px; margin: 0 0 10px 0; color: #0f172a; }
            .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; background: #f8fafc; padding: 15px; border-radius: 12px; margin-bottom: 25px; border: 1px solid #e2e8f0; }
            .meta-item { font-size: 12px; }
            .meta-label { color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 10px; }
            .meta-value { font-weight: 800; color: #0f172a; margin-top: 2px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 15px; font-weight: 800; color: #1e1b4b; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background-color: #f1f5f9; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 11px; }
            .link-card { background: #f8fafc; padding: 10px 14px; border-radius: 8px; font-size: 12px; margin-bottom: 8px; border: 1px solid #e2e8f0; word-break: break-all; }
            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">PJSofonic CRM • Executive Workspace Report</div>
            <div class="badge ${project.status === 'COMPLETED' ? 'badge-completed' : ''}">
              Status: ${project.status.replace('_', ' ')}
            </div>
          </div>

          <h1>${project.title} (${project.project_code})</h1>
          <div class="meta-grid">
            <div class="meta-item">
              <div class="meta-label">Client Company</div>
              <div class="meta-value">${project.company_name}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Project Type</div>
              <div class="meta-value">${project.project_type}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Overall Progress</div>
              <div class="meta-value" style="color:#059669;">${project.overall_progress}%</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Target Completion</div>
              <div class="meta-value">${project.expected_end_date}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">🚀 Final Project Deliverables & Links</div>
            <div class="link-card"><strong>Live Demo URL:</strong> ${project.live_project_url || 'Not provided yet'}</div>
            <div class="link-card"><strong>Source Code Link:</strong> ${project.source_code_url || 'Not provided yet'}</div>
            <div class="link-card"><strong>QA Bug Report Link:</strong> ${project.bug_report_url || 'Not provided yet'}</div>
            <div class="link-card"><strong>Documentation Link:</strong> ${project.documentation_url || 'Not provided yet'}</div>
            <div class="link-card"><strong>Customer Final Approval:</strong> ${project.status === 'COMPLETED' || project.customer_approved_at ? '✓ APPROVED & ACCEPTED' : '⏳ Pending Customer Approval'}</div>
          </div>

          <div class="section">
            <div class="section-title">🎯 Timeline & Milestones Breakdown</div>
            <table>
              <thead>
                <tr>
                  <th>Milestone Title</th>
                  <th>Target Date</th>
                  <th>Progress</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${milestones.map(m => `
                  <tr>
                    <td><strong>${m.title}</strong><br/><span style="color:#64748b;font-size:11px;">${m.description || ''}</span></td>
                    <td>${m.target_date || '-'}</td>
                    <td>${m.progress_percentage}%</td>
                    <td><strong>${m.status}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">📁 Project Files Vault</div>
            <table>
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Version</th>
                  <th>Uploaded By</th>
                  <th>Download Link</th>
                </tr>
              </thead>
              <tbody>
                ${files.map(f => `
                  <tr>
                    <td>${f.file_name}</td>
                    <td>${f.version}</td>
                    <td>${f.uploaded_by_name} (${f.uploaded_by_role})</td>
                    <td>${f.file_url}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer">
            Report Generated on ${new Date().toLocaleString()} • Confidential Customer Workspace Report • PJSofonic CRM
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleExportExcel = () => {
    if (!project) return;

    let csvContent = '';
    
    // PROJECT METADATA
    csvContent += 'PROJECT METADATA\n';
    csvContent += `Project Title,"${(project.title || '').replace(/"/g, '""')}"\n`;
    csvContent += `Project Code,"${(project.project_code || '').replace(/"/g, '""')}"\n`;
    csvContent += `Company Name,"${(project.company_name || '').replace(/"/g, '""')}"\n`;
    csvContent += `Project Type,"${(project.project_type || '').replace(/"/g, '""')}"\n`;
    csvContent += `Status,"${(project.status || '').replace(/"/g, '""')}"\n`;
    csvContent += `Overall Progress,"${project.overall_progress}%"\n`;
    csvContent += `Expected End Date,"${(project.expected_end_date || '').replace(/"/g, '""')}"\n\n`;

    // FINAL DELIVERABLES LINKS
    csvContent += 'FINAL DELIVERABLES LINKS\n';
    csvContent += `Live Demo URL,"${(project.live_project_url || 'N/A').replace(/"/g, '""')}"\n`;
    csvContent += `Source Code URL,"${(project.source_code_url || 'N/A').replace(/"/g, '""')}"\n`;
    csvContent += `Bug QA Report URL,"${(project.bug_report_url || 'N/A').replace(/"/g, '""')}"\n`;
    csvContent += `Documentation URL,"${(project.documentation_url || 'N/A').replace(/"/g, '""')}"\n`;
    csvContent += `Customer Approval Status,"${project.status === 'COMPLETED' || project.customer_approved_at ? 'APPROVED' : 'PENDING'}"\n\n`;

    // TIMELINE & MILESTONES
    csvContent += 'TIMELINE & MILESTONES\n';
    csvContent += 'Milestone Title,Target Date,Progress %,Status\n';
    if (milestones && milestones.length > 0) {
      milestones.forEach(m => {
        csvContent += `"${(m.title || '').replace(/"/g, '""')}","${m.target_date || ''}","${m.progress_percentage}%","${m.status || ''}"\n`;
      });
    } else {
      csvContent += 'Requirement Analysis,N/A,100%,COMPLETED\n';
      csvContent += 'UI/UX Design Mockups,N/A,100%,COMPLETED\n';
      csvContent += 'Frontend & API Integration,N/A,80%,IN_PROGRESS\n';
      csvContent += 'Testing & Client Review,N/A,0%,PENDING\n';
      csvContent += 'Final Delivery & Deployment,N/A,0%,PENDING\n';
    }
    csvContent += '\n';

    // FILES VAULT
    csvContent += 'FILES VAULT\n';
    csvContent += 'File Name,Version,Uploaded By,Role,File URL\n';
    if (files && files.length > 0) {
      files.forEach(f => {
        csvContent += `"${(f.file_name || '').replace(/"/g, '""')}","${f.version || ''}","${(f.uploaded_by_name || '').replace(/"/g, '""')}","${f.uploaded_by_role || ''}","${(f.file_url || '').replace(/"/g, '""')}"\n`;
      });
    }

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${project.project_code}_Workspace_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    if (!newMeetingTitle.trim()) return;
    try {
      await api.scheduleMeeting(projectId, {
        title: newMeetingTitle,
        agenda: newMeetingAgenda,
        meeting_time: newMeetingTime || 'Tomorrow 03:00 PM',
        meeting_link: newMeetingLink || 'https://meet.google.com/pjs-crm-meeting'
      });
      setNewMeetingTitle('');
      setNewMeetingAgenda('');
      setNewMeetingTime('');
      setNewMeetingLink('');
      const updated = await api.getMeetings(projectId);
      setMeetings(updated);
      alert('Meeting scheduled for Customer!');
    } catch (err) {
      alert('Failed to schedule meeting: ' + err.message);
    }
  };

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
              {project.erp_sync_status && (
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  project.erp_sync_status === 'SYNCED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  project.erp_sync_status === 'FAILED' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                  'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                }`}>
                  ERP: {project.erp_sync_status}
                </span>
              )}
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

          {/* Action Buttons & Overall Progress Widget */}
          <div className="flex items-center space-x-3 shrink-0">
            {isAdmin && project.status === 'NEW' && (
              <button
                onClick={handleAdminApproveProject}
                className="px-3.5 py-2 text-xs font-extrabold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1.5 shadow-md shadow-emerald-600/30 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>APPROVE REQUEST</span>
              </button>
            )}

            {isAdmin && project.status !== 'NEW' && (
              <button
                onClick={handleSyncERP}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1.5 transition-all cursor-pointer"
                title="Sync project updates with ERP backend system"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sync to ERP</span>
              </button>
            )}

            <button
              onClick={handleExportPDF}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1.5 transition-all cursor-pointer"
              title="Export Workspace PDF Report"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>PDF Report</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5 transition-all cursor-pointer"
              title="Export Workspace Excel/CSV Report"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Excel Report</span>
            </button>

            <button
              onClick={handleDeleteProject}
              className="px-3.5 py-2 text-xs font-extrabold rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 flex items-center space-x-1.5 transition-all"
              title="Delete Project"
            >
              <Trash2 className="w-4 h-4" />
              <span>DELETE PROJECT</span>
            </button>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-right">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overall Completion</div>
              <div className="text-2xl font-black text-emerald-400">{project.overall_progress}%</div>
            </div>
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

      {/* TAB: FINAL DELIVERY & APPROVALS */}
      {tab === 'final_delivery' && (
        <div className="space-y-6">
          {isAdmin ? (
            /* ADMIN PORTAL: DELIVERABLES SUBMISSION FORM & LEFT-SIDE APPROVAL BADGE */
            <div className="glass-panel p-6 rounded-2xl border border-indigo-500/40 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
                <div className="flex items-center space-x-3">
                  {project.status === 'COMPLETED' || project.customer_approved_at ? (
                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-extrabold flex items-center space-x-1.5 shadow-sm shadow-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>✓ Approved by Customer</span>
                    </span>
                  ) : (
                    <span className="px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-extrabold flex items-center space-x-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>⏳ Pending Customer Review</span>
                    </span>
                  )}
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <Rocket className="w-5 h-5 text-amber-400" />
                    <span>Admin Final Deliverables Submission Section</span>
                  </h2>
                </div>
                <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  Admin Exclusive
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Submit/update the 4 final project deliverables (simple text notes, instructions, or links) for customer review and final approval.
              </p>

              <form onSubmit={handleAdminFinalSubmission} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1.5 flex items-center space-x-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Live Project Demo / Deployment Details (Text or URL)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. https://demo.clientapp.com or Staging deployed on port 3000"
                      value={finalLinks.live_project_url}
                      onChange={(e) => setFinalLinks({ ...finalLinks, live_project_url: e.target.value })}
                      className="w-full glass-input p-3 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1.5 flex items-center space-x-1.5">
                      <Code className="w-3.5 h-3.5 text-purple-400" />
                      <span>Source Code / ZIP / Access Notes (Text or URL)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. GitHub repo link or ZIP in shared drive or credentials"
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
                      <span>Bug & Defect Report / QA Notes (Text or URL)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. All test cases passed or Bug Sheet URL"
                      value={finalLinks.bug_report_url}
                      onChange={(e) => setFinalLinks({ ...finalLinks, bug_report_url: e.target.value })}
                      className="w-full glass-input p-3 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1.5 flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>Documentation & Handover Details (Text or URL)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. User manual attached in files or Handover Doc URL"
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
                    <span>Submit Final Deliverables for Customer Approval</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* CUSTOMER PORTAL: UNEDITABLE DELIVERABLES POST CARD WITH SINGLE APPROVAL BUTTON */
            <div className="glass-panel p-8 rounded-3xl border border-indigo-500/30 space-y-6 bg-slate-900/70 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">Final Project Deliverables Post</h2>
                    <p className="text-xs text-slate-400">Review deliverables submitted by Admin and provide final project approval.</p>
                  </div>
                </div>

                {project.status === 'COMPLETED' || project.customer_approved_at ? (
                  <span className="px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-extrabold flex items-center space-x-2 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>✓ Approved by Customer</span>
                  </span>
                ) : (
                  <span className="px-4 py-2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-extrabold flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>⏳ Awaiting Your Approval</span>
                  </span>
                )}
              </div>

              {/* 4 Clickable Uneditable Link Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* 1. Live Project URL / Demo Link */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-slate-300 font-bold">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Live Project / Demo / Deployment Notes</span>
                  </div>
                  {project.live_project_url ? (
                    project.live_project_url.startsWith('http://') || project.live_project_url.startsWith('https://') ? (
                      <a
                        href={project.live_project_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 font-bold block truncate flex items-center justify-between transition-all"
                      >
                        <span className="truncate">{project.live_project_url}</span>
                        <ExternalLink className="w-4 h-4 shrink-0 ml-1" />
                      </a>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 font-medium whitespace-pre-wrap break-words">
                        {project.live_project_url}
                      </div>
                    )
                  ) : (
                    <div className="text-slate-500 italic p-2.5 rounded-xl bg-slate-900/40">Not uploaded yet</div>
                  )}
                </div>

                {/* 2. Source Code / ZIP Drive Link */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-slate-300 font-bold">
                    <Code className="w-4 h-4 text-purple-400" />
                    <span>Source Code / ZIP / Access Notes</span>
                  </div>
                  {project.source_code_url ? (
                    project.source_code_url.startsWith('http://') || project.source_code_url.startsWith('https://') ? (
                      <a
                        href={project.source_code_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 font-bold block truncate flex items-center justify-between transition-all"
                      >
                        <span className="truncate">{project.source_code_url}</span>
                        <ExternalLink className="w-4 h-4 shrink-0 ml-1" />
                      </a>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-purple-200 font-medium whitespace-pre-wrap break-words">
                        {project.source_code_url}
                      </div>
                    )
                  ) : (
                    <div className="text-slate-500 italic p-2.5 rounded-xl bg-slate-900/40">Not uploaded yet</div>
                  )}
                </div>

                {/* 3. Bug & Defect Report Drive Link */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-slate-300 font-bold">
                    <Bug className="w-4 h-4 text-rose-400" />
                    <span>Bug & Defect Report / QA Notes</span>
                  </div>
                  {project.bug_report_url ? (
                    project.bug_report_url.startsWith('http://') || project.bug_report_url.startsWith('https://') ? (
                      <a
                        href={project.bug_report_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 font-bold block truncate flex items-center justify-between transition-all"
                      >
                        <span className="truncate">{project.bug_report_url}</span>
                        <ExternalLink className="w-4 h-4 shrink-0 ml-1" />
                      </a>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-rose-200 font-medium whitespace-pre-wrap break-words">
                        {project.bug_report_url}
                      </div>
                    )
                  ) : (
                    <div className="text-slate-500 italic p-2.5 rounded-xl bg-slate-900/40">Not uploaded yet</div>
                  )}
                </div>

                {/* 4. Documentation & Handover Drive Link */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-slate-300 font-bold">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Documentation & Handover Notes</span>
                  </div>
                  {project.documentation_url ? (
                    project.documentation_url.startsWith('http://') || project.documentation_url.startsWith('https://') ? (
                      <a
                        href={project.documentation_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 font-bold block truncate flex items-center justify-between transition-all"
                      >
                        <span className="truncate">{project.documentation_url}</span>
                        <ExternalLink className="w-4 h-4 shrink-0 ml-1" />
                      </a>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-amber-200 font-medium whitespace-pre-wrap break-words">
                        {project.documentation_url}
                      </div>
                    )
                  ) : (
                    <div className="text-slate-500 italic p-2.5 rounded-xl bg-slate-900/40">Not uploaded yet</div>
                  )}
                </div>
              </div>

              {/* SINGLE APPROVAL BUTTON AT BOTTOM */}
              <div className="pt-4 border-t border-slate-800">
                {project.status === 'COMPLETED' || project.customer_approved_at ? (
                  <div className="w-full py-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-sm text-center flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>✓ PROJECT DELIVERABLE APPROVED & COMPLETED</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCustomerFinalApproval('APPROVE')}
                    className="w-full py-4 text-sm font-extrabold rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white shadow-xl shadow-emerald-500/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>[ ✅ APPROVE PROJECT DELIVERABLE ]</span>
                  </button>
                )}
              </div>
            </div>
          )}
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
          {isAdmin ? (
            <form onSubmit={handleUploadFile} className="glass-panel p-5 rounded-2xl border border-indigo-500/30 space-y-3">
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Upload Deliverable / Document to Vault (Admin Only)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <input
                  type="text"
                  required
                  placeholder="File Name (e.g. Architecture_v1.0.pdf)"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="glass-input p-2.5 rounded-xl"
                />
                <input
                  type="url"
                  placeholder="File/Download Link URL"
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
                <button type="submit" className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500">
                  Upload Deliverable
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>📁 Project Vault Files & Deliverables uploaded by Admin for your review.</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Customer View & Download
              </span>
            </div>
          )}

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

    </div>
  );
}
