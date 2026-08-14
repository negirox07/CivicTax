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
import { maskPAN } from '../utils/formatters';

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

        <div className="inline-flex items-center gap-1.5 bg-[#1E293B] text-slate-300 text-xs font-semibold px-3 py-1 rounded-full border border-[#334155] mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Citizen Authentication Required</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white mb-3">
          Sign In to Access {targetFeatureName}
        </h2>

        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl mx-auto leading-relaxed mb-8">
          Personal tax returns, multi-year historical ledgers, and official verifiable impact certificates are private to your citizen profile. The <strong>Global Public Dashboard</strong> remains accessible to everyone.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <button
            id="auth-gate-login-btn"
            type="button"
            onClick={onOpenLoginModal}
            className="w-full sm:w-auto flex-1 py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Sign In / Create Citizen Account</span>
          </button>

          <button
            id="auth-gate-global-dashboard-btn"
            type="button"
            onClick={onGoToGlobalDashboard}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-[#E2E8F0] font-semibold text-xs border border-[#334155] transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Globe2 className="w-4 h-4 text-emerald-400" />
            <span>View Public Dashboard</span>
          </button>
        </div>
      </div>

      {/* 1-Click Quick Demo Profile Selector */}
      <div className="bg-[#0A0B0D] border border-[#1E293B] rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Instant Evaluation: 1-Click Taxpayer Logins</span>
          </div>
          <span className="text-[11px] text-[#64748B]">Click any profile to test personal records</span>
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
                <span className="text-[10px] font-mono text-[#94A3B8] bg-[#0A0B0D] px-1.5 py-0.5 rounded border border-[#1E293B]">
                  {maskPAN(prof.panNumber)}
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
