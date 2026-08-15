/**
 * Privacy & Consent Management Service for CivicTax
 * Adheres strictly to the Digital Personal Data Protection (DPDP) Act 2023 & DPDP Rules 2025:
 *
 * Section 6(4): "The Data Principal shall have the right to withdraw her consent at any time.
 * The ease of withdrawal of consent shall be comparable to the ease with which such consent was given."
 * Section 11: Right to Access & Data Portability (Download my data).
 * Section 12: Right to Erasure / Right to be Forgotten (Delete my data).
 */

import { CitizenUser, TaxRecord } from '../types';
import { eraseAllCitizenData } from './dataService';
import { revokeSurveyCookieConsent, getSurveyCookieConsent, saveSurveyCookieConsent } from './cookieConsent';

export interface CitizenPrivacyPreferences {
  surveyProcessingConsent: boolean; // DPDP Sec 6(1) Active voluntary consent for civic modeling
  cookiePersistenceConsent: boolean; // First-party preference cookies (DPDP Rules 2025)
  anonymousPublicContribution: boolean; // Aggregation into National Public Dashboard
  emailReceiptNotifications: boolean; // DPO and receipt verification notices
  lastUpdated: string;
}

export interface ConsentWithdrawalRecord {
  withdrawalId: string;
  userEmail: string;
  userName: string;
  withdrawnAt: string;
  scope: 'all_processing' | 'cookies_only' | 'public_modeling_only';
  reason?: string;
  statutoryBasis: 'Section 6(4) DPDP Act 2023';
  hash: string;
}

const PRIVACY_PREFS_KEY = 'civictax_privacy_preferences';
const CONSENT_WITHDRAWAL_LOG_KEY = 'civictax_consent_withdrawal_log';

export const DEFAULT_PRIVACY_PREFERENCES: CitizenPrivacyPreferences = {
  surveyProcessingConsent: true,
  cookiePersistenceConsent: true,
  anonymousPublicContribution: true,
  emailReceiptNotifications: true,
  lastUpdated: new Date().toISOString(),
};

/**
 * Retrieves stored privacy preferences
 */
export function getCitizenPrivacyPreferences(userId?: string): CitizenPrivacyPreferences {
  try {
    const key = userId ? `${PRIVACY_PREFS_KEY}_${userId}` : PRIVACY_PREFS_KEY;
    const val = localStorage.getItem(key);
    if (val) {
      return { ...DEFAULT_PRIVACY_PREFERENCES, ...JSON.parse(val) };
    }
  } catch (e) {
    console.warn('Error reading privacy preferences:', e);
  }
  return DEFAULT_PRIVACY_PREFERENCES;
}

/**
 * Saves updated privacy preferences
 */
export function saveCitizenPrivacyPreferences(
  prefs: Partial<CitizenPrivacyPreferences>,
  userId?: string
): CitizenPrivacyPreferences {
  const current = getCitizenPrivacyPreferences(userId);
  const updated: CitizenPrivacyPreferences = {
    ...current,
    ...prefs,
    lastUpdated: new Date().toISOString(),
  };

  try {
    const key = userId ? `${PRIVACY_PREFS_KEY}_${userId}` : PRIVACY_PREFS_KEY;
    localStorage.setItem(key, JSON.stringify(updated));

    // Also sync cookie consent if cookiePersistenceConsent toggled
    if (prefs.cookiePersistenceConsent === false) {
      revokeSurveyCookieConsent();
    } else if (prefs.cookiePersistenceConsent === true) {
      saveSurveyCookieConsent({ cookieStorageAgreed: true });
    }
  } catch (e) {
    console.warn('Error saving privacy preferences:', e);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('civic_privacy_preferences_updated', { detail: updated }));
  }

  return updated;
}

/**
 * Generates cryptographic SHA-256 hash for audit trails
 */
async function generateSha256(text: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback below
    }
  }
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `CT-DPDP-${Math.abs(hash).toString(16).toUpperCase()}-${Date.now()}`;
}

/**
 * Executes 1-Click Consent Withdrawal under Section 6(4) of the DPDP Act 2023.
 * As mandated: "The ease of withdrawal of consent shall be comparable to the ease with which such consent was given."
 */
