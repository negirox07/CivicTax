import React, { useState, useRef, useEffect } from 'react';
import {
  Landmark,
  FileText,
  LayoutDashboard,
  BarChart3,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  Sparkles,
  Globe2,
  Cloud,
  HardDrive,
  User,
  LogOut,
  ChevronDown,
  KeyRound,
  Lock,
  UserCheck,
  Info,
  Shield,
  ShieldAlert,
} from 'lucide-react';
import { TaxRecord, CitizenUser } from '../types';
import { formatCompactINR, getTaxpayerTier, maskPAN } from '../utils/formatters';
import { DEMO_CITIZEN_PROFILES } from '../utils/authService';

export type AppNavTab = 'global' | 'filing' | 'dashboard' | 'reports' | 'transparency' | 'about' | 'privacy';

const ADMIN_EMAIL = 'mukeshsingh.negi07@gmail.com';

interface HeaderProps {
  activeTab: AppNavTab;
  setActiveTab: (tab: AppNavTab) => void;
  userRecords: TaxRecord[];
  allRecords: TaxRecord[];
  currentUser: CitizenUser | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onSelectCitizen: (user: CitizenUser) => void;
  onResetData: () => void;
  onNewFiling: () => void;
  onOpenSupabaseModal?: () => void;
  dataSource?: 'SUPABASE' | 'LOCAL_STORAGE';
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userRecords,
  allRecords,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onSelectCitizen,
  onResetData,
  onNewFiling,
  onOpenSupabaseModal,
  dataSource = 'LOCAL_STORAGE',
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if current user is admin
  const isAdmin = currentUser?.email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalUserTax = userRecords.reduce((acc, r) => acc + (Number(r.taxPaid) || 0), 0);
  const userTier = getTaxpayerTier(totalUserTax);

