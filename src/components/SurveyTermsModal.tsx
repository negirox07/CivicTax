import React from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Cookie,
  AlertTriangle,
  FileText,
  BadgeCheck,
  CheckCircle2,
  Landmark,
  Scale,
  ExternalLink,
} from 'lucide-react';
import { SURVEY_CONSENT_COOKIE_NAME, SURVEY_CONSENT_VERSION, CONSENT_EXPIRY_DAYS } from '../utils/cookieConsent';

interface SurveyTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptAndSaveCookie?: () => void;
  hasAccepted?: boolean;
}

export const SurveyTermsModal: React.FC<SurveyTermsModalProps> = ({
  isOpen,
  onClose,
  onAcceptAndSaveCookie,
  hasAccepted = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-[#0A0B0D] text-[#E2E8F0] border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm font-serif">
              Civic Survey Terms of Participation & Cookie Policy
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#CBD5E1] leading-relaxed">
          {/* Main Declaration Banner */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Survey & Academic Research Purpose Only</span>
            </div>
            <p className="text-slate-300">
              CivicTax is an independent open-source civic opinion survey platform designed to model citizen participatory budgeting.
              <strong> All responses and tax allocations are strictly for survey, educational, and public opinion modeling purposes.</strong>
            </p>
          </div>

          {/* Core Non-Government Disclaimer */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 text-amber-200">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block text-white text-xs">Zero Government or Commercial Use Disclaimer:</span>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                This platform is <strong>NOT affiliated with, endorsed by, or integrated with the Income Tax Department of India, Ministry of Finance, CBDT, or any government agency.</strong> Data submitted here will NEVER be used for statutory tax audits, government revenue enforcement, personal credit assessments, or commercial marketing.
              </p>
            </div>
          </div>

          {/* 5-Point DPDP 2025 Statutory Pre-Collection Notice */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-white text-sm font-serif flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>1. Statutory Pre-Collection Privacy Notice (DPDP Rules 2025)</span>
            </h3>

            <div className="space-y-2.5">
              <div className="bg-[#0A0B0D] p-3 rounded-xl border border-[#1E293B] space-y-1">
                <span className="font-bold text-emerald-400 text-[11px] block">🔹 What We Collect:</span>
                <p className="text-[#94A3B8] text-[11px]">
                  State, city, pincode, age range, profession, estimated annual income, optional tax contribution estimate, sector allocation percentages, and contact email/phone for survey receipts. <strong className="text-white">We NEVER collect PAN or Aadhaar card numbers.</strong>
                </p>
              </div>

              <div className="bg-[#0A0B0D] p-3 rounded-xl border border-[#1E293B] space-y-1">
                <span className="font-bold text-emerald-400 text-[11px] block">🔹 Why We Collect It:</span>
                <p className="text-[#94A3B8] text-[11px]">
                  This information is used strictly to estimate civic-tax allocation scenarios, generate personalized civic impact reports, and benchmark regional demographic policy consensus.
                </p>
              </div>

              <div className="bg-[#0A0B0D] p-3 rounded-xl border border-[#1E293B] space-y-1">
                <span className="font-bold text-emerald-400 text-[11px] block">🔹 Whether & How We Store It:</span>
                <p className="text-[#94A3B8] text-[11px]">
                  Guest surveys are kept solely in your temporary local browser cache. For registered users, data is saved in encrypted cloud storage protected by PostgreSQL Row-Level Security for multi-year tracking.
                </p>
              </div>

              <div className="bg-[#0A0B0D] p-3 rounded-xl border border-[#1E293B] space-y-1">
                <span className="font-bold text-emerald-400 text-[11px] block">🔹 Who Receives It:</span>
                <p className="text-[#94A3B8] text-[11px]">
                  <strong className="text-white">We do NOT sell or share your personal information with commercial advertisers or government tax enforcement agencies.</strong> Only anonymized, aggregated percentage distributions appear on public dashboards.
                </p>
              </div>

              <div className="bg-[#0A0B0D] p-3 rounded-xl border border-[#1E293B] space-y-1">
                <span className="font-bold text-emerald-400 text-[11px] block">🔹 How Long We Keep It:</span>
                <p className="text-[#94A3B8] text-[11px]">
                  Account information is retained while your survey profile is active and deleted immediately upon your one-click erasure request under Section 12 of the DPDP Act 2023, or within 30 days of account deletion.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-[#1E293B]">
            <h3 className="font-bold text-white text-sm font-serif flex items-center gap-2">
              <Cookie className="w-4 h-4 text-emerald-400" />
              <span>2. Cookie Storage Terms & Consent</span>
            </h3>
            <p className="text-[#94A3B8]">
              When you agree to these terms, we store an essential preference cookie in your browser:
            </p>
            <div className="bg-[#0A0B0D] border border-[#1E293B] rounded-xl p-3.5 space-y-2 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Cookie Key:</span>
                <span className="text-emerald-400 font-bold">{SURVEY_CONSENT_COOKIE_NAME}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Expiration:</span>
                <span className="text-white">{CONSENT_EXPIRY_DAYS} Days (1 Year)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Security:</span>
                <span className="text-white">SameSite=Lax, Path=/</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Notice Version:</span>
                <span className="text-emerald-400">{SURVEY_CONSENT_VERSION}</span>
              </div>
              <div className="pt-1 border-t border-[#1E293B] text-[10px] text-[#64748B] font-sans">
                Purpose: Remembers your informed consent that this platform is strictly for civic survey purposes, so you don't receive intrusive popups on subsequent visits.
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#1E293B]">
            <h3 className="font-bold text-white text-sm font-serif">3. Right of Revocation & Erasure</h3>
            <p className="text-[#94A3B8]">
              You may revoke your consent or reset your stored cookie at any time via the Privacy Policy tab or by clearing browser cookies.
            </p>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="px-6 py-4 bg-[#0A0B0D] border-t border-[#1E293B] flex items-center justify-between flex-wrap gap-3">
          <span className="text-[11px] text-[#94A3B8] flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>DPDP Statutory Notice {SURVEY_CONSENT_VERSION}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-[#94A3B8] hover:text-white px-4 py-2 text-xs font-medium cursor-pointer"
            >
              Close
            </button>
            {onAcceptAndSaveCookie && !hasAccepted && (
              <button
                onClick={() => {
                  onAcceptAndSaveCookie();
                  onClose();
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-emerald-500/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Cookie className="w-3.5 h-3.5" />
                <span>Agree & Save in Cookies</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
