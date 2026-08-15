import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  Info,
  ChevronDown,
  ChevronUp,
  Database,
  Trash2,
  Users,
  Clock,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileCheck2,
} from 'lucide-react';

interface PreCollectionPrivacyNoticeProps {
  compact?: boolean;
  className?: string;
  defaultExpanded?: boolean;
  onOpenFullPolicy?: () => void;
}

export const PreCollectionPrivacyNotice: React.FC<PreCollectionPrivacyNoticeProps> = ({
  compact = false,
  className = '',
  defaultExpanded = false,
  onOpenFullPolicy,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  return (
    <div
      id="pre-collection-privacy-notice"
      className={`bg-[#0A0B0D] border-2 border-emerald-500/40 rounded-2xl p-5 shadow-lg space-y-4 ${className}`}
    >
      {/* Header Banner */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold font-serif text-white">
                Statutory Privacy Notice (DPDP Act 2023 & Rules 2025)
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                Notice Before Collection
              </span>
              <span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                Independent Fiduciary (Non-Gov)
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">
              Itemized disclosure by CivicTax (Independent Civic Platform, not affiliated with the Government of India or Income Tax Department).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 bg-[#1E293B] hover:bg-[#334155] px-2.5 py-1 rounded-lg border border-[#334155] transition cursor-pointer shrink-0"
        >
          <span>{isExpanded ? 'Collapse Notice' : 'View Itemized Notice'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 5-Pillar Core Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
        {/* Pillar 1: What We Collect */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
            <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>1. What We Collect</span>
          </div>
          <p className="text-[#94A3B8] text-[11px] leading-relaxed">
            Name, email, state, city, age range, annual income, estimated tax paid, and sector allocations. <strong className="text-white">Zero PAN/Aadhaar.</strong>
          </p>
        </div>

        {/* Pillar 2: Why We Collect It */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
            <Scale className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>2. Why We Collect</span>
          </div>
          <p className="text-[#94A3B8] text-[11px] leading-relaxed">
            To model civic tax allocation scenarios, generate personalized impact receipts, and benchmark national citizen consensus.
          </p>
        </div>

        {/* Pillar 3: Whether We Store It */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
            <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>3. How We Store It</span>
          </div>
          <p className="text-[#94A3B8] text-[11px] leading-relaxed">
            Guest surveys are stored solely in your local browser. Registered accounts sync with encrypted Supabase DB (Row-Level Security).
          </p>
        </div>

        {/* Pillar 4: Who Receives It */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
            <Share2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>4. Who Receives It</span>
          </div>
          <p className="text-[#94A3B8] text-[11px] leading-relaxed">
            <strong className="text-white">No advertisers or tax authorities.</strong> Only anonymized, aggregated percentages appear on public dashboards.
          </p>
        </div>

        {/* Pillar 5: Retention */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
            <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>5. How Long We Keep</span>
          </div>
          <p className="text-[#94A3B8] text-[11px] leading-relaxed">
            Retained while your account is active. Deleted immediately upon one-click erasure or within 30 days of account deletion.
          </p>
        </div>
      </div>

      {/* Expandable Itemized Data & Purpose Matrix (DPDP Rules 2025 Mandate) */}
      {isExpanded && (
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4 space-y-4 animate-fadeIn text-xs">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2 flex-wrap gap-2">
            <h4 className="font-bold text-white font-serif flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>Itemized Personal Data Description & Purpose Matrix</span>
            </h4>
            <span className="text-[11px] text-[#64748B] font-mono">Rule 3(1) DPDP Rules 2025</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-[#1E293B] text-[#CBD5E1] bg-[#131E32]">
                  <th className="py-2.5 px-3 font-bold">Personal Data Item</th>
                  <th className="py-2.5 px-3 font-bold">Nature</th>
                  <th className="py-2.5 px-3 font-bold">Specific Purpose for Processing</th>
                  <th className="py-2.5 px-3 font-bold">Storage Location</th>
                  <th className="py-2.5 px-3 font-bold">Retention Schedule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B] text-[#94A3B8]">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">Full Name & Contact Email</td>
                  <td className="py-2.5 px-3 text-emerald-400">Essential</td>
                  <td className="py-2.5 px-3">Issuing verifiable participation certificates and survey receipt authentication.</td>
                  <td className="py-2.5 px-3 font-mono">Encrypted Cloud DB / Browser Cache</td>
                  <td className="py-2.5 px-3">Until user account deletion or erasure request.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">State, City & Pincode</td>
                  <td className="py-2.5 px-3 text-emerald-400">Essential</td>
                  <td className="py-2.5 px-3">Regional municipal aggregation and state-wise public consensus modeling.</td>
                  <td className="py-2.5 px-3 font-mono">Encrypted Cloud DB / Browser Cache</td>
                  <td className="py-2.5 px-3">Until account deletion or anonymization.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">Age & Profession</td>
                  <td className="py-2.5 px-3 text-[#64748B]">Demographic</td>
                  <td className="py-2.5 px-3">Demographic correlation of civic priorities (e.g., student vs. healthcare worker allocations).</td>
                  <td className="py-2.5 px-3 font-mono">Encrypted Cloud DB / Browser Cache</td>
                  <td className="py-2.5 px-3">Active account duration.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">Income Range & Tax Paid Amount</td>
                  <td className="py-2.5 px-3 text-emerald-400">Essential (Survey)</td>
                  <td className="py-2.5 px-3">Estimating rupee-value civic contributions across 8 public sectors (Roads, Healthcare, Education, etc.).</td>
                  <td className="py-2.5 px-3 font-mono">Encrypted Cloud DB / Local Session</td>
                  <td className="py-2.5 px-3">Active account duration; deleted on request.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">Sector Allocation % & Proposal</td>
                  <td className="py-2.5 px-3 text-emerald-400">Core Preference</td>
                  <td className="py-2.5 px-3">Calculating national citizen consensus ratios and powering AI policy impact simulations.</td>
                  <td className="py-2.5 px-3 font-mono">Encrypted DB (Aggregated Anonymously)</td>
                  <td className="py-2.5 px-3">Aggregated consensus retained indefinitely in anonymized form.</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-white">Cookie Consent Preference</td>
                  <td className="py-2.5 px-3 text-[#64748B]">Technical</td>
                  <td className="py-2.5 px-3">Remembers your agreement to survey terms and prevents redundant popups.</td>
                  <td className="py-2.5 px-3 font-mono">Browser Cookie (civic_survey_consent_accepted)</td>
                  <td className="py-2.5 px-3">365 Days (1 Year) or until cleared.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-[#0A0B0D] p-3 rounded-xl border border-[#1E293B] flex items-center justify-between text-[11px] flex-wrap gap-2">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Zero PAN/Aadhaar Guarantee:</strong> Under no circumstances do we request, process, or store national tax identification numbers.
              </span>
            </div>
            {onOpenFullPolicy && (
              <button
                type="button"
                onClick={onOpenFullPolicy}
                className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 cursor-pointer"
              >
                Read Comprehensive Privacy Policy →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
