import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  User,
  KeyRound,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  AlertCircle,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { CitizenUser } from '../types';
import {
  DEMO_CITIZEN_PROFILES,
  loginCitizen,
  registerCitizen,
} from '../utils/authService';
import { saveSurveyCookieConsent } from '../utils/cookieConsent';
import { PreCollectionPrivacyNotice } from './PreCollectionPrivacyNotice';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: CitizenUser) => void;
  initialTab?: 'demo' | 'login' | 'register';
  redirectMessage?: string;
}

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Delhi NCR',
  'Gujarat',
  'Haryana',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal',
  'Uttarakhand',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialTab = 'demo',
  redirectMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'demo' | 'login' | 'register'>(initialTab);

  // Sign In form state (Email or Phone)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPin, setLoginPin] = useState('1234');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Register form state (DPDP compliant: No PAN, No Aadhaar)
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('1234');
  const [regProfession, setRegProfession] = useState('Senior Consultant');
  const [regState, setRegState] = useState('Karnataka');
  const [regCity, setRegCity] = useState('Bengaluru');
  const [regPincode, setRegPincode] = useState('560001');

  // Mandatory DPDP Act 2023 Consents
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeDpdpConsent, setAgreeDpdpConsent] = useState(false);
  const [agreeAccuracy, setAgreeAccuracy] = useState(false);
  const [activeTermsAccordion, setActiveTermsAccordion] = useState<'terms' | 'growth' | 'accuracy' | null>(null);
  const [regError, setRegError] = useState<string | null>(null);

  // All terms mandatory flag
  const allTermsAgreed = agreeTerms && agreeDpdpConsent && agreeAccuracy;
  const agreedCount = (agreeTerms ? 1 : 0) + (agreeDpdpConsent ? 1 : 0) + (agreeAccuracy ? 1 : 0);

  const handleToggleSelectAllTerms = () => {
    if (allTermsAgreed) {
      setAgreeTerms(false);
      setAgreeDpdpConsent(false);
      setAgreeAccuracy(false);
    } else {
      setAgreeTerms(true);
      setAgreeDpdpConsent(true);
      setAgreeAccuracy(true);
    }
  };

  if (!isOpen) return null;

  const handleDemoSelect = async (demo: CitizenUser) => {
    setIsLoading(true);
    setLoginError(null);
    try {
      const res = await loginCitizen(demo.email);
      if (res.success && res.user) {
        saveSurveyCookieConsent({ userEmail: demo.email, surveyOnlyAffirmed: true, cookieStorageAgreed: true });
        onAuthSuccess(res.user);
        onClose();
      } else {
        setLoginError(res.error || 'Login failed');
      }
    } catch (e: any) {
      setLoginError(e.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setLoginError('Please enter your registered Email address or Phone Number.');
      return;
    }
    setIsLoading(true);
    setLoginError(null);

    try {
      const res = await loginCitizen(loginIdentifier, loginPin);
      if (res.success && res.user) {
        saveSurveyCookieConsent({ userEmail: res.user.email, surveyOnlyAffirmed: true, cookieStorageAgreed: true });
        onAuthSuccess(res.user);
        onClose();
      } else {
        setLoginError(res.error || 'Invalid credentials or participant profile not found.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Failed to sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regEmail.trim()) {
      setRegError('Full Name and Email address are required.');
      return;
    }

    if (!agreeTerms || !agreeDpdpConsent || !agreeAccuracy) {
      setRegError('You must explicitly review and accept all 3 DPDP Act 2023 statutory consent agreements before registering.');
      return;
    }

    setIsLoading(true);
    setRegError(null);

    try {
      const res = await registerCitizen({
        fullName: regFullName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        profession: regProfession,
        state: regState,
        city: regCity,
        pincode: regPincode,
        termsAccepted: true,
        dataSharingConsent: true,
        dpdpConsentGranted: true,
        accuracyDeclaration: true,
      });

      if (res.success && res.user) {
        saveSurveyCookieConsent({ userEmail: regEmail.trim(), surveyOnlyAffirmed: true, cookieStorageAgreed: true });
        onAuthSuccess(res.user);
        onClose();
      } else {
        setRegError(res.error || 'Registration failed.');
      }
    } catch (err: any) {
      setRegError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" id="auth-modal-overlay">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#1E293B] bg-gradient-to-r from-[#131E32] to-[#0F172A] flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DPDP Act 2023 & Rules 2025 Compliant</span>
            </div>
            <h2 className="text-xl font-bold font-serif text-white">
              Access Your Survey Profile & Civic Insights
            </h2>
            <p className="text-xs text-[#94A3B8]">
              {redirectMessage ||
                'Sign in with your Email or Mobile Phone to record civic budget priorities, track sector consensus, and download your participatory certificate.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white p-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] transition cursor-pointer"
            title="Close and return to Global Dashboard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#1E293B] bg-[#0A0B0D] px-6 pt-3 gap-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setActiveTab('demo');
              setLoginError(null);
              setRegError(null);
            }}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'demo'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Demo Profiles</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setLoginError(null);
              setRegError(null);
            }}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'login'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Sign In (Email / Phone)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setLoginError(null);
              setRegError(null);
            }}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Create Participant Profile</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: QUICK DEMO PROFILES */}
          {activeTab === 'demo' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Select a sample citizen participant to explore survey responses:</span>
                <span className="text-[11px] text-emerald-400 font-semibold">1-Click Instant Access</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEMO_CITIZEN_PROFILES.map((prof) => (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => handleDemoSelect(prof)}
                    disabled={isLoading}
                    className="p-4 rounded-2xl bg-[#0A0B0D] border border-[#1E293B] hover:border-emerald-500/50 hover:bg-[#131E32] transition text-left group flex flex-col justify-between space-y-3 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center font-bold text-xs">
                          {prof.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                            {prof.fullName}
                          </div>
                          <div className="text-[10px] text-[#94A3B8]">{prof.profession}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        DPDP Verified
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#1E293B]">
                      <span className="text-[#94A3B8]">{prof.city}, {prof.state}</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {prof.filingCount || 1} Survey{prof.filingCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SIGN IN WITH EMAIL OR PHONE */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md mx-auto">
              {loginError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#E2E8F0] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Registered Email or Mobile Phone Number</span>
                </label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. mukeshsingh.negi07@gmail.com or 9876543210"
                  className="w-full bg-[#0A0B0D] border border-[#1E293B] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#64748B] focus:border-emerald-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#E2E8F0] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Security PIN / Password</span>
                </label>
                <input
                  type="password"
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  placeholder="Enter your PIN"
                  className="w-full bg-[#0A0B0D] border border-[#1E293B] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#64748B] focus:border-emerald-500 focus:outline-none font-mono"
                />
                <span className="text-[10px] text-[#64748B] block">
                  Default demo PIN: 1234
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'Authenticating...' : 'Sign In to Survey Profile'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: REGISTER NEW CITIZEN PROFILE (DPDP MINIMAL DATA) */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {regError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <PreCollectionPrivacyNotice compact={true} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#E2E8F0]">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full bg-[#0A0B0D] border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#E2E8F0]">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. ramesh@example.com"
                    className="w-full bg-[#0A0B0D] border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#E2E8F0]">Mobile Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-[#0A0B0D] border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#E2E8F0]">Profession</label>
                  <input
                    type="text"
                    value={regProfession}
                    onChange={(e) => setRegProfession(e.target.value)}
                    placeholder="e.g. Healthcare Specialist / Consultant"
                    className="w-full bg-[#0A0B0D] border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#E2E8F0]">State</label>
                  <select
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    className="w-full bg-[#0A0B0D] border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#E2E8F0]">City</label>
                  <input
                    type="text"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full bg-[#0A0B0D] border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-[#E2E8F0] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Security PIN / Password (4+ digits)</span>
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a 4-digit PIN (e.g. 1234)"
                    className="w-full bg-[#0A0B0D] border border-[#1E293B] rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-[#64748B] block">
                    Used to authenticate your future logins on this civic terminal.
                  </span>
                </div>
              </div>

              {/* MANDATORY DPDP ACT 2023 CONSENT AGREEMENTS */}
              <div className="bg-[#131E32] border border-emerald-500/40 rounded-2xl p-4.5 space-y-3.5 shadow-inner">
                <div className="flex items-center justify-between pb-2 border-b border-[#1E293B] flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      DPDP Act 2023 Statutory Consents
                    </span>
                  </div>
                  
                  {/* Select All Toggle */}
                  <button
                    type="button"
                    onClick={handleToggleSelectAllTerms}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold underline cursor-pointer"
                  >
                    {allTermsAgreed ? 'Deselect All' : 'Agree to All (3/3)'}
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Agreement 1: Non-Government Civic Survey & Privacy Notice */}
                  <div className={`p-3 rounded-xl border transition ${
                    agreeTerms
                      ? 'bg-[#0A0B0D]/80 border-emerald-500/40'
                      : 'bg-[#0A0B0D]/40 border-[#1E293B] hover:border-[#334155]'
                  }`}>
                    <div className="flex items-start gap-3">
                      <input
                        id="terms-checkbox-1"
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-emerald-500 text-emerald-500 focus:ring-emerald-500 bg-[#0A0B0D] cursor-pointer accent-emerald-500 shrink-0"
                      />
                      <div className="flex-1">
                        <label htmlFor="terms-checkbox-1" className="text-xs text-white leading-snug cursor-pointer select-none block">
                          <span className="font-bold text-emerald-400">1. Survey-Only Purpose & Cookie Storage Consent *</span>
                          <span className="text-[#94A3B8] block text-[11px] mt-0.5">
                            I understand this is strictly an independent civic survey, not for any personal or government use. I accept the survey terms and agree to store my consent in browser cookies.
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setActiveTermsAccordion(activeTermsAccordion === 'terms' ? null : 'terms')}
                          className="mt-1 text-[10px] text-emerald-400/80 hover:text-emerald-300 underline font-medium cursor-pointer"
                        >
                          {activeTermsAccordion === 'terms' ? 'Hide Details' : 'Read Notice Summary'}
                        </button>

                        {activeTermsAccordion === 'terms' && (
                          <div className="mt-2 text-[10px] text-[#94A3B8] bg-[#0F172A] p-2.5 rounded-lg border border-[#1E293B] space-y-1">
                            <p>• <strong>Data Fiduciary Purpose:</strong> Independent research on citizen fiscal prioritization and public sentiment.</p>
                            <p>• <strong>Rights under Section 11-13:</strong> Right to access, rectify, and withdraw consent at any time.</p>
                            <p>• <strong>Contact:</strong> Data Protection Officer reachable at mukeshsingh.negi07@gmail.com.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Agreement 2: Anonymized Consensus & Public Policy Research Consent */}
                  <div className={`p-3 rounded-xl border transition ${
                    agreeDpdpConsent
                      ? 'bg-[#0A0B0D]/80 border-emerald-500/40'
                      : 'bg-[#0A0B0D]/40 border-[#1E293B] hover:border-[#334155]'
                  }`}>
                    <div className="flex items-start gap-3">
                      <input
                        id="terms-checkbox-2"
                        type="checkbox"
                        checked={agreeDpdpConsent}
                        onChange={(e) => setAgreeDpdpConsent(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-emerald-500 text-emerald-500 focus:ring-emerald-500 bg-[#0A0B0D] cursor-pointer accent-emerald-500 shrink-0"
                      />
                      <div className="flex-1">
                        <label htmlFor="terms-checkbox-2" className="text-xs text-white leading-snug cursor-pointer select-none block">
                          <span className="font-bold text-emerald-400">2. Free & Informed Consent for Public Policy Research *</span>
                          <span className="text-[#94A3B8] block text-[11px] mt-0.5">
                            Under Section 6 of DPDP Act 2023, I freely give unconditional consent to process and publish anonymized sector allocations for civic transparency.
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setActiveTermsAccordion(activeTermsAccordion === 'growth' ? null : 'growth')}
                          className="mt-1 text-[10px] text-emerald-400/80 hover:text-emerald-300 underline font-medium cursor-pointer"
                        >
                          {activeTermsAccordion === 'growth' ? 'Hide Details' : 'What is processed?'}
                        </button>

                        {activeTermsAccordion === 'growth' && (
                          <div className="mt-2 text-[10px] text-[#94A3B8] bg-[#0F172A] p-2.5 rounded-lg border border-[#1E293B] space-y-1">
                            <p>• <strong>Aggregated Data:</strong> Sector percentages (e.g., Healthcare 30%, Education 25%) and general city/state.</p>
                            <p>• <strong>No Identity Exposure:</strong> Personal identifiers (Email, Phone) are never published in open dataset releases.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Agreement 3: Declaration of Genuine Participation */}
                  <div className={`p-3 rounded-xl border transition ${
                    agreeAccuracy
                      ? 'bg-[#0A0B0D]/80 border-emerald-500/40'
                      : 'bg-[#0A0B0D]/40 border-[#1E293B] hover:border-[#334155]'
                  }`}>
                    <div className="flex items-start gap-3">
                      <input
                        id="terms-checkbox-3"
                        type="checkbox"
                        checked={agreeAccuracy}
                        onChange={(e) => setAgreeAccuracy(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-emerald-500 text-emerald-500 focus:ring-emerald-500 bg-[#0A0B0D] cursor-pointer accent-emerald-500 shrink-0"
                      />
                      <div className="flex-1">
                        <label htmlFor="terms-checkbox-3" className="text-xs text-white leading-snug cursor-pointer select-none block">
                          <span className="font-bold text-emerald-400">3. Declaration of Genuine Participation *</span>
                          <span className="text-[#94A3B8] block text-[11px] mt-0.5">
                            I declare that I am participating in good faith and that the survey opinions submitted accurately represent my civic priorities.
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Status */}
                <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px]">
                  <span className="text-[#94A3B8]">
                    Consents Status: <strong className={allTermsAgreed ? 'text-emerald-400' : 'text-amber-400'}>{agreedCount} of 3 Accepted</strong>
                  </span>

                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    allTermsAgreed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {allTermsAgreed ? '✓ All Consents Granted' : '⚠ 3 Consents Required'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !allTermsAgreed}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                <span>
                  {isLoading
                    ? 'Creating & Authenticating Profile...'
                    : !allTermsAgreed
                    ? `Grant All 3 Consents to Register (${agreedCount}/3)`
                    : 'Create DPDP Verified Profile & Sign In'}
                </span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Privacy Note */}
          <div className="bg-[#0A0B0D] border border-[#1E293B] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#94A3B8]">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>DPDP Act Compliance:</strong> Independent civic survey initiative. No PAN or Aadhaar data is processed or stored. Individual submissions are sealed with cryptographic verification hashes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
