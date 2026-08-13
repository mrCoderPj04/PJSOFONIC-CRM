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
  AlertCircle
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user, setActiveTab, setSelectedProjectId } = useAuth();
  const [projects, setProjects] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomerData = async () => {
      setLoading(true);
      try {
        const [kpiData, projectList] = await Promise.all([
          api.getKPIs(),
          api.getProjects()
        ]);
        setKpis(kpiData);
        setProjects(projectList || []);
      } catch (err) {
        console.error('Failed to load customer dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCustomerData();
  }, [user]);

  const openProjectDetail = (id) => {
    setSelectedProjectId(id);
    setActiveTab('project_detail');
  };

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
          className="px-5 py-3 text-xs font-extrabold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white shadow-lg shadow-emerald-500/25 flex items-center space-x-2 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Project Request</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>My Projects</span>
            <Briefcase className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{kpis?.my_projects || 0}</div>
          <div className="mt-1 text-[11px] text-slate-400">Submitted Projects</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>In Execution</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{kpis?.active_projects || 0}</div>
          <div className="mt-1 text-[11px] text-indigo-400">Active Development</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{kpis?.completed_projects || 0}</div>
          <div className="mt-1 text-[11px] text-purple-400">Delivered & Approved</div>
        </div>
      </div>

      {/* Active Projects List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-200 flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>My Project Status & Progress</span>
          </h2>
        </div>

        {projects.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No project requests submitted yet.</p>
            <button
              onClick={() => setActiveTab('new_request')}
              className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white"
            >
              Submit First Project Request
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {proj.project_code}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    proj.status === 'NEW' ? 'badge-new' :
                    proj.status === 'IN_DEVELOPMENT' ? 'badge-dev' : 'badge-review'
                  }`}>
                    {proj.status.replace('_', ' ')}
                  </span>
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
                    className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 flex items-center space-x-1 transition-all"
                  >
                    <span>View Portal</span>
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
