import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Briefcase, Calendar, FileText, CheckCircle, XCircle, ChevronRight, AlertCircle, Building, User } from 'lucide-react';

export default function AdminProjectRequests() {
  const { setActiveTab, setSelectedProjectId } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'NEW', 'ACTIVE'
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getProjects();
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to fetch project requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await api.updateProjectStatus(id, 'APPROVED');
      const erpStatus = res.erp_sync_status === 'SYNCED' ? 'Successfully synced with ERP!' : 'Dispatched to ERP queue.';
      alert(`Project Approved! Milestones initialized and ${erpStatus}`);
      fetchRequests();
    } catch (err) {
      alert('Failed to approve project: ' + err.message);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason for customer:');
    if (!reason) return;

    try {
      await api.updateProjectStatus(id, 'REJECTED', reason);
      alert('Project Rejected.');
      fetchRequests();
    } catch (err) {
      alert('Failed to reject project: ' + err.message);
    }
  };

  const openProjectDetail = (id) => {
    setSelectedProjectId(id);
    setActiveTab('project_detail');
  };

  const filteredRequests = requests.filter(r => {
    if (filter === 'NEW') return r.status === 'NEW';
    if (filter === 'ACTIVE') return r.status !== 'NEW' && r.status !== 'REJECTED';
    return true;
  });

  if (loading) {
    return <div className="text-slate-400 text-sm py-10 text-center">Loading Incoming Request Posts...</div>;
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <span>Customer Project Requests Queue (Post View)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            All customer project submissions remain permanently visible in this queue before and after approval.
          </p>
        </div>

        {/* Filter Toggle Buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs flex-wrap gap-y-1">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${filter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            All ({requests.length})
          </button>
          <button
            onClick={() => setFilter('NEW')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${filter === 'NEW' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Pending Review ({requests.filter(r => r.status === 'NEW' || r.status === 'UNDER_REVIEW').length})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${filter === 'ACTIVE' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Active Execution ({requests.filter(r => r.status !== 'NEW' && r.status !== 'REJECTED' && r.status !== 'COMPLETED').length})
          </button>
          <button
            onClick={() => setFilter('FINAL_APPROVAL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${filter === 'FINAL_APPROVAL' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Awaiting Approval ({requests.filter(r => r.status === 'FINAL_APPROVAL').length})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${filter === 'COMPLETED' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Completed ({requests.filter(r => r.status === 'COMPLETED').length})
          </button>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="glass-panel p-10 text-center rounded-2xl border border-slate-800 text-slate-400 text-sm">
          No project requests found for this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="glass-panel p-6 rounded-2xl border border-indigo-500/30 hover:border-indigo-500/60 transition-all flex flex-col justify-between space-y-4 relative group"
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border tracking-wider ${
                  req.status === 'NEW' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                  req.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  req.status === 'COMPLETED' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                  'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}>
                  {req.status === 'NEW' ? '🆕 NEW REQUEST' : req.status.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                  {req.priority}
                </span>
              </div>

              {/* Company & Title */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-400 flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{req.company_name}</span>
                </div>
                <h2 className="text-base font-extrabold text-white leading-snug">{req.title}</h2>
                <p className="text-xs text-slate-400 line-clamp-2 mt-2">{req.overview}</p>
              </div>

              {/* Specs Details */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <strong className="text-slate-200">{req.project_type}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Expected Start:</span>
                  <strong className="text-slate-200">{req.expected_start_date}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Expected Completion:</span>
                  <strong className="text-slate-200">{req.expected_end_date}</strong>
                </div>
              </div>

              {/* Admin Actions Row */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => openProjectDetail(req.id)}
                  className="w-full py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/20 transition-all"
                >
                  <span>[ VIEW FULL PROJECT POST ]</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleApprove(req.id)}
                    className="py-2 text-xs font-bold rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 flex items-center justify-center space-x-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>APPROVE</span>
                  </button>

                  <button
                    onClick={() => handleReject(req.id)}
                    className="py-2 text-xs font-bold rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 flex items-center justify-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>REJECT</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
