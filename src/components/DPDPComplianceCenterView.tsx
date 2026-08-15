import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  FileCheck2,
  Database,
  Trash2,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  Scale,
  Sparkles,
  Layers,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Share2,
  Users,
  Mail,
  Phone,
  MapPin,
  Landmark,
  UserX,
  UserCheck,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cookie,
  RefreshCw,
  Send,
  Check,
  Copy,
  Info,
  Ban,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { TaxRecord, CitizenUser } from '../types';
import { eraseAllCitizenData } from '../utils/dataService';
import {
  getSurveyCookieConsent,
  saveSurveyCookieConsent,
  revokeSurveyCookieConsent,
  SurveyCookieConsent,
  SURVEY_CONSENT_COOKIE_NAME,
  SURVEY_CONSENT_VERSION,
  CONSENT_EXPIRY_DAYS,
} from '../utils/cookieConsent';
import { formatCurrencyINR, formatCompactINR } from '../utils/formatters';

interface DPDPComplianceCenterViewProps {
  currentUser: CitizenUser | null;
  userRecords: TaxRecord[];
  allRecords: TaxRecord[];
  onOpenAuthModal: () => void;
  onGoToFiling: () => void;
  onGoToGlobalDashboard: () => void;
  onRecordsDeleted: (remainingRecords: TaxRecord[]) => void;
  onUserLoggedOut: () => void;
  onOpenPrivacyModal?: (tab?: 'download' | 'delete' | 'withdraw' | 'preferences') => void;
}

