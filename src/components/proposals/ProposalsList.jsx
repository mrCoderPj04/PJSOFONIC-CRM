import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { FileText, Plus, CheckCircle, Clock, AlertCircle, Eye, Download } from 'lucide-react';

export default function ProposalsList() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [proposals, setProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const data = await api.getProposals();
      setProposals(data || []);
      if (data && data.length > 0 && !selectedProposal) {
        setSelectedProposal(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  if (loading) {
    return <div className="text-slate-400 text-sm py-10 text-center">Loading Proposals & Quotations...</div>;
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>Proposals & Quotations Vault</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Formal commercial proposals, pricing breakdowns, and tax invoices.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Proposals List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">All Proposals ({proposals.length})</h2>
          {proposals.map((prop) => (
            <div
              key={prop.id}
              onClick={() => setSelectedProposal(prop)}
              className={`glass-panel p-4 rounded-xl border transition-all cursor-pointer ${
                selectedProposal?.id === prop.id
                  ? 'border-indigo-500 bg-slate-900/90 shadow-md shadow-indigo-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {prop.proposal_code}
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded badge-completed">
                  {prop.status}
                </span>
              </div>

              <h3 className="font-bold text-slate-100 text-xs mt-2">{prop.title}</h3>
              <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2">
                <span className="text-[11px] text-slate-400">Total Amount:</span>
                <span className="text-xs font-extrabold text-emerald-400">
                  ₹{prop.total_amount?.toLocaleString('en-IN') || 0}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Styled Proposal Preview Document */}
        <div className="lg:col-span-2">
          {selectedProposal ? (
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6 bg-slate-900/95">
              {/* Document Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-6">
                <div>
                  <div className="text-lg font-black tracking-tight text-white flex items-center space-x-2">
                    <span>PJSOFONIC ENTERPRISE PROPOSAL</span>
                  </div>
                  <div className="text-xs text-indigo-400 font-semibold mt-0.5">
                    Proposal Code: {selectedProposal.proposal_code}
                  </div>
                </div>

                <div className="text-right text-xs text-slate-400">
                  <div>Issued Date: <strong className="text-slate-200">{new Date(selectedProposal.created_at).toLocaleDateString()}</strong></div>
                  <div>Validity: <strong className="text-slate-200">{selectedProposal.valid_until}</strong></div>
                </div>
              </div>

              {/* Title & Terms */}
              <div>
                <h2 className="text-base font-bold text-slate-100">{selectedProposal.title}</h2>
                <p className="text-xs text-slate-400 mt-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <strong className="text-slate-300">Payment Terms:</strong> {selectedProposal.terms}
                </p>
              </div>

              {/* Line Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="py-2.5 px-3">Service Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                      <th className="py-2.5 px-3 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {selectedProposal.items_json?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-3 px-3 font-medium">{item.description}</td>
                        <td className="py-3 px-3 text-center">{item.qty}</td>
                        <td className="py-3 px-3 text-right">₹{item.rate?.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3 text-right font-bold text-slate-100">₹{item.total?.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals Calculation */}
              <div className="border-t border-slate-800 pt-4 flex justify-end">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal Amount:</span>
                    <span className="font-bold text-slate-200">₹{selectedProposal.amount?.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>GST ({selectedProposal.tax_percent}%):</span>
                    <span className="font-bold text-slate-200">₹{((selectedProposal.amount * selectedProposal.tax_percent) / 100).toLocaleString('en-IN')}</span>
                  </div>

                  {selectedProposal.discount_amount > 0 && (
                    <div className="flex justify-between text-rose-400">
                      <span>Discount:</span>
                      <span className="font-bold">-₹{selectedProposal.discount_amount?.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-extrabold text-emerald-400 border-t border-slate-800 pt-2">
                    <span>Grand Total:</span>
                    <span>₹{selectedProposal.total_amount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-10 text-center rounded-2xl border border-slate-800 text-slate-400 text-sm">
              Select a proposal from the left list to view commercial breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