export async function withdrawCitizenConsent(params: {
  user: CitizenUser | null;
  scope?: 'all_processing' | 'cookies_only' | 'public_modeling_only';
  reason?: string;
}): Promise<ConsentWithdrawalRecord> {
  const { user, scope = 'all_processing', reason } = params;
  const userEmail = user?.email || 'guest@civictax.org';
  const userName = user?.fullName || 'Anonymous Citizen';
  const timestamp = new Date().toISOString();
  const rawHashInput = `${userEmail}-${userName}-${timestamp}-${scope}-DPDP-SEC-6-4`;
  const hash = await generateSha256(rawHashInput);

  const withdrawalRecord: ConsentWithdrawalRecord = {
    withdrawalId: `DPDP-WTH-${Date.now().toString(36).toUpperCase()}`,
    userEmail,
    userName,
    withdrawnAt: timestamp,
    scope,
    reason: reason || 'Voluntary withdrawal of consent under Section 6(4) DPDP Act 2023',
    statutoryBasis: 'Section 6(4) DPDP Act 2023',
    hash,
  };

  // 1. Save withdrawal event to local audit log
  try {
    const existing = JSON.parse(localStorage.getItem(CONSENT_WITHDRAWAL_LOG_KEY) || '[]');
    localStorage.setItem(CONSENT_WITHDRAWAL_LOG_KEY, JSON.stringify([withdrawalRecord, ...existing]));
  } catch (e) {
    console.warn('Error saving withdrawal log:', e);
  }

  // 2. Update privacy preferences to reflect withdrawn status
  saveCitizenPrivacyPreferences(
    {
      surveyProcessingConsent: false,
      cookiePersistenceConsent: scope === 'all_processing' || scope === 'cookies_only' ? false : true,
      anonymousPublicContribution: false,
    },
    user?.id
  );

  // 3. Revoke active cookie tokens
  revokeSurveyCookieConsent();

  // 4. Notify app listeners
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('civic_consent_withdrawn', { detail: withdrawalRecord }));
  }

  return withdrawalRecord;
}

/**
 * Executes immediate and complete deletion of all user information (Section 12 DPDP Act 2023)
 */
export async function executeCompleteInformationDeletion(user: CitizenUser | null): Promise<{
  success: boolean;
  erasedRecordsCount: number;
  deletionCertificateHash: string;
  timestamp: string;
}> {
  const identifier = {
    email: user?.email,
    phone: user?.phone,
    fullName: user?.fullName,
  };

  // Execute wipe across database/local cache
  const result = await eraseAllCitizenData(identifier);

  // Revoke cookies and clear preferences
  revokeSurveyCookieConsent();
  if (user?.id) {
    localStorage.removeItem(`${PRIVACY_PREFS_KEY}_${user.id}`);
  }
  localStorage.removeItem(PRIVACY_PREFS_KEY);

  // Notify listeners
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('civic_data_erased', { detail: result }));
  }

  return result;
}

/**
 * Exports user data as structured, machine-readable JSON (Section 11)
 */
export function exportDataAsJson(user: CitizenUser | null, records: TaxRecord[]): void {
  const cookieConsent = getSurveyCookieConsent();
  const privacyPrefs = getCitizenPrivacyPreferences(user?.id);

  const payload = {
    standard: 'Digital Personal Data Protection (DPDP) Act 2023 & DPDP Rules 2025',
    dataPrincipal: user
      ? {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone || 'Not provided',
          city: user.city,
          state: user.state,
          pincode: user.pincode,
          profession: user.profession,
          dpdpConsentGranted: user.dpdpConsentGranted,
          consentTimestamp: user.consentTimestamp,
        }
      : 'Guest / Public Session',
    privacyPreferences: privacyPrefs,
    cookieConsentAudit: cookieConsent,
    filingsCount: records.length,
    taxFilingsAndAllocations: records.map((r) => ({
      id: r.id,
      financialYear: r.financialYear,
      taxPaid: r.taxPaid,
      annualSalary: r.annualSalary,
      taxRegime: r.taxRegime,
      allocations: r.allocations,
      citizenProposal: r.citizenProposal || null,
      verificationHash: r.verificationHash,
      submissionDate: r.submissionDate,
    })),
    dataFiduciary: {
      organization: 'CivicTax Governance Project',
      dpo: 'Mukesh Singh Negi',
      dpoEmail: 'mukeshsingh.negi07@gmail.com',
      sharingPolicy: '0% Sold, 0% Commercial Ads, 0% Tax Authority Inspection',
    },
    generatedAt: new Date().toISOString(),
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
  const anchor = document.createElement('a');
  anchor.setAttribute('href', dataStr);
  anchor.setAttribute(
    'download',
    `CivicTax_MyData_Export_${user ? user.fullName.replace(/\s+/g, '_') : 'Guest'}_${Date.now()}.json`
  );
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