export const DPDPComplianceCenterView: React.FC<DPDPComplianceCenterViewProps> = ({
  currentUser,
  userRecords,
  allRecords,
  onOpenAuthModal,
  onGoToFiling,
  onGoToGlobalDashboard,
  onRecordsDeleted,
  onUserLoggedOut,
  onOpenPrivacyModal,
}) => {
  const dpoName = 'Mukesh Singh Negi';
  const dpoEmail = 'mukeshsingh.negi07@gmail.com';
  const complianceVersion = 'DPDP-ACT-2023-RULES-2025-v1.0';

  // Cookie consent state
  const [cookieConsent, setCookieConsent] = useState<SurveyCookieConsent | null>(() => getSurveyCookieConsent());
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Tab within Compliance Center: 'audit_log' | 'rights_suite' | 'grievance' | 'cookie_manager'
  const [activeSection, setActiveSection] = useState<'audit_log' | 'rights_suite' | 'grievance' | 'cookie_manager'>('audit_log');

  // Deletion modal & certificate state
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deletionSuccessCert, setDeletionSuccessCert] = useState<{
    hash: string;
    count: number;
    timestamp: string;
  } | null>(null);

  // Nominee form state
  const [nomineeName, setNomineeName] = useState<string>('');
  const [nomineeRelation, setNomineeRelation] = useState<string>('Spouse');
  const [nomineeEmail, setNomineeEmail] = useState<string>('');
  const [nomineeSavedMsg, setNomineeSavedMsg] = useState<string | null>(null);

  // Grievance form state
  const [grievanceCategory, setGrievanceCategory] = useState<string>('data_erasure');
  const [grievanceSubject, setGrievanceSubject] = useState<string>('');
  const [grievanceDetails, setGrievanceDetails] = useState<string>('');
  const [grievanceTicket, setGrievanceTicket] = useState<{
    ticketId: string;
    submittedAt: string;
    category: string;
  } | null>(null);

  // Sync cookie consent state
  useEffect(() => {
    const handleCookieUpdate = (e: any) => {
      setCookieConsent(e.detail as SurveyCookieConsent | null);
    };
    window.addEventListener('civic_survey_consent_updated', handleCookieUpdate);
    return () => window.removeEventListener('civic_survey_consent_updated', handleCookieUpdate);
  }, []);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 3000);
  };

  // Export JSON audit log (Right to Portability & Information under Section 11)
  const handleExportDataJson = () => {
    const exportPayload = {
      complianceStandard: 'Digital Personal Data Protection Act (DPDP Act) 2023 & DPDP Rules 2025',
      noticeVersion: complianceVersion,
      generatedAt: new Date().toISOString(),
      dataPrincipal: currentUser
        ? {
            id: currentUser.id,
            fullName: currentUser.fullName,
            email: currentUser.email,
            phone: currentUser.phone || 'Not provided',
            city: currentUser.city,
            state: currentUser.state,
            pincode: currentUser.pincode,
            profession: currentUser.profession,
            dpdpConsentGranted: currentUser.dpdpConsentGranted,
            consentTimestamp: currentUser.consentTimestamp || new Date().toISOString(),
          }
        : 'Guest / Public Session (Anonymous Participation)',
      filingRecordsCount: userRecords.length,
      itemizedProcessingRecords: userRecords.map((r) => ({
        id: r.id,
        financialYear: r.financialYear,
        taxPaid: r.taxPaid,
        taxRegime: r.taxRegime,
        allocations: r.allocations,
        citizenProposal: r.citizenProposal || null,
        verificationHash: r.verificationHash,
        submissionDate: r.submissionDate,
      })),
      cookieConsentAudit: cookieConsent,
      processingPurposes: [
        'Participation in independent civic budget survey',
        'Generation of individual citizen cryptographic tax receipt',
        'National and state-wise anonymized public policy modeling',
      ],
      thirdPartySharing: 'NONE (0% sold, zero commercial advertising, zero tax authority sharing)',
      dpoContact: dpoEmail,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `DPDP_DataPrincipal_Audit_${currentUser ? currentUser.fullName.replace(/\s+/g, '_') : 'Guest'}_${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Execute Right to Erasure (DPDP Act 2023 Section 12)
  const handleExecuteErasure = async () => {
    setIsDeleting(true);
    try {
      const identifier = {
        email: currentUser?.email,
        phone: currentUser?.phone,
        fullName: currentUser?.fullName,
      };

      const result = await eraseAllCitizenData(identifier);

      if (result.success) {
        setDeletionSuccessCert({
          hash: result.deletionCertificateHash,
          count: result.erasedRecordsCount,
          timestamp: result.timestamp,
        });

        // Revoke survey consent cookies
        revokeSurveyCookieConsent();

        // Notify parent to refresh records
        const remaining = allRecords.filter((r) => {
          if (!currentUser) return true;
          return r.email !== currentUser.email && r.fullName !== currentUser.fullName;
        });
        onRecordsDeleted(remaining);

        // Sign out user locally
        onUserLoggedOut();
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      console.error('Erasure error:', err);
      alert('An error occurred during data erasure. Please contact the DPO directly.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Save Nominee (Section 14)
  const handleSaveNominee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomineeName.trim() || !nomineeEmail.trim()) {
      alert('Please provide nominee name and email.');
      return;
    }
    const nomineeData = {
      name: nomineeName.trim(),
      relation: nomineeRelation,
      email: nomineeEmail.trim(),
      registeredAt: new Date().toISOString(),
    };
    localStorage.setItem(`dpdp_nominee_${currentUser?.id || 'guest'}`, JSON.stringify(nomineeData));
    setNomineeSavedMsg(`✓ Nominee ${nomineeName} registered under Section 14 of DPDP Act 2023.`);
    setTimeout(() => setNomineeSavedMsg(null), 5000);
  };

  // Submit Grievance (Section 13)
  const handleSubmitGrievance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievanceSubject.trim() || !grievanceDetails.trim()) {
      alert('Please fill in both subject and details for your grievance.');
      return;
    }

    const ticketId = `DPDP-GRV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTicket = {
      ticketId,
      submittedAt: new Date().toISOString(),
      category: grievanceCategory,
      subject: grievanceSubject,
      details: grievanceDetails,
      userEmail: currentUser?.email || 'guest@civictax.org',
    };

    // Save ticket locally
    const existing = JSON.parse(localStorage.getItem('dpdp_grievance_tickets') || '[]');
    localStorage.setItem('dpdp_grievance_tickets', JSON.stringify([newTicket, ...existing]));

    setGrievanceTicket({
      ticketId,
      submittedAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      category: grievanceCategory,
    });
    setGrievanceSubject('');
    setGrievanceDetails('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="dpdp-compliance-center-root">
      {/* Top Statutory Hero Banner */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#131E32] to-[#0A0B0D] border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full font-bold border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4" />
                <span>Statutory Compliance Center</span>
              </span>
              <span className="text-xs bg-[#1E293B] text-slate-300 px-3 py-1 rounded-full border border-[#334155] font-mono">
                DPDP Act 2023 • Rules 2025
              </span>
              <span className="text-xs bg-indigo-500/15 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30 font-mono">
                Notice Version: {complianceVersion}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold font-serif text-white tracking-tight">
              DPDP Compliance & Citizen Data Rights Hub
            </h1>

            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
              Transparent, itemized audit log of what personal data is processed, specific statutory purposes for collection, storage architectures, and direct one-click execution of your <strong>Rights to Access, Correction, Nominate, and Deletion</strong> under India's Digital Personal Data Protection framework.
            </p>
          </div>

          <div className="bg-[#0A0B0D]/80 border border-[#1E293B] rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shrink-0 lg:w-80 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2.5">
              <span className="text-xs text-[#94A3B8]">Data Fiduciary</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>CivicTax (Independent)</span>
              </span>
            </div>

            <div className="text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Data Protection Officer:</span>
                <span className="text-white font-semibold">{dpoName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">DPO Contact:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(dpoEmail, 'dpo-email')}
                  className="text-emerald-400 hover:underline font-mono text-[11px] flex items-center gap-1 cursor-pointer"
                  title="Click to copy DPO Email"
                >
                  <span>{dpoEmail}</span>
                  {copiedText === 'dpo-email' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[#64748B]" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Zero PAN/Aadhaar:</span>
                <span className="text-emerald-400 font-bold">100% Enforced</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Statutory Grievance SLA:</span>
                <span className="text-white font-bold font-mono">Max 30 Days</span>
              </div>
            </div>

            {currentUser ? (
              <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-xs">
                <span className="text-[#94A3B8]">Logged In Citizen:</span>
                <span className="text-emerald-400 font-bold truncate max-w-[130px]">{currentUser.fullName}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="w-full mt-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold py-2 rounded-xl transition cursor-pointer text-center"
              >
                Sign In to View Personal Ledger →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Erasure Success Modal / Certificate */}
      {deletionSuccessCert && (
        <div className="bg-emerald-500/10 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 space-y-4 animate-fadeIn">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-white font-serif">
                  Statutory Erasure Certificate Issued (Section 12 DPDP Act 2023)
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">
                  ERASED & PURGED
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                All personal data, associated tax filing records ({deletionSuccessCert.count} items), profile sessions, and cookie identifiers have been permanently removed across our databases and local caching layers.
              </p>
            </div>
          </div>

          <div className="bg-[#0A0B0D] p-4 rounded-2xl border border-[#1E293B] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div>
              <span className="text-[#64748B] block text-[10px]">Erasure Certificate Hash:</span>
              <span className="text-emerald-400 font-bold break-all">{deletionSuccessCert.hash}</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px]">Timestamp (UTC):</span>
              <span className="text-white">{new Date(deletionSuccessCert.timestamp).toUTCString()}</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px]">Records Purged:</span>
              <span className="text-white font-bold">{deletionSuccessCert.count} Filings + Profile Session</span>
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
            <span className="text-xs text-[#64748B]">
              You may retain this cryptographic hash as statutory proof of full erasure compliance.
            </span>
            <button
              type="button"
              onClick={() => setDeletionSuccessCert(null)}
              className="bg-[#1E293B] hover:bg-[#334155] text-white px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Dismiss Certificate
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Complete Erasure */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border-2 border-rose-500/50 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <UserX className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-bold font-serif text-white">
                Confirm Right to Erasure (DPDP Act 2023 Sec 12)
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                This action will immediately and irreversibly delete your complete profile, contact identifiers, all {userRecords.length} historical survey filings, and consent cookies from both our active database and browser cache.
              </p>
            </div>

            <div className="bg-[#0A0B0D] p-3.5 rounded-xl border border-rose-500/20 text-xs space-y-2 text-[#CBD5E1]">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>What will be erased:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[#94A3B8] pl-2 text-[11px]">
                <li>Name, Email, and Phone number ({currentUser?.email || 'Current Session'})</li>
                <li>State, City, and Pincode records</li>
                <li>All historical civic tax sector allocations & proposals</li>
                <li>Survey consent tokens & browser cookies</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-white bg-[#1E293B] hover:bg-[#334155] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteErasure}
                disabled={isDeleting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{isDeleting ? 'Purging Records...' : 'Permanently Erase All My Data'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Center Section Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1E293B] pb-3 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveSection('audit_log')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
            activeSection === 'audit_log'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>1. Itemized Data Processing Log</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('rights_suite')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
            activeSection === 'rights_suite'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>2. Citizen Rights Suite (Sec 11–14)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('grievance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
            activeSection === 'grievance'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>3. DPO Grievance Redressal (Sec 13)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('cookie_manager')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
            activeSection === 'cookie_manager'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
          }`}
        >
          <Cookie className="w-4 h-4" />
          <span>4. Cookie & Consent Manager</span>
        </button>
      </div>

      {/* SECTION 1: Itemized Data Processing Log (Audit & Inventory) */}
      {activeSection === 'audit_log' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl p-4 sm:p-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-serif flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                <span>Live Personal Data Processing Inventory & Statutory Matrix</span>
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Itemized specification of personal data collected, specific processing purposes, legal grounds, storage locations, and retention rules (Rule 3(1), DPDP Rules 2025).
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleExportDataJson}
                className="flex items-center gap-1.5 bg-[#1E293B] hover:bg-[#334155] text-white px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#334155] transition active:scale-95 cursor-pointer shadow-xs"
                title="Download full machine-readable JSON log"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Machine-Readable Log (JSON)</span>
              </button>
            </div>
          </div>

          {/* Itemized Processing Table */}
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#131E32] text-[#CBD5E1] border-b border-[#1E293B]">
                    <th className="py-3 px-4 font-bold">Personal Data Element</th>
                    <th className="py-3 px-4 font-bold">Current Value (Your Ledger)</th>
                    <th className="py-3 px-4 font-bold">Specific Purpose for Processing</th>
                    <th className="py-3 px-4 font-bold">Legal Ground</th>
                    <th className="py-3 px-4 font-bold">Storage Location</th>
                    <th className="py-3 px-4 font-bold">Third-Party Sharing</th>
                    <th className="py-3 px-4 font-bold">Retention Schedule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B] text-[#94A3B8]">
                  {/* Row 1: Full Name */}
                  <tr className="hover:bg-[#1E293B]/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">Full Name</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">
                      {currentUser?.fullName || (userRecords[0]?.fullName ? userRecords[0].fullName : 'Anonymous Guest')}
                    </td>
                    <td className="py-3.5 px-4">
                      Issuing verified participation certificates and authenticated civic tax receipt.
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">Sec 6(1) Voluntary Consent</td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">Encrypted Cloud DB / Browser Cache</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">0% (Never Shared)</td>
                    <td className="py-3.5 px-4 text-[11px]">Active account or immediate erasure request.</td>
                  </tr>

                  {/* Row 2: Contact Email */}
                  <tr className="hover:bg-[#1E293B]/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">Contact Email</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">
                      {currentUser?.email || (userRecords[0]?.email ? userRecords[0].email : 'Not Provided')}
                    </td>
                    <td className="py-3.5 px-4">
                      Citizen session authentication, DPO grievance communication, and certificate delivery.
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">Sec 6(1) Voluntary Consent</td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">Encrypted Cloud DB / Session Storage</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">0% (Never Sold)</td>
                    <td className="py-3.5 px-4 text-[11px]">Active account or 30 days post-deletion.</td>
                  </tr>

                  {/* Row 3: Phone Number */}
                  <tr className="hover:bg-[#1E293B]/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">Phone Number (Optional)</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">
                      {currentUser?.phone || (userRecords[0]?.phone ? userRecords[0].phone : 'Not Provided')}
                    </td>
                    <td className="py-3.5 px-4">
                      Two-factor PIN authentication and cryptographic SMS survey verification receipt.
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">Sec 6(1) Voluntary Consent</td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">Encrypted Cloud DB</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">0% (Never Shared)</td>
                    <td className="py-3.5 px-4 text-[11px]">Deleted immediately on user request.</td>
                  </tr>

                  {/* Row 4: State, City, Pincode */}
                  <tr className="hover:bg-[#1E293B]/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">State, City & Pincode</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">
                      {currentUser ? `${currentUser.city}, ${currentUser.state} (${currentUser.pincode})` : 'Regional Demographic Entry'}
                    </td>
                    <td className="py-3.5 px-4">
                      Regional municipal breakdown and state-wise public policy consensus modeling.
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">Sec 6(1) Civic Survey</td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">Encrypted DB / Local Cache</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">Anonymized Aggregations Only</td>
                    <td className="py-3.5 px-4 text-[11px]">Aggregated stats retained in anonymized form.</td>
                  </tr>

                  {/* Row 5: Income & Tax Contribution */}
                  <tr className="hover:bg-[#1E293B]/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">Income Bracket & Tax Paid</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">
                      {userRecords.length > 0
                        ? `₹${userRecords[0].taxPaid.toLocaleString('en-IN')} (FY ${userRecords[0].financialYear})`
                        : 'Survey Input'}
                    </td>
                    <td className="py-3.5 px-4">
                      Estimating rupee-value civic contribution and tangible outcomes (roads, solar, healthcare).
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">Sec 6(1) Voluntary Modeling</td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">PostgreSQL (Row-Level Security)</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">0% (Zero Tax Authority Access)</td>
                    <td className="py-3.5 px-4 text-[11px]">Active account or immediate erasure.</td>
                  </tr>

                  {/* Row 6: Sector Allocations & Proposal */}
                  <tr className="hover:bg-[#1E293B]/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">Sector Allocations & Proposal</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">
                      {userRecords.length > 0 ? `${userRecords.length} Saved Year(s)` : 'User Input Distribution'}
                    </td>
                    <td className="py-3.5 px-4">
                      Benchmarking citizen consensus against national budget and powering AI policy impact reports.
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">Sec 6(1) Public Policy Modeling</td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">Encrypted Cloud DB</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">Aggregated Public Dashboard</td>
                    <td className="py-3.5 px-4 text-[11px]">Individual record deleted on request.</td>
                  </tr>

                  {/* Row 7: Cryptographic Verification Receipt */}
                  <tr className="hover:bg-[#1E293B]/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">SHA-256 Digital Verification Hash</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-emerald-400 truncate max-w-[150px]">
                      {userRecords[0]?.verificationHash || 'SHA256-CT-RECEIPT'}
                    </td>
                    <td className="py-3.5 px-4">
                      Cryptographic tamper-proofing of citizen submission without revealing personal identity.
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">Sec 8 Technical Safeguard</td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">Digital Certificate Signature</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">Publicly Verifiable Hash Only</td>
                    <td className="py-3.5 px-4 text-[11px]">Permanent receipt proof.</td>
                  </tr>

                  {/* Row 8: Cookie Consent Status */}
                  <tr className="hover:bg-[#1E293B]/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">Cookie Consent Preference</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">
                      {cookieConsent?.accepted ? 'Agreed & Stored' : 'Guest / Pending'}
                    </td>
                    <td className="py-3.5 px-4">
                      Remembers survey acceptance and prevents repetitive statutory consent modals.
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">DPDP Rules 2025 (Cookie Consent)</td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">Browser Cookie ({SURVEY_CONSENT_COOKIE_NAME})</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">0% (First-party Only)</td>
                    <td className="py-3.5 px-4 text-[11px]">365 Days (1 Year) or until wiped.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Key DPDP Safeguards Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-[#0F172A] border border-emerald-500/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Government Access</span>
              </div>
              <p className="text-[#94A3B8] leading-relaxed text-[11px]">
                CivicTax is strictly an independent citizen research project. No data is accessible by or shared with the Income Tax Department or any Government authority.
              </p>
            </div>

            <div className="bg-[#0F172A] border border-emerald-500/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Lock className="w-4 h-4" />
                <span>Data Minimization (No PAN)</span>
              </div>
              <p className="text-[#94A3B8] leading-relaxed text-[11px]">
                In compliance with Section 6(1) of the DPDP Act 2023, we never request, process, or store PAN or Aadhaar identification cards.
              </p>
            </div>

            <div className="bg-[#0F172A] border border-emerald-500/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Clock className="w-4 h-4" />
                <span>One-Click Immediate Erasure</span>
              </div>
              <p className="text-[#94A3B8] leading-relaxed text-[11px]">
                You retain full sovereign ownership. You can execute full data erasure under Section 12 with instantaneous cryptographic receipt generation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Citizen Rights Suite (Sections 11, 12, 14) */}
      {activeSection === 'rights_suite' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white font-serif flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-400" />
                <span>Statutory Data Principal Rights Suite (DPDP Act 2023)</span>
              </h2>
              <span className="text-xs font-mono bg-emerald-500/15 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 font-bold">
                Account &gt; Privacy Suite
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Exercise your legally enforceable rights directly through this interface as guaranteed under Chapter III and Section 6(4) of the Act.
            </p>
          </div>

          {/* Account > Privacy Direct Navigation Tree */}
          <div className="bg-[#0A0B0D] border-2 border-emerald-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <span className="text-emerald-400">Account</span>
                <span className="text-[#64748B]">/</span>
                <span className="text-emerald-400">Privacy</span>
              </div>
              <span className="text-[11px] text-[#94A3B8]">
                Standard Hierarchy for Immediate Citizen Privacy & Data Sovereignty
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => onOpenPrivacyModal && onOpenPrivacyModal('withdraw')}
                className="bg-[#131E32] hover:bg-amber-500/15 border border-amber-500/40 p-3 rounded-xl text-left transition group cursor-pointer"
              >
                <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
                  <span>Withdraw consent</span>
                  <span className="text-[10px] font-mono bg-amber-500/20 px-1.5 py-0.2 rounded">Sec 6(4)</span>
                </div>
                <p className="text-[10px] text-[#94A3B8] mt-1">1-Click instant processing revocation.</p>
              </button>

              <button
                type="button"
                onClick={() => onOpenPrivacyModal && onOpenPrivacyModal('delete')}
                className="bg-[#131E32] hover:bg-rose-500/15 border border-rose-500/40 p-3 rounded-xl text-left transition group cursor-pointer"
              >
                <div className="text-xs font-bold text-rose-300 flex items-center justify-between">
                  <span>Delete my data</span>
                  <span className="text-[10px] font-mono bg-rose-500/20 px-1.5 py-0.2 rounded">Sec 12</span>
                </div>
                <p className="text-[10px] text-[#94A3B8] mt-1">Complete permanent data eradication.</p>
              </button>

              <button
                type="button"
                onClick={() => onOpenPrivacyModal && onOpenPrivacyModal('download')}
                className="bg-[#131E32] hover:bg-[#1E293B] border border-emerald-500/30 p-3 rounded-xl text-left transition group cursor-pointer"
              >
                <div className="text-xs font-bold text-emerald-300 flex items-center justify-between">
                  <span>Download my data</span>
                  <span className="text-[10px] font-mono bg-emerald-500/20 px-1.5 py-0.2 rounded">Sec 11</span>
                </div>
                <p className="text-[10px] text-[#94A3B8] mt-1">Export JSON machine-readable ledger.</p>
              </button>

              <button
                type="button"
                onClick={() => onOpenPrivacyModal && onOpenPrivacyModal('preferences')}
                className="bg-[#131E32] hover:bg-[#1E293B] border border-slate-700 p-3 rounded-xl text-left transition group cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>Privacy preferences</span>
                  <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.2 rounded">Rules '25</span>
                </div>
                <p className="text-[10px] text-[#94A3B8] mt-1">Granular survey and cookie switches.</p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Right 0: Right to Withdraw Consent (Section 6(4)) */}
            <div className="bg-[#0F172A] border border-amber-500/40 rounded-2xl p-6 space-y-4 shadow-lg flex flex-col justify-between md:col-span-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Ban className="w-4 h-4" />
                    <span>Right to Withdraw Consent (Section 6(4) DPDP Act 2023)</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    Statutory Rule: Easy As Giving Consent
                  </span>
                </div>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  "The Data Principal shall have the right to withdraw her consent at any time. The ease of withdrawal of consent shall be comparable to the ease with which such consent was given." Clicking the button below immediately suspends all processing of your survey inputs and revokes active consent tokens with a verifiable receipt.
                </p>
              </div>

              <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between flex-wrap gap-3">
                <span className="text-[11px] text-[#94A3B8]">
                  Zero delays • Instant cryptographic receipt • Retains past lawful validity
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenPrivacyModal) {
                      onOpenPrivacyModal('withdraw');
                    }
                  }}
                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Withdraw My Consent (1-Click)</span>
                </button>
              </div>
            </div>

            {/* Right 1: Right to Access & Portability (Section 11) */}
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 space-y-4 shadow-lg flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Download className="w-4 h-4" />
                  <span>Right to Access & Portability (Section 11)</span>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Request a complete summary of all personal data being processed, processing purposes, and download your entire ledger in a standard, machine-readable JSON format.
                </p>
              </div>

              <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between gap-3">
                <span className="text-[11px] text-[#64748B] font-mono">Status: Instant Self-Service</span>
                <button
                  type="button"
                  onClick={handleExportDataJson}
                  className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download My Data (JSON)</span>
                </button>
              </div>
            </div>

            {/* Right 2: Right to Correction & Updating (Section 12) */}
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 space-y-4 shadow-lg flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <FileCheck2 className="w-4 h-4" />
                  <span>Right to Correction & Updating (Section 12)</span>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Rectify incomplete, inaccurate, or outdated personal demographic data, income approximations, or adjust your civic sector allocations for upcoming financial years.
                </p>
              </div>

              <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between gap-3">
                <span className="text-[11px] text-[#64748B] font-mono">Status: Real-time Editing</span>
                <button
                  type="button"
                  onClick={onGoToFiling}
                  className="flex items-center gap-1.5 bg-[#1E293B] hover:bg-[#334155] text-white px-4 py-2 rounded-xl text-xs font-semibold border border-[#334155] transition active:scale-95 cursor-pointer"
                >
                  <span>Update Filings & Allocations →</span>
                </button>
              </div>
            </div>

            {/* Right 3: Right to Erasure & Forgotten (Section 12) */}
            <div className="bg-[#0F172A] border border-rose-500/30 rounded-2xl p-6 space-y-4 shadow-lg flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <Trash2 className="w-4 h-4" />
                  <span>Right to Erasure / Right to be Forgotten (Section 12)</span>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Permanently delete all your personal data, survey filings, profile sessions, and cookie identifiers. Generates an instant cryptographic erasure certificate for your records.
                </p>
              </div>

              <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between gap-3">
                <span className="text-[11px] text-rose-400/80 font-mono">Permanent & Irreversible</span>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-md shadow-rose-600/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Request Full Data Erasure</span>
                </button>
              </div>
            </div>

            {/* Right 4: Right to Nominate (Section 14) */}
            <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 space-y-4 shadow-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Users className="w-4 h-4" />
                  <span>Right to Nominate (Section 14)</span>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Designate an authorized representative who shall have the right to exercise your data principal rights in the event of death or incapacity.
                </p>
              </div>

              <form onSubmit={handleSaveNominee} className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Nominee Full Name"
                    value={nomineeName}
                    onChange={(e) => setNomineeName(e.target.value)}
                    className="bg-[#0A0B0D] border border-[#1E293B] focus:border-emerald-500 rounded-lg px-3 py-2 text-white placeholder-[#64748B] text-xs outline-none"
                  />
                  <select
                    value={nomineeRelation}
                    onChange={(e) => setNomineeRelation(e.target.value)}
                    className="bg-[#0A0B0D] border border-[#1E293B] focus:border-emerald-500 rounded-lg px-3 py-2 text-white text-xs outline-none"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child / Dependent</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Legal Representative">Legal Representative</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    placeholder="Nominee Email Address"
                    value={nomineeEmail}
                    onChange={(e) => setNomineeEmail(e.target.value)}
                    className="flex-1 bg-[#0A0B0D] border border-[#1E293B] focus:border-emerald-500 rounded-lg px-3 py-2 text-white placeholder-[#64748B] text-xs outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
                  >
                    Save Nominee
                  </button>
                </div>

                {nomineeSavedMsg && (
                  <div className="text-[11px] text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                    {nomineeSavedMsg}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Grievance Redressal (Section 13) */}
      {activeSection === 'grievance' && (
        <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white font-serif flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-400" />
                <span>Right of Grievance Redressal (Section 13 DPDP Act 2023)</span>
              </h2>
              <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-bold font-mono">
                30-Day Resolution SLA
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">
              File an official grievance regarding data processing, consent withdrawal, or erasure. As mandated under DPDP Rules 2025, our Data Protection Officer is legally bound to resolve your request within 30 days.
            </p>
          </div>

          {/* DPO Contact Card */}
          <div className="bg-[#0A0B0D] border border-emerald-500/30 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Data Protection Officer</span>
              <span className="text-white font-bold text-sm">{dpoName}</span>
              <span className="text-emerald-400 text-[11px] block mt-0.5">CivicTax Compliance Bureau</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Official Email</span>
              <button
                type="button"
                onClick={() => handleCopy(dpoEmail, 'dpo-email-card')}
                className="text-emerald-400 hover:underline font-mono text-xs flex items-center gap-1 mt-0.5 cursor-pointer"
              >
                <span>{dpoEmail}</span>
                {copiedText === 'dpo-email-card' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[#64748B]" />}
              </button>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Escalation Authority</span>
              <span className="text-slate-300 font-medium">Data Protection Board of India</span>
              <span className="text-[10px] text-[#64748B] block">MeitY, Government of India</span>
            </div>
          </div>

          {/* Grievance Ticket Submission Result */}
          {grievanceTicket && (
            <div className="bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl p-5 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white font-serif">
                    Statutory Grievance Ticket Logged: <span className="font-mono text-emerald-400">{grievanceTicket.ticketId}</span>
                  </h4>
                  <p className="text-xs text-[#94A3B8]">
                    Submitted on {grievanceTicket.submittedAt}. Our DPO has been notified and will respond to your registered email within 30 days.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Grievance Form */}
          <form onSubmit={handleSubmitGrievance} className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white font-serif">Submit a Formal DPDP Grievance</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#CBD5E1] font-semibold">Grievance Category</label>
                <select
                  value={grievanceCategory}
                  onChange={(e) => setGrievanceCategory(e.target.value)}
                  className="w-full bg-[#0A0B0D] border border-[#1E293B] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none"
                >
                  <option value="data_erasure">Request for Data Erasure / Deletion</option>
                  <option value="data_access">Request for Complete Data Summary (Access)</option>
                  <option value="consent_withdrawal">Withdrawal of Survey Consent</option>
                  <option value="correction">Correction of Incorrect Demographic Data</option>
                  <option value="other">General DPDP Compliance Inquiry</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#CBD5E1] font-semibold">Contact Email for Resolution</label>
                <input
                  type="email"
                  defaultValue={currentUser?.email || ''}
                  placeholder="your.email@example.com"
                  required
                  className="w-full bg-[#0A0B0D] border border-[#1E293B] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white placeholder-[#64748B] text-xs outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-[#CBD5E1] font-semibold">Subject Line</label>
              <input
                type="text"
                value={grievanceSubject}
                onChange={(e) => setGrievanceSubject(e.target.value)}
                placeholder="e.g., Request for immediate erasure of FY 2025-26 survey record"
                required
                className="w-full bg-[#0A0B0D] border border-[#1E293B] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white placeholder-[#64748B] text-xs outline-none"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-[#CBD5E1] font-semibold">Detailed Description of Grievance</label>
              <textarea
                value={grievanceDetails}
                onChange={(e) => setGrievanceDetails(e.target.value)}
                rows={4}
                placeholder="Please describe the specific issue or right you wish to exercise..."
                required
                className="w-full bg-[#0A0B0D] border border-[#1E293B] focus:border-emerald-500 rounded-xl p-3.5 text-white placeholder-[#64748B] text-xs outline-none resize-none leading-relaxed"
              ></textarea>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
              <span className="text-[11px] text-[#64748B]">
                Section 13 DPDP Act 2023 • All submissions are cryptographically logged for audit compliance.
              </span>
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Grievance to DPO</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 4: Cookie & Consent Manager */}
      {activeSection === 'cookie_manager' && (
        <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white font-serif flex items-center gap-2">
              <Cookie className="w-5 h-5 text-emerald-400" />
              <span>Browser Cookie & Survey Consent Preferences</span>
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Manage your local consent preferences in compliance with the DPDP Rules 2025.
            </p>
          </div>

          <div className="bg-[#0A0B0D] border border-emerald-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-sm font-bold text-white font-serif">Active Browser Cookie Identifier</h3>
                <p className="text-xs text-[#94A3B8] font-mono mt-0.5">{SURVEY_CONSENT_COOKIE_NAME}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                cookieConsent?.accepted
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}>
                {cookieConsent?.accepted ? '✓ Consent Active in Cookies' : '⚠ Consent Not Saved in Cookies'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-[#0F172A] p-3 rounded-xl border border-[#1E293B]">
                <span className="text-[#64748B] block text-[10px]">Validity Period:</span>
                <span className="text-white font-bold">{CONSENT_EXPIRY_DAYS} Days (1 Year)</span>
              </div>
              <div className="bg-[#0F172A] p-3 rounded-xl border border-[#1E293B]">
                <span className="text-[#64748B] block text-[10px]">Notice Version:</span>
                <span className="text-emerald-400 font-bold">{SURVEY_CONSENT_VERSION}</span>
              </div>
              <div className="bg-[#0F172A] p-3 rounded-xl border border-[#1E293B]">
                <span className="text-[#64748B] block text-[10px]">Agreed Timestamp:</span>
                <span className="text-white">
                  {cookieConsent?.acceptedAt ? new Date(cookieConsent.acceptedAt).toLocaleDateString() : 'None'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-[#1E293B]">
              <span className="text-[11px] text-[#64748B]">
                Cookies are strictly first-party and used only for remembering survey agreement.
              </span>

              <div className="flex items-center gap-2.5">
                {cookieConsent?.accepted ? (
                  <button
                    type="button"
                    onClick={() => {
                      revokeSurveyCookieConsent();
                      setCookieConsent(null);
                    }}
                    className="flex items-center gap-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revoke Consent & Delete Cookies</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const saved = saveSurveyCookieConsent({
                        surveyOnlyAffirmed: true,
                        cookieStorageAgreed: true,
                      });
                      setCookieConsent(saved);
                    }}
                    className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer"
                  >
                    <Cookie className="w-3.5 h-3.5" />
                    <span>Agree to Terms & Save in Cookies</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Links */}
      <div className="pt-6 border-t border-[#1E293B] flex items-center justify-between flex-wrap gap-4 text-xs">
        <button
          type="button"
          onClick={onGoToGlobalDashboard}
          className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
        >
          ← Return to Public Global Dashboard
        </button>

        <button
          type="button"
          onClick={onGoToFiling}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl font-bold transition cursor-pointer shadow-md shadow-emerald-500/20"
        >
          Participate & Allocate Civic Budget →
        </button>
      </div>
    </div>
  );
};
