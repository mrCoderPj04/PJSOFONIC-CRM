import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, setAuthToken, setCurrentUserStorage } from '../../services/api';
import { ShieldCheck, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { setUser } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api.emsLogin(loginId, password);
      setAuthToken(data.access_token);
      setCurrentUserStorage(data.user);
      setUser(data.user);
    } catch (err) {
      setError(err.message || 'EMS Authentication Failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Glow Highlights */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10 space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <div className="inline-block p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-inner">
            <img
              src="/pjsofonic_crm.png"
              alt="PJSOFONIC CRM Logo"
              className="w-16 h-16 object-contain mx-auto"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center space-x-2">
              <span>PJSOFONIC</span>
              <span className="text-indigo-400">CRM</span>
            </h1>
            <div className="flex items-center justify-center space-x-1.5 text-xs text-emerald-400 font-semibold mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>EMS Identity & Access Management</span>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 text-center leading-relaxed">
          Sign in using your <strong className="text-slate-200">PJSOFONIC EMS</strong> (<code className="text-[11px] text-indigo-300">erp-backend-1-02lc.onrender.com</code>) credentials. Access is restricted strictly to users with <span className="text-indigo-300 font-bold">Department = Admin</span> or <span className="text-emerald-300 font-bold">Department = Customer</span>.
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1.5 flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>EMS Login ID / Email</span>
            </label>
            <input
              type="text"
              required
              placeholder="Enter your EMS Email or Employee ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full glass-input p-3.5 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1.5 flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>EMS Password</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full glass-input p-3.5 rounded-xl text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-xs font-extrabold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 text-white shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating with EMS Backend...</span>
            ) : (
              <>
                <span>Sign In to CRM Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
