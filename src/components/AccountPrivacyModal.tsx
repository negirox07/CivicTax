import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Download,
  Trash2,
  Ban,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserX,
  X,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Info,
  Cookie,
  Users,
} from 'lucide-react';
import { CitizenUser, TaxRecord } from '../types';
import {
  getCitizenPrivacyPreferences,
  saveCitizenPrivacyPreferences,
  withdrawCitizenConsent,
  executeCompleteInformationDeletion,
  exportDataAsJson,
  CitizenPrivacyPreferences,
  ConsentWithdrawalRecord,
} from '../utils/privacyService';

export type PrivacyTab = 'download' | 'delete' | 'withdraw' | 'preferences';

interface AccountPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CitizenUser | null;
  userRecords: TaxRecord[];
  allRecords: TaxRecord[];
  initialTab?: PrivacyTab;
  onRecordsDeleted: (remaining: TaxRecord[]) => void;
  onUserLoggedOut: () => void;
  onGoToComplianceCenter?: () => void;
}

export const AccountPrivacyModal: React.FC<AccountPrivacyModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userRecords,
  allRecords,
  initialTab = 'withdraw',
  onRecordsDeleted,
  onUserLoggedOut,
  onGoToComplianceCenter,
}) => {
  const [activeTab, setActiveTab] = useState<PrivacyTab>(initialTab);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  // Privacy preferences state
  const [preferences, setPreferences] = useState<CitizenPrivacyPreferences>(() =>
    getCitizenPrivacyPreferences(currentUser?.id)
  );
  const [prefSaveMsg, setPrefSaveMsg] = useState<string | null>(null);

  // Deletion state
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deletionCert, setDeletionCert] = useState<{
    hash: string;
    count: number;
    timestamp: string;
  } | null>(null);

  // Withdrawal state
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [withdrawalReason, setWithdrawalReason] = useState<string>('');
  const [withdrawalScope, setWithdrawalScope] = useState<'all_processing' | 'cookies_only' | 'public_modeling_only'>(
    'all_processing'
  );
  const [withdrawalRecord, setWithdrawalRecord] = useState<ConsentWithdrawalRecord | null>(null);

  // Sync initial tab when changed from props
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Sync preferences on open or user change
  useEffect(() => {
    setPreferences(getCitizenPrivacyPreferences(currentUser?.id));
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 3000);
  };

  // 1. Download Data
  const handleDownloadData = () => {
    exportDataAsJson(currentUser, userRecords);
  };

  // 2. Delete All Information ("Delete my information" under Section 12)
  const handleDeleteMyInformation = async () => {
    setIsDeleting(true);
    try {
      const res = await executeCompleteInformationDeletion(currentUser);
      if (res.success) {
        setDeletionCert({
          hash: res.deletionCertificateHash,
          count: res.erasedRecordsCount,
          timestamp: res.timestamp,
        });

        // Filter out user records from parent
        const remaining = allRecords.filter((r) => {
          if (!currentUser) return true;
          return r.email !== currentUser.email && r.fullName !== currentUser.fullName;
        });
        onRecordsDeleted(remaining);

        // Sign out user
        onUserLoggedOut();
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('An error occurred during data deletion. Please try again or contact the DPO.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 3. Withdraw Consent ("Withdrawal is as easy as giving consent" under Section 6(4))
  const handleWithdrawConsent = async () => {
    setIsWithdrawing(true);
    try {
      const record = await withdrawCitizenConsent({
        user: currentUser,
        scope: withdrawalScope,
        reason: withdrawalReason || 'Direct withdrawal requested via Privacy Center',
      });
      setWithdrawalRecord(record);
      setPreferences(getCitizenPrivacyPreferences(currentUser?.id));
    } catch (err) {
      console.error('Withdrawal error:', err);
      alert('An error occurred while withdrawing consent.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  // 4. Update Preferences
  const handleTogglePref = (key: keyof CitizenPrivacyPreferences) => {
    if (typeof preferences[key] === 'boolean') {
      const newVal = !preferences[key];
      const updated = saveCitizenPrivacyPreferences({ [key]: newVal }, currentUser?.id);
      setPreferences(updated);
      setPrefSaveMsg('✓ Privacy preference updated instantly.');
      setTimeout(() => setPrefSaveMsg(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div
        className="bg-[#0F172A] border-2 border-emerald-500/40 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        id="account-privacy-modal"
      >
        {/* Modal Header with Hierarchy Breadcrumb */}
        <div className="bg-[#131E32] border-b border-[#1E293B] px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Account</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Privacy & Consent Controls
            </span>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono hidden sm:inline-block">
              DPDP Act 2023 Sec 6(4) & 11–12
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white p-1.5 rounded-xl hover:bg-[#1E293B] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Sidebar Navigation + Main Content */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Navigation Sidebar (Account > Privacy Tree) */}
          <div className="md:col-span-4 bg-[#0A0B0D]/80 border-b md:border-b-0 md:border-r border-[#1E293B] p-4 sm:p-5 space-y-4">
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider px-2">
                Privacy Tree Structure
              </div>
              <div className="font-mono text-xs text-[#94A3B8] bg-[#0F172A] p-2.5 rounded-xl border border-[#1E293B] space-y-1">
                <div className="text-white font-bold flex items-center gap-1.5">
                  <span className="text-emerald-400">Account</span>
                </div>
                <div className="pl-3 border-l border-[#334155] space-y-1">
                  <div className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span>└── Privacy</span>
                  </div>
                  <div className="pl-4 border-l border-[#334155] space-y-0.5 text-[11px]">
                    <div className={activeTab === 'download' ? 'text-emerald-400 font-bold' : 'text-[#64748B]'}>
                      ├── Download my data
                    </div>
                    <div className={activeTab === 'delete' ? 'text-rose-400 font-bold' : 'text-[#64748B]'}>
                      ├── Delete my data
                    </div>
                    <div className={activeTab === 'withdraw' ? 'text-amber-400 font-bold' : 'text-[#64748B]'}>
                      ├── Withdraw consent
                    </div>
                    <div className={activeTab === 'preferences' ? 'text-emerald-400 font-bold' : 'text-[#64748B]'}>
                      └── Privacy preferences
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Buttons */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('download')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                  activeTab === 'download'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
                }`}
              >
                <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <span className="block">Download my data</span>
                  <span className="text-[10px] text-[#64748B] block font-normal">Section 11 (Access & Portability)</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('delete')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                  activeTab === 'delete'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                    : 'text-[#94A3B8] hover:text-rose-400 hover:bg-[#1E293B]'
                }`}
              >
                <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
                <div className="truncate">
                  <span className="block">Delete my data</span>
                  <span className="text-[10px] text-[#64748B] block font-normal">Section 12 (Right to Erasure)</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('withdraw')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                  activeTab === 'withdraw'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                    : 'text-[#94A3B8] hover:text-amber-400 hover:bg-[#1E293B]'
                }`}
              >
                <Ban className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="truncate">
                  <span className="block font-bold">Withdraw consent</span>
                  <span className="text-[10px] text-amber-400/80 block font-normal">Section 6(4) 1-Click Action</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                  activeTab === 'preferences'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
                }`}
              >
                <Sliders className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <span className="block">Privacy preferences</span>
                  <span className="text-[10px] text-[#64748B] block font-normal">Granular Processing Switches</span>
                </div>
              </button>
            </div>

            {/* Current Principal Summary */}
            <div className="bg-[#131E32] p-3 rounded-xl border border-[#1E293B] text-xs space-y-1">
              <div className="text-[10px] text-[#64748B] uppercase font-semibold">Data Principal</div>
              <div className="font-bold text-white truncate">{currentUser?.fullName || 'Anonymous Public Session'}</div>
              <div className="text-[11px] text-[#94A3B8] truncate">{currentUser?.email || 'Guest Participation'}</div>
              <div className="text-[10px] text-emerald-400 font-mono pt-1">
                {userRecords.length} Saved Year(s) in Ledger
              </div>
            </div>
          </div>

          {/* Tab Content Panel */}
          <div className="md:col-span-8 p-5 sm:p-7 space-y-6 overflow-y-auto">
            {/* 1. DOWNLOAD MY DATA */}
            {activeTab === 'download' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-base font-serif">
                    <Download className="w-5 h-5" />
                    <span>Download My Data (Section 11 DPDP Act 2023)</span>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    Under the Right to Access and Data Portability, you can instantly export all personal identifiers, demographic inputs, historical tax returns, sector allocation percentages, and cryptographic verification hashes in a standard, machine-readable JSON format.
                  </p>
                </div>

                <div className="bg-[#0A0B0D] p-4 rounded-2xl border border-[#1E293B] space-y-3 text-xs">
                  <div className="text-white font-semibold flex items-center justify-between">
                    <span>Export Package Contents</span>
                    <span className="text-emerald-400 font-mono text-[11px]">Ready for Instant Download</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
                    <div className="bg-[#131E32] p-2.5 rounded-xl border border-[#1E293B]">
                      <span className="text-[#64748B] block text-[10px]">Filings Count</span>
                      <span className="text-white font-bold font-mono">{userRecords.length} Records</span>
                    </div>
                    <div className="bg-[#131E32] p-2.5 rounded-xl border border-[#1E293B]">
                      <span className="text-[#64748B] block text-[10px]">Consent Status</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        {preferences.surveyProcessingConsent ? 'Active' : 'Withdrawn'}
                      </span>
                    </div>
                    <div className="bg-[#131E32] p-2.5 rounded-xl border border-[#1E293B] col-span-2 sm:col-span-1">
                      <span className="text-[#64748B] block text-[10px]">Data Format</span>
                      <span className="text-white font-mono font-bold">Standard JSON</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                  <span className="text-xs text-[#64748B]">Zero waiting period. 100% self-service execution.</span>
                  <button
                    type="button"
                    onClick={handleDownloadData}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Machine-Readable JSON</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. DELETE MY DATA ("Delete my information") */}
            {activeTab === 'delete' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-base font-serif">
                    <Trash2 className="w-5 h-5" />
                    <span>Delete My Data / Right to be Forgotten (Section 12)</span>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    If you say <strong>"Delete my information"</strong>, we provide a complete, permanent, and irreversible deletion mechanism. All personal identifiers, contact info, survey responses, and session cookies are purged immediately across our databases.
                  </p>
                </div>

                {deletionCert ? (
                  <div className="bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Statutory Deletion Certificate Issued</span>
                    </div>
                    <p className="text-xs text-[#94A3B8]">
                      All information for <strong className="text-white">{currentUser?.email || 'Current Session'}</strong> has been completely erased.
                    </p>
                    <div className="bg-[#0A0B0D] p-3 rounded-xl border border-emerald-500/30 text-xs font-mono">
                      <div className="text-[#64748B] text-[10px]">Cryptographic Deletion Hash:</div>
                      <div className="text-emerald-400 font-bold break-all">{deletionCert.hash}</div>
                      <div className="text-[#64748B] text-[10px] mt-1">Timestamp: {new Date(deletionCert.timestamp).toUTCString()}</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-[#0A0B0D] border border-rose-500/30 rounded-2xl p-4 space-y-3 text-xs">
                      <div className="flex items-center gap-2 text-rose-400 font-bold">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Scope of Complete Information Erasure</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1.5 text-[#CBD5E1] pl-2 text-[11px]">
                        <li>Full Name, Contact Email, Phone number, and Location identifiers</li>
                        <li>All {userRecords.length} historical civic tax filings and sector budget distributions</li>
                        <li>Citizen policy proposals, comments, and AI impact records</li>
                        <li>Active session tokens, survey consent cookies, and local storage cache</li>
                      </ul>
                    </div>

                    {!showDeleteConfirm ? (
                      <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                        <span className="text-xs text-[#64748B]">Action cannot be undone once confirmed.</span>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-rose-600/25 transition active:scale-95 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete My Information Now</span>
                        </button>
                      </div>
                    ) : (
                      <div className="bg-rose-500/10 border-2 border-rose-500/50 rounded-2xl p-4 space-y-3">
                        <div className="text-xs font-bold text-rose-400">
                          Are you completely sure you want to permanently erase all your data?
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeleting}
                            className="bg-[#1E293B] hover:bg-[#334155] text-white px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleDeleteMyInformation}
                            disabled={isDeleting}
                            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                          >
                            {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            <span>{isDeleting ? 'Erasing Everything...' : 'Confirm Permanent Erasure'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. WITHDRAW CONSENT (Section 6(4) DPDP Act 2023) */}
            {activeTab === 'withdraw' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-base font-serif">
                    <Ban className="w-5 h-5" />
                    <span>Withdraw Consent (Section 6(4) DPDP Act 2023)</span>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    Under the DPDP Act, where consent is the basis for processing personal data, <strong>withdrawal of consent must be as easy as giving consent</strong>. Withdrawing consent immediately halts further civic processing of your survey responses and revokes consent tokens.
                  </p>
                </div>

                {withdrawalRecord ? (
                  <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-5 space-y-3 animate-fadeIn">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Consent Successfully Withdrawn</span>
                    </div>
                    <p className="text-xs text-[#CBD5E1]">
                      Your voluntary processing consent has been revoked under Section 6(4). No further survey modeling, cookie storage, or public aggregations will occur for your profile.
                    </p>
                    <div className="bg-[#0A0B0D] p-3.5 rounded-xl border border-amber-500/30 text-xs font-mono space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Withdrawal Reference:</span>
                        <span className="text-amber-400 font-bold">{withdrawalRecord.withdrawalId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Timestamp:</span>
                        <span className="text-white">{new Date(withdrawalRecord.withdrawnAt).toUTCString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Statutory Ground:</span>
                        <span className="text-emerald-400">{withdrawalRecord.statutoryBasis}</span>
                      </div>
                      <div className="pt-1">
                        <span className="text-[#64748B] block text-[10px]">Verification Audit Hash:</span>
                        <span className="text-slate-300 break-all text-[11px]">{withdrawalRecord.hash}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <span className="text-[#94A3B8]">Want to also purge all past records?</span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('delete')}
                        className="text-rose-400 hover:underline font-semibold cursor-pointer"
                      >
                        Proceed to Delete My Data →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Status Badge */}
                    <div className="bg-[#0A0B0D] border border-[#1E293B] rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <span className="text-xs text-[#64748B] block">Current Statutory Processing Status:</span>
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>{preferences.surveyProcessingConsent ? 'Active Voluntary Consent (Sec 6(1))' : 'Consent Withdrawn (Processing Suspended)'}</span>
                        </span>
                      </div>

                      <div className="text-[11px] text-[#94A3B8] font-mono">
                        Rule 3(2) Informed Notice: Valid
                      </div>
                    </div>

                    {/* Withdrawal Form */}
                    <div className="bg-[#0A0B0D] border border-amber-500/30 rounded-2xl p-5 space-y-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="text-[#CBD5E1] font-semibold">Select Scope of Withdrawal</label>
                        <select
                          value={withdrawalScope}
                          onChange={(e: any) => setWithdrawalScope(e.target.value)}
                          className="w-full bg-[#131E32] border border-[#1E293B] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none"
                        >
                          <option value="all_processing">Withdraw ALL Processing Consent (Complete Suspension)</option>
                          <option value="public_modeling_only">Withdraw from Public Policy Modeling Only (Keep Private Ledger)</option>
                          <option value="cookies_only">Withdraw Cookie Storage Consent Only</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[#CBD5E1] font-semibold">Reason for Withdrawal (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g., No longer participating in civic budget surveys"
                          value={withdrawalReason}
                          onChange={(e) => setWithdrawalReason(e.target.value)}
                          className="w-full bg-[#131E32] border border-[#1E293B] focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white placeholder-[#64748B] text-xs outline-none"
                        />
                      </div>

                      <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed">
                        <strong>Statutory Guarantee under Section 6(4):</strong> The withdrawal of consent shall not affect the lawfulness of processing of personal data based on consent before its withdrawal. You can resume consent at any time in Privacy Preferences.
                      </div>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                      <span className="text-xs text-[#64748B]">Immediate 1-click execution. No phone calls or delays.</span>
                      <button
                        type="button"
                        onClick={handleWithdrawConsent}
                        disabled={isWithdrawing}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        {isWithdrawing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                        <span>{isWithdrawing ? 'Withdrawing...' : 'Withdraw My Consent (1-Click)'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. PRIVACY PREFERENCES */}
            {activeTab === 'preferences' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-base font-serif">
                    <Sliders className="w-5 h-5" />
                    <span>Privacy Preferences & Granular Consent</span>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    Control individual processing components without having to delete your account. Toggles apply immediately to your active session and local storage.
                  </p>
                </div>

                {prefSaveMsg && (
                  <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{prefSaveMsg}</span>
                  </div>
                )}

                <div className="bg-[#0A0B0D] border border-[#1E293B] rounded-2xl divide-y divide-[#1E293B] text-xs">
                  {/* Toggle 1: Survey Processing */}
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>Active Survey Processing Consent (Section 6(1))</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded font-mono">
                          Primary
                        </span>
                      </div>
                      <p className="text-[11px] text-[#94A3B8]">
                        Authorizes processing of your budget percentages for civic tax receipts and tangible outcome models.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePref('surveyProcessingConsent')}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        preferences.surveyProcessingConsent ? 'bg-emerald-500' : 'bg-[#334155]'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          preferences.surveyProcessingConsent ? 'transform translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 2: Cookie Persistence */}
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>Cookie & Preference Persistence (DPDP Rules 2025)</span>
                        <Cookie className="w-3.5 h-3.5 text-[#94A3B8]" />
                      </div>
                      <p className="text-[11px] text-[#94A3B8]">
                        Stores your consent affirmation in first-party browser cookies for 365 days to avoid recurring popups.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePref('cookiePersistenceConsent')}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        preferences.cookiePersistenceConsent ? 'bg-emerald-500' : 'bg-[#334155]'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          preferences.cookiePersistenceConsent ? 'transform translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 3: Anonymized Public Aggregations */}
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>Anonymized Public Dashboard Contribution</span>
                        <Users className="w-3.5 h-3.5 text-[#94A3B8]" />
                      </div>
                      <p className="text-[11px] text-[#94A3B8]">
                        Includes your demographic sector allocations in the real-time national public consensus averages (100% anonymized).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePref('anonymousPublicContribution')}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        preferences.anonymousPublicContribution ? 'bg-emerald-500' : 'bg-[#334155]'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          preferences.anonymousPublicContribution ? 'transform translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 4: Email & Receipt Notifications */}
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-white">Verification & Grievance Communications</div>
                      <p className="text-[11px] text-[#94A3B8]">
                        Permits delivery of cryptographic tax receipts, grievance ticket updates, and statutory DPDP notices to your registered email.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePref('emailReceiptNotifications')}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        preferences.emailReceiptNotifications ? 'bg-emerald-500' : 'bg-[#334155]'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          preferences.emailReceiptNotifications ? 'transform translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  <span>Last updated: {new Date(preferences.lastUpdated).toLocaleDateString('en-IN')}</span>
                  {onGoToComplianceCenter && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onGoToComplianceCenter();
                      }}
                      className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <span>Open Full DPDP Compliance Center</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#131E32] border-t border-[#1E293B] px-6 py-3.5 flex items-center justify-between text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Zero PAN/Aadhaar • 0% Commercial Sharing • Sovereign Citizen Control</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="bg-[#1E293B] hover:bg-[#334155] text-white px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Close Privacy Center
          </button>
        </div>
      </div>
    </div>
  );
};
