import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  FileCheck2,
  Database,
  UserCheck,
  Mail,
  AlertTriangle,
  Landmark,
  Scale,
  Sparkles,
  Layers,
  BadgeCheck,
  CheckCircle2,
  Cookie,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import {
  getSurveyCookieConsent,
  saveSurveyCookieConsent,
  revokeSurveyCookieConsent,
  SurveyCookieConsent,
  SURVEY_CONSENT_COOKIE_NAME,
  SURVEY_CONSENT_VERSION,
  CONSENT_EXPIRY_DAYS,
} from '../utils/cookieConsent';
import { PreCollectionPrivacyNotice } from './PreCollectionPrivacyNotice';

interface PrivacyPolicyViewProps {
  onGoToGlobalDashboard: () => void;
  onStartFiling: () => void;
  onGoToComplianceCenter?: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({
  onGoToGlobalDashboard,
  onStartFiling,
  onGoToComplianceCenter,
}) => {
  const contactEmail = 'mukeshsingh.negi07@gmail.com';
  const effectiveDate = 'November 2025 / August 2026';

  const [cookieConsent, setCookieConsent] = useState<SurveyCookieConsent | null>(() => getSurveyCookieConsent());
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      setCookieConsent(e.detail as SurveyCookieConsent | null);
    };
    window.addEventListener('civic_survey_consent_updated', handleUpdate);
    return () => window.removeEventListener('civic_survey_consent_updated', handleUpdate);
  }, []);

  const handleGrantConsent = () => {
    const saved = saveSurveyCookieConsent({
      surveyOnlyAffirmed: true,
      cookieStorageAgreed: true,
      version: SURVEY_CONSENT_VERSION,
    });
    setCookieConsent(saved);
    setFeedbackMsg('✓ Survey consent and cookie preferences saved successfully in browser cookies (Valid for 1 year).');
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleRevokeConsent = () => {
    revokeSurveyCookieConsent();
    setCookieConsent(null);
    setFeedbackMsg('✓ Survey consent revoked and cookies deleted from this browser.');
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="privacy-policy-root">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#131E32] to-[#0A0B0D] border border-[#1E293B] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-1.5 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>India DPDP Act, 2023 & DPDP Rules, 2025 Compliant Policy</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white tracking-tight">
          Privacy Policy & DPDP Statutory Notice
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-[#94A3B8]">
          <span>MeitY Framework: <strong className="text-white">DPDP Act 2023 / Rules 2025</strong></span>
          <span>•</span>
          <span>Notice Version: <strong className="text-emerald-400 font-mono">DPDP-ACT-2023-RULES-2025-v1.0</strong></span>
          <span>•</span>
          <span>Classification: <strong className="text-white">Independent Civic Survey Platform</strong></span>
        </div>

        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed pt-1">
          This platform is an independent civic opinion survey platform designed to model participatory public budgeting. We are <strong>not a government entity</strong>. In full compliance with India's <strong>Digital Personal Data Protection Act (DPDP Act), 2023</strong> and the <strong>DPDP Rules, 2025</strong>, we adhere to strict data minimization — <strong>no PAN or Aadhaar card details are ever requested, processed, or stored</strong>.
        </p>
      </div>

      {/* Direct Link to DPDP Compliance Center */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#131E32] to-[#0A0B0D] border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white font-serif">
              Looking for the Interactive DPDP Compliance Center?
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Access your personal data audit log, export JSON receipts, register a nominee, file a DPO grievance, or execute permanent data erasure.
            </p>
          </div>
        </div>

        {onGoToComplianceCenter && (
          <button
            type="button"
            onClick={onGoToComplianceCenter}
            className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition active:scale-95 cursor-pointer whitespace-nowrap"
          >
            Open Compliance Center →
          </button>
        )}
      </div>

      {/* Statutory Itemized Pre-Collection Privacy Notice */}
      <PreCollectionPrivacyNotice defaultExpanded={true} />

      {/* Interactive Cookie & Survey Terms Consent Manager Box */}
      <div className="bg-[#0F172A] border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Cookie className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif text-white">
                Browser Cookie & Survey Consent Preferences
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Manage your agreement to survey terms and browser cookie storage.
              </p>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold border ${
            cookieConsent?.accepted
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${cookieConsent?.accepted ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span>{cookieConsent?.accepted ? 'Survey Consent Active in Cookies' : 'Consent Not Saved in Cookies'}</span>
          </span>
        </div>

        <div className="bg-[#0A0B0D] border border-[#1E293B] rounded-2xl p-4 text-xs space-y-3 leading-relaxed text-[#CBD5E1]">
          <div className="flex items-start gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Survey & Public Opinion Modeling Guarantee:</strong>
              <p className="text-[#94A3B8] text-[11px] mt-0.5">
                All data collected on CivicTax is strictly for civic survey and public interest modeling. It is <strong>NOT for personal commercial use, nor is it accessible by or shared with the Income Tax Department or any Government authority.</strong>
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#1E293B] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[11px] font-mono">
            <div className="bg-[#0F172A] p-2.5 rounded-lg border border-[#1E293B]">
              <span className="text-[#64748B] block text-[10px]">Cookie Name:</span>
              <span className="text-emerald-400 font-bold">{SURVEY_CONSENT_COOKIE_NAME}</span>
            </div>
            <div className="bg-[#0F172A] p-2.5 rounded-lg border border-[#1E293B]">
              <span className="text-[#64748B] block text-[10px]">Validity:</span>
              <span className="text-white font-bold">{CONSENT_EXPIRY_DAYS} Days (1 Year)</span>
            </div>
            <div className="bg-[#0F172A] p-2.5 rounded-lg border border-[#1E293B]">
              <span className="text-[#64748B] block text-[10px]">Consent Date:</span>
              <span className="text-white">{cookieConsent?.acceptedAt ? new Date(cookieConsent.acceptedAt).toLocaleDateString() : 'None'}</span>
            </div>
            <div className="bg-[#0F172A] p-2.5 rounded-lg border border-[#1E293B]">
              <span className="text-[#64748B] block text-[10px]">Status:</span>
              <span className={cookieConsent?.accepted ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {cookieConsent?.accepted ? 'Agreed & Active' : 'Pending / Guest'}
              </span>
            </div>
          </div>
        </div>

        {feedbackMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs px-4 py-2.5 rounded-xl animate-fadeIn">
            {feedbackMsg}
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
          <span className="text-[11px] text-[#64748B]">
            Section 6 DPDP Act 2023 • You may revoke your survey consent at any time.
          </span>

          <div className="flex items-center gap-2.5">
            {cookieConsent?.accepted ? (
              <button
                type="button"
                onClick={handleRevokeConsent}
                className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-4 py-2 rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Revoke Consent & Clear Cookie</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGrantConsent}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition active:scale-95 cursor-pointer"
              >
                <Cookie className="w-3.5 h-3.5" />
                <span>Agree to Terms & Store in Cookies</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Core Privacy Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0F172A] border border-emerald-500/30 rounded-2xl p-5 space-y-2 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <BadgeCheck className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white">Strict Data Minimization</h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Zero PAN and Aadhaar storage. We identify survey participants solely via Email or Phone, in accordance with Section 6 of the DPDP Act 2023.
          </p>
        </div>

        <div className="bg-[#0F172A] border border-sky-500/30 rounded-2xl p-5 space-y-2 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white">Anonymized Open Data</h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Public dashboards display only aggregated percentage allocations and state-level statistics. Personal identifiers are never published.
          </p>
        </div>

        <div className="bg-[#0F172A] border border-purple-500/30 rounded-2xl p-5 space-y-2 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white">Cryptographic Verification</h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Every submission generates a tamper-evident SHA-256 digital receipt verifying citizen participation without exposing private credentials.
          </p>
        </div>
      </div>

      {/* Detailed Legal & Architectural Sections */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-[#CBD5E1]">
        {/* Section 1 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-white font-serif font-bold text-lg">
            <span className="text-emerald-400 font-mono text-sm">01.</span>
            <h3>Platform Status: Independent Civic Platform (Non-Governmental)</h3>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            CivicTax is an independent, private civic technology and participatory public policy simulation platform developed for educational research, citizen budget modeling, and fiscal sentiment analysis.
          </p>
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <span className="leading-relaxed">
              <strong>Statutory Non-Affiliation Disclaimer:</strong> This platform is independently operated and is not affiliated with or endorsed by the Government of India, any state government, municipal corporation, or tax authority. This application does not collect official taxes, file statutory Income Tax Returns (ITR), or represent any official government portal.
            </span>
          </div>
        </section>

        <div className="h-px bg-[#1E293B]"></div>

        {/* Section 2 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-white font-serif font-bold text-lg">
            <span className="text-emerald-400 font-mono text-sm">02.</span>
            <h3>Compliance with India's DPDP Act, 2023 & DPDP Rules, 2025</h3>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Following the publication of the final Digital Personal Data Protection Rules in November 2025 by the Ministry of Electronics and Information Technology (MeitY), our architecture guarantees:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-[#CBD5E1] pl-2">
            <li><strong>Data Fiduciary Notice (Section 5):</strong> Clear, standalone notice provided in English and scheduled languages prior to requesting consent.</li>
            <li><strong>Free, Specific, Informed, and Unconditional Consent (Section 6):</strong> Participants give active consent with granular opt-ins before their survey data is processed.</li>
            <li><strong>Purpose Limitation & Data Minimization:</strong> Only data strictly necessary for survey aggregation (Full Name, Email, Phone, Profession, Location, and Sector Percentages) is collected.</li>
            <li><strong>Exclusion of National Identity Numbers:</strong> Under our privacy-by-design mandate, <strong>we do not collect, store, or process PAN or Aadhaar numbers</strong>.</li>
          </ul>
        </section>

        <div className="h-px bg-[#1E293B]"></div>

        {/* Section 3 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-white font-serif font-bold text-lg">
            <span className="text-emerald-400 font-mono text-sm">03.</span>
            <h3>Data Principal Rights (Sections 11–14 of DPDP Act 2023)</h3>
          </div>
          <div className="bg-[#0A0B0D] border border-[#1E293B] rounded-2xl p-5 space-y-4">
            <p className="text-xs text-[#94A3B8]">
              As a Data Principal under Indian law, you have the following irrevocable rights:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-[#0F172A] border border-emerald-500/20 space-y-1">
                <span className="font-bold text-emerald-400 block">Right to Access Information (Sec. 11)</span>
                <p className="text-[#94A3B8]">
                  Request a summary of personal data being processed and identities of any data fiduciaries or processors.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0F172A] border border-emerald-500/20 space-y-1">
                <span className="font-bold text-emerald-400 block">Right to Correction & Erasure (Sec. 12)</span>
                <p className="text-[#94A3B8]">
                  Correct misleading data, complete incomplete profiles, or erase your survey records at any time.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0F172A] border border-emerald-500/20 space-y-1">
                <span className="font-bold text-emerald-400 block">Right of Grievance Redressal (Sec. 13)</span>
                <p className="text-[#94A3B8]">
                  Lodge inquiries or grievances directly with our Data Protection Officer, with a response timeline under 72 hours.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#0F172A] border border-emerald-500/20 space-y-1">
                <span className="font-bold text-emerald-400 block">Right to Nominate (Sec. 14)</span>
                <p className="text-[#94A3B8]">
                  Nominate an individual to exercise data rights on your behalf in case of incapacity.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-[#1E293B]"></div>

        {/* Section 4 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-white font-serif font-bold text-lg">
            <span className="text-emerald-400 font-mono text-sm">04.</span>
            <h3>Data Storage & Administrative Access Controls</h3>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            CivicTax implements strict security safeguards and role-based access control (RBAC):
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-[#CBD5E1] pl-2">
            <li><strong>Local Browser Encrypted Cache:</strong> For instant responsiveness and offline capability.</li>
            <li><strong>Supabase Cloud Database & PostgreSQL RLS:</strong> Durable storage with Row-Level Security restricting unauthorized cross-account reads.</li>
            <li><strong>Admin-Only Visibility for Synchronization Tools:</strong> The <code className="text-emerald-400 font-mono">DB:Syncup</code> tools and database migration badge are <strong>strictly visible only to the verified administrator</strong> (<code className="text-emerald-300 font-mono">mukeshsingh.negi07@gmail.com</code>) and remain invisible to public viewers.</li>
          </ul>
        </section>

        <div className="h-px bg-[#1E293B]"></div>

        {/* Section 5: Contact DPO */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-white font-serif font-bold text-lg">
            <span className="text-emerald-400 font-mono text-sm">05.</span>
            <h3>Data Protection Officer & Grievance Redressal</h3>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            In compliance with DPDP Rules 2025, any Data Principal may exercise their rights or report grievances to our designated Data Protection Officer:
          </p>
          <div className="bg-[#0A0B0D] border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="font-bold text-white text-xs">Mukesh Singh Negi — Data Protection Officer & Lead</div>
              <div className="text-xs font-mono text-emerald-400">{contactEmail}</div>
              <div className="text-[11px] text-[#94A3B8]">Location: India • Response Time: &lt; 48 hours</div>
            </div>
            <a
              href={`mailto:${contactEmail}?subject=DPDP%20Data%20Principal%20Grievance`}
              className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact DPO</span>
            </a>
          </div>
        </section>
      </div>

      {/* Footer Navigation CTAs */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-4">
        <button
          type="button"
          onClick={onGoToGlobalDashboard}
          className="text-xs text-[#94A3B8] hover:text-white flex items-center gap-1.5 cursor-pointer"
        >
          <span>← Back to Public Consensus Dashboard</span>
        </button>

        <button
          type="button"
          onClick={onStartFiling}
          className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Participate in Civic Survey</span>
        </button>
      </div>
    </div>
  );
};