  return (
    <header className="bg-[#0F172A] border-b border-[#1E293B] text-[#E2E8F0] sticky top-0 z-40 shadow-lg" id="app-header-nav">
      {/* Top Notification / Transparency Banner */}
      <div className="bg-[#0A0B0D] px-4 py-1.5 text-xs text-[#94A3B8] border-b border-[#1E293B] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-[#E2E8F0]">National Citizen Tax Allocation & Public Governance Initiative</span>
          <span className="hidden md:inline text-[#64748B]">• Directing citizen tax capital into verified public growth</span>
        </div>

        <div className="flex items-center gap-3 text-[#94A3B8] text-xs">
          {/* DB:Syncup badge is ONLY visible to admin (mukeshsingh.negi07@gmail.com) */}
          {isAdmin && onOpenSupabaseModal && (
            <button
              type="button"
              onClick={onOpenSupabaseModal}
              title="Admin Only: View Supabase connection status, sync records, or copy SQL schema"
              className={`inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-0.5 rounded border transition active:scale-95 cursor-pointer ${
                dataSource === 'SUPABASE'
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              }`}
            >
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              {dataSource === 'SUPABASE' ? <Cloud className="w-3 h-3" /> : <HardDrive className="w-3 h-3" />}
              <span>Admin DB: {dataSource === 'SUPABASE' ? 'Supabase' : 'Local'}</span>
              <span className="text-[10px] text-slate-400 opacity-70">(Sync)</span>
            </button>
          )}

          {currentUser ? (
            <span className="inline-flex items-center gap-1.5 bg-[#1E293B] border border-[#334155] px-2.5 py-0.5 rounded text-[#E2E8F0] font-mono text-[11px]">
              <UserCheck className="w-3 h-3 text-emerald-400" />
              <span>Signed In: <strong className="text-white font-sans">{currentUser.fullName}</strong></span>
              {isAdmin && (
                <span className="text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded border border-amber-500/30">
                  Admin
                </span>
              )}
              <span className="text-[#94A3B8] text-[10px]">({maskPAN(currentUser.panNumber)})</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-400/90 text-[11px]">
              <Globe2 className="w-3 h-3" />
              <span>Public Guest Mode</span>
            </span>
          )}

          <span className="text-emerald-400 font-semibold hidden sm:flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit Cryptographic Ledger
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab('global')}
            title="Go to National Public Dashboard Landing Page"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold">
              <Landmark className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-serif">CivicTax</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Public Ledger
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] hidden sm:block">
                Citizen Budget Allocation & Public Interest Intelligence
              </p>
            </div>
          </div>

          {/* User Quick Stats Pill (When Logged In) */}
          {currentUser && (
            <div className="hidden lg:flex items-center gap-3 bg-[#1E293B] border border-[#334155] rounded-xl px-3.5 py-1.5 text-xs">
              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">Your Tracked Tax</span>
                <span className="text-emerald-400 font-bold text-sm font-mono">{formatCompactINR(totalUserTax)}</span>
              </div>
              <div className="h-6 w-px bg-[#334155]"></div>
              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">Your Filings</span>
                <span className="text-[#E2E8F0] font-bold text-sm">{userRecords.length} Years</span>
              </div>
              <div className="h-6 w-px bg-[#334155]"></div>
              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">Civic Tier</span>
                <span className="text-amber-400 font-semibold">{userTier.tierName.split(' ')[0]}</span>
              </div>
            </div>
          )}

          {/* Action Buttons & Auth Profile */}
          <div className="flex items-center gap-2.5">
            <button
              id="header-file-new-year-btn"
              onClick={onNewFiling}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>File & Allocate</span>
            </button>

            {/* Auth Button or Profile Dropdown */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  id="header-profile-menu-btn"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-white px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <span className="font-semibold max-w-[100px] sm:max-w-[130px] truncate">
                    {currentUser.fullName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl p-3 z-50 space-y-3 animate-fadeIn">
                    <div className="p-2 border-b border-[#1E293B]">
                      <div className="font-bold text-xs text-white">{currentUser.fullName}</div>
                      <div className="text-[11px] text-[#94A3B8]">{currentUser.email}</div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-[#64748B]">
                        <span>PAN: <strong className="font-mono text-slate-300">{maskPAN(currentUser.panNumber)}</strong></span>
                        <span className="text-emerald-400 font-semibold">{userRecords.length} Filings</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] px-2">
                        Switch Citizen Profile
                      </div>
                      {DEMO_CITIZEN_PROFILES.filter((p) => p.email !== currentUser.email).map((demo) => (
                        <button
                          key={demo.id}
                          type="button"
                          onClick={() => {
                            onSelectCitizen(demo);
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-[#1E293B] text-[#E2E8F0] hover:text-emerald-400 flex items-center justify-between transition cursor-pointer"
                        >
                          <div className="truncate">
                            <span className="font-medium">{demo.fullName}</span>
                            <span className="text-[10px] text-[#94A3B8] block">{demo.city}</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {demo.filingCount || 1}y
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onResetData();
                        }}
                        className="text-[11px] text-[#94A3B8] hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1E293B] transition cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reset Data</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onLogout();
                        }}
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-500/10 transition cursor-pointer"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="header-sign-in-btn"
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 bg-[#1E293B] hover:bg-[#334155] border border-emerald-500/40 text-emerald-400 px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-sm"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Citizen Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex items-center gap-1 sm:gap-2 mt-3 pt-2 border-t border-[#1E293B] overflow-x-auto scrollbar-none">
          <button
            id="nav-tab-global-btn"
            onClick={() => setActiveTab('global')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'global'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-xs'
                : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B]/70'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>Public Global Dashboard</span>
            <span className="bg-[#1E293B] text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full border border-[#334155]">
              {allRecords.length}
            </span>
          </button>

          <button
            id="nav-tab-filing-btn"
            onClick={() => setActiveTab('filing')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'filing'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-xs'
                : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B]/70'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>File & Allocate</span>
            {!currentUser && <Lock className="w-3 h-3 text-[#64748B]" />}
          </button>

          <button
            id="nav-tab-dashboard-btn"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-xs'
                : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B]/70'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>My Filings</span>
            {currentUser ? (
              <span className="bg-emerald-500/20 text-emerald-400 font-mono text-[10px] px-1.5 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                {userRecords.length}
              </span>
            ) : (
              <Lock className="w-3 h-3 text-[#64748B]" />
            )}
          </button>

          <button
            id="nav-tab-reports-btn"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-xs'
                : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B]/70'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>PDF Reports</span>
            {!currentUser && <Lock className="w-3 h-3 text-[#64748B]" />}
          </button>

          <button
            id="nav-tab-transparency-btn"
            onClick={() => setActiveTab('transparency')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'transparency'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-xs'
                : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B]/70'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Fiscal Consensus Matrix</span>
          </button>

          <button
            id="nav-tab-about-btn"
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'about'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-xs'
                : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B]/70'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>About Us</span>
          </button>

          <button
            id="nav-tab-privacy-btn"
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-xs'
                : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B]/70'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Privacy Policy</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
