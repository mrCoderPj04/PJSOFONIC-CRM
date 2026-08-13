import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ShieldCheck, Clock, User, FileText } from 'lucide-react';

export default function AuditLogsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await api.getAuditLogs();
        setLogs(data || []);
      } catch (err) {
        console.error('Failed to fetch audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) {
    return <div className="text-slate-400 text-sm py-10 text-center">Loading Audit Trail...</div>;
  }

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <span>System Audit Trail & Event Logs</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Immutable audit record of all project submissions, status changes, file uploads, and admin actions.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">User & Role</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Entity</th>
                <th className="py-3 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40">
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-200">{log.user_name}</div>
                    <div className="text-[10px] text-indigo-400 font-semibold">{log.user_role}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-400">{log.entity}</td>
                  <td className="py-3 px-3 text-slate-300">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
