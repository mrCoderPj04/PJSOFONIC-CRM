import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Kanban,
  FileText,
  Briefcase,
  PlusCircle,
  Clock,
  Users,
  BarChart3,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar() {
  const { user, activeTab, setActiveTab, setSelectedProjectId } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    if (tab !== 'project_detail') {
      setSelectedProjectId(null);
    }
  };

  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads & Pipeline', icon: Kanban, badge: 'Kanban' },
    { id: 'proposals', label: 'Proposals & Quotes', icon: FileText },
    { id: 'project_requests', label: 'Project Requests', icon: Briefcase },
    { id: 'active_projects', label: 'Active Projects', icon: Clock },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'audit_logs', label: 'Audit Trail', icon: ShieldCheck },
  ];

  const customerNav = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'my_projects', label: 'My Projects', icon: Briefcase },
    { id: 'new_request', label: 'New Project Request', icon: PlusCircle, highlight: true },
    { id: 'proposals', label: 'My Proposals', icon: FileText },
  ];

  const navItems = isAdmin ? adminNav : customerNav;

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/90 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] p-4 select-none">
      <div className="space-y-6">
        {/* Navigation Group Title */}
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 px-3 mb-3">
            {isAdmin ? 'Admin Core Modules' : 'Customer Portal'}
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                    item.highlight
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:brightness-110 font-bold'
                      : isActive
                      ? 'bg-slate-800/90 text-indigo-400 border border-slate-700/80 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${item.highlight ? 'text-white' : isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* EMS System Footprint */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center space-x-3">
        <img
          src="/pjsofonic_crm.png"
          alt="PJSOFONIC Logo"
          className="w-7 h-7 object-contain opacity-80"
        />
        <div className="overflow-hidden">
          <div className="flex items-center space-x-1 font-bold text-slate-300 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>EMS Live Connected</span>
          </div>
          <p className="text-[10px] text-slate-500 truncate">
            ID: <strong className="text-slate-400">{user?.ems_user_id}</strong>
          </p>
        </div>
      </div>
    </aside>
  );
}
