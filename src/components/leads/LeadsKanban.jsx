import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Kanban, Plus, DollarSign, User, Building, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

export default function LeadsKanban() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    source: 'Website Request',
    budget: 500000,
    priority: 'MEDIUM',
    service_interested: 'Custom Enterprise Web Platform',
    notes: ''
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await api.getLeads();
      setLeads(data || []);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStageChange = async (leadId, newStage) => {
    try {
      await api.updateLeadStage(leadId, newStage);
      fetchLeads();
    } catch (err) {
      alert('Failed to update stage: ' + err.message);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      await api.createLead(formData);
      setShowModal(false);
      fetchLeads();
    } catch (err) {
      alert('Failed to create lead: ' + err.message);
    }
  };

  const stages = [
    { id: 'NEW', title: 'New Leads', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
    { id: 'QUALIFIED', title: 'Qualified', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
    { id: 'PROPOSAL', title: 'Proposal Sent', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' },
    { id: 'NEGOTIATION', title: 'Negotiation', color: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10' },
    { id: 'WON', title: 'Won Deals', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
    { id: 'LOST', title: 'Closed / Lost', color: 'border-rose-500/40 text-rose-400 bg-rose-500/10' }
  ];

  if (loading) {
    return <div className="text-slate-400 text-sm py-10 text-center">Loading Sales Pipeline Kanban...</div>;
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Kanban className="w-5 h-5 text-indigo-400" />
            <span>Sales Pipeline Kanban</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage incoming sales inquiries, qualified leads, proposals, and won contracts.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 flex items-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageLeads = leads.filter(l => l.stage === stage.id);

          return (
            <div key={stage.id} className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex flex-col min-h-[500px]">
              {/* Column Header */}
              <div className={`p-2.5 rounded-xl border mb-3 flex items-center justify-between ${stage.color}`}>
                <span className="font-bold text-xs uppercase tracking-wider">{stage.title}</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-900/80">
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {stageLeads.length === 0 ? (
                  <div className="text-[11px] text-slate-600 text-center py-8">Empty Stage</div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="glass-card p-3.5 rounded-xl border border-slate-800 space-y-2.5 hover:border-slate-700 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{lead.company}</span>
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {lead.priority}
                        </span>
                      </div>

                      <div className="text-slate-400 leading-snug">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3 text-slate-500" />
                          <span>{lead.name}</span>
                        </div>
                        <div className="text-[11px] text-indigo-300 font-semibold mt-1">
                          {lead.service_interested}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-300 pt-2 border-t border-slate-800">
                        <span className="text-emerald-400 font-extrabold">
                          ₹{lead.budget?.toLocaleString('en-IN') || 0}
                        </span>

                        {/* Move Stage Quick Action */}
                        <select
                          value={lead.stage}
                          onChange={(e) => handleStageChange(lead.id, e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-[10px] text-slate-300 rounded px-1.5 py-0.5 outline-none cursor-pointer"
                        >
                          <option value="NEW">New</option>
                          <option value="QUALIFIED">Qualified</option>
                          <option value="PROPOSAL">Proposal</option>
                          <option value="NEGOTIATION">Negotiate</option>
                          <option value="WON">Won</option>
                          <option value="LOST">Lost</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 w-full max-w-lg space-y-4">
            <h2 className="text-base font-bold text-white">Add New Lead to Sales Pipeline</h2>
            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Contact Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full glass-input p-2.5 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Company / Organization</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full glass-input p-2.5 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full glass-input p-2.5 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Budget (₹)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                    className="w-full glass-input p-2.5 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Service Interested</label>
                <input
                  type="text"
                  value={formData.service_interested}
                  onChange={(e) => setFormData({ ...formData, service_interested: e.target.value })}
                  className="w-full glass-input p-2.5 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 font-bold"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
