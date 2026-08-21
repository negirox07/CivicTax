import React, { useState, useEffect, useCallback } from 'react';
import { Header, AppNavTab } from './components/Header';
import { GlobalDashboardView } from './components/GlobalDashboardView';
import { TaxFilingForm } from './components/TaxFilingForm';
import { DashboardView } from './components/DashboardView';
import { PdfReportsView } from './components/PdfReportsView';
import { CivicTransparencyView } from './components/CivicTransparencyView';
import { AboutUsView } from './components/AboutUsView';
import { PrivacyPolicyView } from './components/PrivacyPolicyView';
import { DPDPComplianceCenterView } from './components/DPDPComplianceCenterView';
import { CertificateModal } from './components/CertificateModal';
import { AuthModal } from './components/AuthModal';
import { AuthGate } from './components/AuthGate';
import { SupabaseSetupModal } from './components/SupabaseSetupModal';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { SurveyTermsModal } from './components/SurveyTermsModal';
import { AccountPrivacyModal, PrivacyTab } from './components/AccountPrivacyModal';
import { AdUnit } from './components/AdUnit';
import { TaxRecord, CitizenUser } from './types';
import {
  fetchAllTaxRecords,
  persistTaxRecord,
  removeTaxRecord,
} from './utils/dataService';
import { resetToSampleData } from './utils/storage';
import { generateTaxCertificatePdf } from './utils/pdfExport';
import {
  getStoredCurrentUser,
  setStoredCurrentUser,
  filterRecordsForCitizen,
} from './utils/authService';
import { Landmark, ShieldCheck, Mail, Github, HeartHandshake, Ban, Trash2, Sliders, Download } from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<TaxRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<CitizenUser | null>(() => getStoredCurrentUser());
  const [activeTab, setActiveTab] = useState<AppNavTab>('global');
  const [editingRecord, setEditingRecord] = useState<TaxRecord | null>(null);
  const [inspectedRecord, setInspectedRecord] = useState<TaxRecord | null>(null);
  const [dataSource, setDataSource] = useState<'SUPABASE' | 'LOCAL_STORAGE'>('LOCAL_STORAGE');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'demo' | 'login' | 'register'>('demo');
  const [authRedirectMessage, setAuthRedirectMessage] = useState<string | undefined>(undefined);

  // Supabase Setup & Schema Modal state
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);

  // Survey & DPDP Terms Modal state
  const [isSurveyTermsModalOpen, setIsSurveyTermsModalOpen] = useState<boolean>(false);

  // Account Privacy & Consent Modal state (DPDP Sec 6(4), 11, 12)
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [privacyModalInitialTab, setPrivacyModalInitialTab] = useState<PrivacyTab>('withdraw');

  const handleOpenPrivacyModal = (tab: PrivacyTab = 'withdraw') => {
    setPrivacyModalInitialTab(tab);
    setIsPrivacyModalOpen(true);
  };

  // Load records from Supabase (or local fallback)
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchAllTaxRecords();
      setRecords(res.records);
      setDataSource(res.source);
    } catch (err) {
      console.error('Failed to load tax records:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter personal records for currently logged-in citizen
  const userRecords = filterRecordsForCitizen(records, currentUser);

  // Save or update a record
  const handleSaveRecord = async (record: TaxRecord) => {
    const res = await persistTaxRecord(record);
    setRecords(res.updatedRecords);
    setEditingRecord(null);

    // If not logged in or email/pan matches submitted record, auto-log in as this taxpayer
    if (!currentUser) {
      const citizenUser: CitizenUser = {
        id: `usr_${Date.now()}`,
        fullName: record.fullName,
        email: record.email,
        phone: record.phone,
        profession: record.profession,
        state: record.state,
        city: record.city,
        pincode: record.pincode,
        dpdpConsentGranted: true,
        dpdpNoticeVersion: 'DPDP-ACT-2023-RULES-2025-v1.0',
      };
      setCurrentUser(citizenUser);
      setStoredCurrentUser(citizenUser);
    }
  };

  // Delete a record
  const handleDeleteRecord = async (id: string) => {
    const res = await removeTaxRecord(id);
    setRecords(res.updatedRecords);
  };

  // Reset to initial sample records
  const handleResetData = () => {
    if (window.confirm('Reset local dataset to pre-loaded multi-citizen sample tax records?')) {
      const samples = resetToSampleData();
      setRecords(samples);
      setEditingRecord(null);
      setActiveTab('global');
    }
  };

  // Trigger New Filing (Requires Login)
  const handleNewFiling = () => {
    if (!currentUser) {
      handleOpenAuthModal(
        'login',
        'Citizen login required: Please sign in or register to submit tax returns and direct your budget allocations.'
      );
      setActiveTab('filing');
      return;
    }
    setEditingRecord(null);
    setActiveTab('filing');
  };

  // Trigger Edit (Requires Login)
  const handleSelectEdit = (record: TaxRecord) => {
    if (!currentUser) {
      handleOpenAuthModal('login', 'Please sign in to edit your tax records.');
      return;
    }
    setEditingRecord(record);
    setActiveTab('filing');
  };

  // Trigger PDF Download
  const handleDownloadPdf = async (record: TaxRecord) => {
    await generateTaxCertificatePdf(record);
  };

  // Auth Handlers
  const handleOpenAuthModal = (tab: 'demo' | 'login' | 'register' = 'demo', message?: string) => {
    setAuthModalTab(tab);
    setAuthRedirectMessage(message);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: CitizenUser) => {
    setCurrentUser(user);
    setStoredCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setStoredCurrentUser(null);
  };

  const handleSelectCitizenProfile = (user: CitizenUser) => {
    setCurrentUser(user);
    setStoredCurrentUser(user);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#E2E8F0] flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'filing') {
            setEditingRecord(null);
          }
        }}
        userRecords={userRecords}
        allRecords={records}
        currentUser={currentUser}
        onOpenAuthModal={() => handleOpenAuthModal('demo')}
        onLogout={handleLogout}
        onSelectCitizen={handleSelectCitizenProfile}
        onResetData={handleResetData}
        onNewFiling={handleNewFiling}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenPrivacyModal={handleOpenPrivacyModal}
        dataSource={dataSource}
      />

      {/* AdSense: leaderboard placement, top of page content */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AdUnit adSlot="6462664625" adFormat="auto" fullWidthResponsive />
      </div>

      {/* Main View Router */}
      <main className="flex-1">
        {/* LANDING PAGE: Global Public Dashboard (VISIBLE TO ALL) */}
        {activeTab === 'global' && (
          <GlobalDashboardView
            records={records}
            currentUser={currentUser}
            userRecordCount={userRecords.length}
            onOpenAuthModal={() => handleOpenAuthModal('demo')}
            onStartFiling={handleNewFiling}
            onGoToPersonalDashboard={() => {
              if (currentUser) {
                setActiveTab('dashboard');
              } else {
                handleOpenAuthModal('login', 'Please sign in to access your personal historical filings.');
              }
            }}
            onGoToReports={() => {
              if (currentUser) {
                setActiveTab('reports');
              } else {
                handleOpenAuthModal('login', 'Please sign in to view and download your verified PDF certificates.');
              }
            }}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
            dataSource={dataSource}
            onReloadData={loadData}
          />
        )}

        {/* INDIVIDUAL TAX FILING & ALLOCATION FORM (PROTECTED - REQUIRES LOGIN) */}
        {activeTab === 'filing' && (
          currentUser ? (
            <TaxFilingForm
              initialData={editingRecord}
              currentUser={currentUser}
              onSaveRecord={handleSaveRecord}
              onGoToDashboard={() => setActiveTab('dashboard')}
              onDownloadPdf={handleDownloadPdf}
            />
          ) : (
            <AuthGate
              targetFeatureName="Participatory Tax Filing & Budget Allocation"
              onOpenLoginModal={() =>
                handleOpenAuthModal(
                  'login',
                  'Citizen login required: Please sign in or register to submit your tax returns and direct budget allocations.'
                )
              }
              onSelectDemoUser={handleAuthSuccess}
              onGoToGlobalDashboard={() => setActiveTab('global')}
            />
          )
        )}

        {/* CITIZEN PERSONAL MULTI-YEAR FILINGS DASHBOARD (PROTECTED - VISIBLE AFTER LOGIN) */}
        {activeTab === 'dashboard' && (
          currentUser ? (
            <DashboardView
              records={userRecords}
              onSelectEdit={handleSelectEdit}
              onDeleteRecord={handleDeleteRecord}
              onDownloadPdf={handleDownloadPdf}
              onNewFiling={handleNewFiling}
              onViewCertModal={(rec) => setInspectedRecord(rec)}
              onOpenPrivacyModal={handleOpenPrivacyModal}
              onGoToComplianceCenter={() => setActiveTab('compliance')}
            />
          ) : (
            <AuthGate
              targetFeatureName="Personal Tax Filings Ledger"
              onOpenLoginModal={() => handleOpenAuthModal('login', 'Sign in to access your private multi-year tax records.')}
              onSelectDemoUser={handleAuthSuccess}
              onGoToGlobalDashboard={() => setActiveTab('global')}
            />
          )
        )}

        {/* PDF REPORTS & VERIFICATION CENTER (PROTECTED - VISIBLE AFTER LOGIN) */}
        {activeTab === 'reports' && (
          currentUser ? (
            <PdfReportsView
              records={userRecords}
              onNewFiling={handleNewFiling}
            />
          ) : (
            <AuthGate
              targetFeatureName="Verified PDF Reports & Certificates"
              onOpenLoginModal={() => handleOpenAuthModal('login', 'Sign in to generate official tax allocation certificates.')}
              onSelectDemoUser={handleAuthSuccess}
              onGoToGlobalDashboard={() => setActiveTab('global')}
            />
          )
        )}

        {/* CIVIC TRANSPARENCY & FISCAL MATRIX (PUBLIC - VISIBLE TO ALL) */}
        {activeTab === 'transparency' && <CivicTransparencyView />}

        {/* ABOUT US & CONNECT VIEW (PUBLIC - VISIBLE TO ALL) */}
        {activeTab === 'about' && (
          <AboutUsView
            onStartFiling={handleNewFiling}
            onGoToGlobalDashboard={() => setActiveTab('global')}
          />
        )}

        {/* DPDP COMPLIANCE CENTER & CITIZEN DATA RIGHTS (PUBLIC - VISIBLE TO ALL) */}
        {activeTab === 'compliance' && (
          <DPDPComplianceCenterView
            currentUser={currentUser}
            userRecords={userRecords}
            allRecords={records}
            onOpenAuthModal={() =>
              handleOpenAuthModal(
                'login',
                'Sign in to review your personal data ledger and exercise data principal rights.'
              )
            }
            onGoToFiling={handleNewFiling}
            onGoToGlobalDashboard={() => setActiveTab('global')}
            onRecordsDeleted={(remaining) => {
              setRecords(remaining);
              setEditingRecord(null);
            }}
            onUserLoggedOut={() => {
              setCurrentUser(null);
              setStoredCurrentUser(null);
            }}
            onOpenPrivacyModal={handleOpenPrivacyModal}
          />
        )}

        {/* PRIVACY POLICY & DATA GOVERNANCE VIEW (PUBLIC - VISIBLE TO ALL) */}
        {activeTab === 'privacy' && (
          <PrivacyPolicyView
            onStartFiling={handleNewFiling}
            onGoToGlobalDashboard={() => setActiveTab('global')}
            onGoToComplianceCenter={() => setActiveTab('compliance')}
          />
        )}
      </main>

      {/* AdSense: relaxed/multiplex placement, end of page content */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-2">
        <AdUnit adSlot="9351612491" adFormat="autorelaxed" />
      </div>

      {/* Certificate Modal */}
      <CertificateModal
        record={inspectedRecord}
        onClose={() => setInspectedRecord(null)}
      />

      {/* Citizen Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialTab={authModalTab}
        redirectMessage={authRedirectMessage}
      />

      {/* Supabase Schema & Setup Modal */}
      <SupabaseSetupModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onSyncSuccess={() => {
          loadData();
        }}
      />

      {/* Survey Terms & Cookie Consent Modal */}
      <SurveyTermsModal
        isOpen={isSurveyTermsModalOpen}
        onClose={() => setIsSurveyTermsModalOpen(false)}
        onAccept={() => setIsSurveyTermsModalOpen(false)}
      />

      {/* Account > Privacy Modal (DPDP Act 2023 Sec 6(4), 11, 12) */}
      <AccountPrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        currentUser={currentUser}
        userRecords={userRecords}
        allRecords={records}
        initialTab={privacyModalInitialTab}
        onRecordsDeleted={(remaining) => {
          setRecords(remaining);
          setEditingRecord(null);
        }}
        onUserLoggedOut={() => {
          setCurrentUser(null);
          setStoredCurrentUser(null);
        }}
        onGoToComplianceCenter={() => {
          setIsPrivacyModalOpen(false);
          setActiveTab('compliance');
        }}
      />

      {/* Persistent Bottom Cookie & Survey Consent Banner */}
      <CookieConsentBanner
        onOpenFullTerms={() => setIsSurveyTermsModalOpen(true)}
      />

      {/* Footer */}
      <footer className="bg-[#0F172A] text-[#94A3B8] border-t border-[#1E293B] py-8 px-4 sm:px-6 lg:px-8 mt-12 text-xs" id="app-footer">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[#94A3B8]">
              <Landmark className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-[#E2E8F0]">CivicTax</span>
              <span className="hidden sm:inline">— Independent Citizen Tax Allocation & Participatory Budgeting Platform</span>
            </div>

            <div className="flex items-center gap-4 text-xs flex-wrap justify-center">
              <button
                type="button"
                onClick={() => handleOpenPrivacyModal('withdraw')}
                className="transition text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30"
                title="Withdraw Consent (DPDP Act Sec 6(4))"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Withdraw Consent</span>
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleOpenPrivacyModal('delete')}
                className="transition text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
                title="Delete My Data (Right to Erasure)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete My Data</span>
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setIsSurveyTermsModalOpen(true)}
                className="transition text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                title="View Survey Terms & Manage Cookie Preferences"
              >
                <span>🍪 Cookie Terms</span>
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setActiveTab('compliance')}
                className={`transition hover:text-emerald-400 font-semibold flex items-center gap-1 cursor-pointer ${
                  activeTab === 'compliance' ? 'text-emerald-400 font-bold underline underline-offset-4' : 'text-emerald-400/90'
                }`}
                title="Open DPDP Compliance Center (Data Inventory & Erasure Rights)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>DPDP Center</span>
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setActiveTab('privacy')}
                className={`transition hover:text-emerald-400 cursor-pointer ${
                  activeTab === 'privacy' ? 'text-emerald-400 font-bold underline underline-offset-4' : 'text-[#94A3B8]'
                }`}
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setActiveTab('global')}
                className={`transition hover:text-emerald-400 cursor-pointer ${
                  activeTab === 'global' ? 'text-emerald-400 font-bold' : 'text-[#94A3B8]'
                }`}
              >
                Consensus Ledger
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setActiveTab('transparency')}
                className={`transition hover:text-emerald-400 cursor-pointer ${
                  activeTab === 'transparency' ? 'text-emerald-400 font-bold' : 'text-[#94A3B8]'
                }`}
              >
                Fiscal Matrix
              </button>
            </div>
          </div>

          {/* Statutory Non-Governmental Platform Disclaimer Box */}
          <div className="bg-[#0A0B0D] border border-[#1E293B] rounded-2xl p-4 sm:p-5 text-left space-y-2">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs flex-wrap">
              <span className="bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono text-[10px] border border-slate-700">
                Independent Civic Technology Platform
              </span>
              <span className="text-[#64748B]">•</span>
              <span className="text-amber-400/90 font-medium text-[11px]">
                Not a Government Website
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              <strong>Statutory Disclosure & Non-Affiliation Notice:</strong> This platform is independently operated and is not affiliated with, authorized by, or endorsed by the Government of India, the Ministry of Finance, the Income Tax Department, Central Board of Direct Taxes (CBDT), any State Government, Municipal Corporation, or statutory tax authority. This website is an independent civic research and participatory budgeting simulation tool. It does not collect official taxes, file statutory Income Tax Returns (ITR), or provide legal or tax advice. All survey data is used strictly for civic policy insights, public consensus modeling, and educational research.
            </p>
          </div>

          <div className="pt-2 border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#64748B]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>256-Bit Masked Privacy Safe</span>
              </span>
              <span>•</span>
              <span>SHA-256 Ledger Seals</span>
              <span>•</span>
              <span>Supabase Production Storage Ready</span>
            </div>

            <div className="flex items-center gap-3 text-slate-400 font-mono">
              <a
                href="mailto:mukeshsingh.negi07@gmail.com"
                className="hover:text-emerald-400 transition cursor-pointer"
              >
                mukeshsingh.negi07@gmail.com
              </a>
              <span>|</span>
              <a
                href="https://github.com/negirox"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sky-400 transition cursor-pointer"
              >
                github.com/negirox
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
