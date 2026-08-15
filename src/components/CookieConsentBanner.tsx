import React, { useState, useEffect } from 'react';
import {
  Cookie,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  Info,
  Lock,
  Sparkles,
} from 'lucide-react';
import {
  getSurveyCookieConsent,
  saveSurveyCookieConsent,
  SurveyCookieConsent,
  SURVEY_CONSENT_COOKIE_NAME,
  SURVEY_CONSENT_VERSION,
  CONSENT_EXPIRY_DAYS,
} from '../utils/cookieConsent';
import { SurveyTermsModal } from './SurveyTermsModal';

interface CookieConsentBannerProps {
  onOpenPrivacyPolicy?: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onOpenPrivacyPolicy,
}) => {
  const [consent, setConsent] = useState<SurveyCookieConsent | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
  const [surveyOnlyChecked, setSurveyOnlyChecked] = useState<boolean>(true);
  const [cookieStorageChecked, setCookieStorageChecked] = useState<boolean>(true);

  useEffect(() => {
    // Initial check on mount
    const current = getSurveyCookieConsent();
    setConsent(current);

    // Listen for cross-applet updates
    const handleUpdate = (e: any) => {
      setConsent(e.detail as SurveyCookieConsent | null);
    };

    window.addEventListener('civic_survey_consent_updated', handleUpdate);
    return () => window.removeEventListener('civic_survey_consent_updated', handleUpdate);
  }, []);

  const handleAcceptAll = () => {
    const saved = saveSurveyCookieConsent({
      surveyOnlyAffirmed: true,
      cookieStorageAgreed: true,
      version: SURVEY_CONSENT_VERSION,
    });
    setConsent(saved);
  };

  // If already consented and not dismissed, don't show the large banner
  if (consent?.accepted || isDismissed) {
    return (
      <SurveyTermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        hasAccepted={Boolean(consent?.accepted)}
        onAcceptAndSaveCookie={handleAcceptAll}
      />
    );
  }

  return (
    <>
      <aside
        aria-label="Civic Survey & Cookie Consent"
        id="civic-survey-cookie-banner"
        className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 bg-black/60 backdrop-blur-md flex justify-center pointer-events-auto animate-slideUp"
      >
        <div className="max-w-4xl w-full bg-[#0F172A] border-2 border-emerald-500/60 rounded-2xl shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4 ring-1 ring-emerald-500/30">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-sm">
                <Cookie className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-bold font-serif text-white tracking-tight">
                    Civic Survey Declaration & Cookie Consent
                  </h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                    DPDP Act 2023 Notice
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8]">
                  Please review and accept our non-government survey terms and cookie persistence.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDismissed(true)}
              title="Dismiss banner temporarily"
              className="text-[#64748B] hover:text-white p-1 rounded-lg transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Clear Message (Non-Government & Survey Only) */}
          <div className="bg-[#0A0B0D] border border-[#1E293B] rounded-xl p-4 space-y-2 text-xs leading-relaxed">
            <div className="flex items-start gap-2.5 text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div className="space-y-1">
                <p className="text-[#CBD5E1]">
                  <strong>Survey & Public Opinion Modeling Only:</strong> This platform is an independent civic tool designed to visualize participatory public budgeting.
                  <span className="text-emerald-400 font-semibold"> All submitted data is strictly for civic survey and research purposes.</span>
                </p>
                <p className="text-[#94A3B8] text-[11px]">
                  It is <strong>NOT for personal commercial use, nor is it affiliated with the Income Tax Department or any Government body.</strong> This data is NEVER shared with tax authorities or used for official tax assessments.
                </p>
              </div>
            </div>

            {/* Consent Options */}
            <div className="pt-2 border-t border-[#1E293B] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <label className="flex items-center gap-2 text-[#E2E8F0] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={surveyOnlyChecked}
                  onChange={(e) => setSurveyOnlyChecked(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-emerald-500 text-emerald-500 accent-emerald-500 cursor-pointer"
                />
                <span>I agree this data is purely for survey purposes</span>
              </label>

              <label className="flex items-center gap-2 text-[#E2E8F0] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={cookieStorageChecked}
                  onChange={(e) => setCookieStorageChecked(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-emerald-500 text-emerald-500 accent-emerald-500 cursor-pointer"
                />
                <span>I agree to store this consent in browser cookies</span>
              </label>
            </div>
          </div>

          {/* Expandable Technical Cookie Details */}
          {showDetails && (
            <div className="bg-[#131E32] border border-[#1E293B] rounded-xl p-3.5 space-y-2 text-[11px] text-[#94A3B8] animate-fadeIn">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Info className="w-3.5 h-3.5" />
                <span>Technical Cookie Specification:</span>
              </div>
              <p>
                We store a single essential preference cookie (<code className="text-emerald-300 font-mono">{SURVEY_CONSENT_COOKIE_NAME}</code>) with a 365-day lifespan (<code className="text-emerald-300 font-mono">max-age={CONSENT_EXPIRY_DAYS * 86400}</code>, <code className="text-emerald-300 font-mono">SameSite=Lax</code>). It securely logs your informed acceptance of these non-government terms under Section 6 of the DPDP Act 2023.
              </p>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-[#94A3B8] hover:text-emerald-400 flex items-center gap-1 transition cursor-pointer"
              >
                <span>{showDetails ? 'Hide Cookie Info' : 'Cookie & Privacy Details'}</span>
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsTermsModalOpen(true)}
                className="text-xs text-[#94A3B8] hover:text-white underline underline-offset-4 transition cursor-pointer"
              >
                Read Terms & Conditions
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="text-xs text-[#94A3B8] hover:text-white px-3 py-2 rounded-xl transition cursor-pointer"
              >
                Guest View
              </button>

              <button
                type="button"
                id="cookie-consent-accept-all-btn"
                onClick={handleAcceptAll}
                disabled={!surveyOnlyChecked || !cookieStorageChecked}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>I Agree & Accept (Store in Cookies)</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <SurveyTermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        hasAccepted={Boolean(consent?.accepted)}
        onAcceptAndSaveCookie={handleAcceptAll}
      />
    </>
  );
};
