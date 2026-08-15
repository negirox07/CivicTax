/**
 * Cookie & Consent Management Utility for CivicTax
 * Ensures clear informed consent under India DPDP Act 2023 & DPDP Rules 2025:
 * 1. Data is strictly for civic survey, academic research, and public opinion modeling.
 * 2. Data is NOT for personal commercial use, official government tax assessments, or audits.
 * 3. Terms & conditions agreement is saved in browser cookies with fallback to local storage.
 */

export interface SurveyCookieConsent {
  accepted: boolean;
  acceptedAt: string;
  version: string;
  surveyOnlyAffirmed: boolean;
  cookieStorageAgreed: boolean;
  userEmail?: string;
}

export const SURVEY_CONSENT_COOKIE_NAME = 'civic_survey_consent_accepted';
export const SURVEY_CONSENT_VERSION = 'DPDP-SURVEY-CONSENT-2026-v1';
export const CONSENT_EXPIRY_DAYS = 365; // 1 year

/**
 * Standard cookie reader helper
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      try {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      } catch {
        return c.substring(nameEQ.length, c.length);
      }
    }
  }
  return null;
}

/**
 * Standard cookie writer helper (SameSite=Lax, path=/)
 */
export function setCookie(name: string, value: string, days: number = CONSENT_EXPIRY_DAYS): void {
  if (typeof document === 'undefined') return;
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  const maxAge = days ? `; max-age=${days * 24 * 60 * 60}` : '';
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}${maxAge}; path=/; SameSite=Lax${secure}`;
}

/**
 * Standard cookie deleter helper
 */
export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Retrieves the stored survey consent state from cookie (with localStorage fallback)
 */
export function getSurveyCookieConsent(): SurveyCookieConsent | null {
  try {
    // 1. Try reading from cookie
    const cookieVal = getCookie(SURVEY_CONSENT_COOKIE_NAME);
    if (cookieVal) {
      const parsed = JSON.parse(cookieVal) as SurveyCookieConsent;
      if (parsed && parsed.accepted) {
        return parsed;
      }
    }

    // 2. Fallback to localStorage if cookie was blocked or wiped
    if (typeof localStorage !== 'undefined') {
      const localVal = localStorage.getItem(SURVEY_CONSENT_COOKIE_NAME);
      if (localVal) {
        const parsed = JSON.parse(localVal) as SurveyCookieConsent;
        if (parsed && parsed.accepted) {
          // Re-sync back to cookie
          setCookie(SURVEY_CONSENT_COOKIE_NAME, JSON.stringify(parsed), CONSENT_EXPIRY_DAYS);
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('Error reading survey consent cookie:', err);
  }
  return null;
}

/**
 * Checks if user has actively agreed to survey terms & conditions
 */
export function hasAgreedToSurveyTerms(): boolean {
  const consent = getSurveyCookieConsent();
  return Boolean(consent?.accepted && consent?.surveyOnlyAffirmed);
}

/**
 * Persists survey agreement and terms & conditions acceptance in browser cookies
 */
export function saveSurveyCookieConsent(options?: Partial<SurveyCookieConsent>): SurveyCookieConsent {
  const consentData: SurveyCookieConsent = {
    accepted: true,
    acceptedAt: options?.acceptedAt || new Date().toISOString(),
    version: options?.version || SURVEY_CONSENT_VERSION,
    surveyOnlyAffirmed: options?.surveyOnlyAffirmed !== undefined ? options.surveyOnlyAffirmed : true,
    cookieStorageAgreed: options?.cookieStorageAgreed !== undefined ? options.cookieStorageAgreed : true,
    userEmail: options?.userEmail,
  };

  const str = JSON.stringify(consentData);

  // Store in Cookie (1 Year)
  setCookie(SURVEY_CONSENT_COOKIE_NAME, str, CONSENT_EXPIRY_DAYS);

  // Also sync with LocalStorage for resiliency
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SURVEY_CONSENT_COOKIE_NAME, str);
    }
  } catch (e) {
    // Ignore storage quota errors
  }

  // Notify listeners across applet
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('civic_survey_consent_updated', { detail: consentData }));
  }

  return consentData;
}

/**
 * Revokes the survey consent and deletes the consent cookie
 */
export function revokeSurveyCookieConsent(): void {
  deleteCookie(SURVEY_CONSENT_COOKIE_NAME);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(SURVEY_CONSENT_COOKIE_NAME);
    }
  } catch (e) {
    // Ignore
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('civic_survey_consent_updated', { detail: null }));
  }
}
