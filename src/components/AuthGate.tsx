import React from 'react';
import {
  ShieldCheck,
  Lock,
  Sparkles,
  KeyRound,
  FileCheck2,
  PieChart,
  Download,
  Landmark,
  ArrowRight,
  Globe2,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { DEMO_CITIZEN_PROFILES } from '../utils/authService';
import { CitizenUser } from '../types';

interface AuthGateProps {
  targetFeatureName: string; // e.g. "My Filings Dashboard" | "Tax Filing & Budget Allocation" | "Verified PDF Reports"
  onOpenLoginModal: () => void;
  onSelectDemoUser: (user: CitizenUser) => void;
  onGoToGlobalDashboard: () => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  targetFeatureName,
  onOpenLoginModal,
  onSelectDemoUser,
  onGoToGlobalDashboard,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8" id="auth-gate-container">
      {/* Main Lock Card */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/10">
          <Lock className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>DPDP Act 2023 Compliant Citizen Access</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white mb-3">
          Authentication Required to Access {targetFeatureName}
        </h1>

        <p className="text-sm text-[#94A3B8] max-w-xl mx-auto leading-relaxed mb-6">
          Your personal tax allocation surveys and cryptographic PDF certificates are private. Sign in with your registered email and OTP or try an instant test profile.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            id="auth-gate-login-btn"
            type="button"
            onClick={onOpenLoginModal}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition active:scale-95 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Citizen Sign In / Register</span>
          </button>

          <button
            id="auth-gate-global-dash-btn"
            type="button"
            onClick={onGoToGlobalDashboard}
            className="flex items-center gap-2 bg-[#1E293B] hover:bg-[#334155] text-[#E2E8F0] px-5 py-3 rounded-xl text-sm font-semibold border border-[#334155] transition active:scale-95 cursor-pointer"
          >
            <Globe2 className="w-4 h-4 text-emerald-400" />
            <span>Explore Public Consensus Ledger</span>
          </button>
        </div>
      </div>

      {/* Instant 1-Click Demo Profiles */}
      <div className="bg-[#0A0B0D] border border-[#1E293B] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Quick Test: Select a Sample Citizen Taxpayer Profile
            </span>
          </div>
          <span className="text-[11px] text-[#94A3B8]">Instant 1-Click Preview</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DEMO_CITIZEN_PROFILES.slice(0, 3).map((prof) => (
            <button
              key={prof.id}
              type="button"
              onClick={() => onSelectDemoUser(prof)}
              className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B] hover:border-emerald-500/50 hover:bg-[#131E32] transition text-left space-y-2 cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                  {prof.fullName}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Verified
                </span>
              </div>
              <div className="text-[11px] text-[#94A3B8] line-clamp-1">{prof.profession}</div>
              <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1 border-t border-[#1E293B]">
                <span>{prof.city}</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {prof.filingCount || 1} Filing{prof.filingCount !== 1 ? 's' : ''} →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
