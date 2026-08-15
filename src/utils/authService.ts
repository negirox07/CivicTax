import { CitizenUser, TaxRecord } from '../types';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

const AUTH_STORAGE_KEY = 'civictax_current_user_session';
const REGISTERED_USERS_KEY = 'civictax_registered_users';

export const DEMO_CITIZEN_PROFILES: CitizenUser[] = [
  {
    id: 'usr_mukesh',
    fullName: 'Mukesh Singh Negi',
    email: 'mukeshsingh.negi07@gmail.com',
    phone: '+91 98765 43210',
    profession: 'Senior Software Engineer',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
    filingCount: 3,
    totalTaxContributed: 965000,
    dataSharingConsent: true,
    dpdpConsentGranted: true,
    dpdpNoticeVersion: 'DPDP-ACT-2023-RULES-2025-v1.0',
    consentTimestamp: '2026-08-01T10:30:00Z',
  },
  {
    id: 'usr_priya',
    fullName: 'Priya Narayanan',
    email: 'priya.narayanan@example.com',
    phone: '+91 98450 11223',
    profession: 'Clinical Research Associate',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600028',
    filingCount: 1,
    totalTaxContributed: 225000,
    dataSharingConsent: true,
    dpdpConsentGranted: true,
    dpdpNoticeVersion: 'DPDP-ACT-2023-RULES-2025-v1.0',
    consentTimestamp: '2026-08-05T14:15:00Z',
  },
  {
    id: 'usr_rahul',
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 97112 33445',
    profession: 'Supply Chain Architect',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    filingCount: 1,
    totalTaxContributed: 610000,
    dataSharingConsent: true,
    dpdpConsentGranted: true,
    dpdpNoticeVersion: 'DPDP-ACT-2023-RULES-2025-v1.0',
    consentTimestamp: '2026-08-07T11:45:00Z',
  },
  {
    id: 'usr_ananya',
    fullName: 'Dr. Ananya Roy',
    email: 'ananya.roy@example.com',
    phone: '+91 94331 99887',
    profession: 'Biotech Scientist & Educator',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700019',
    filingCount: 1,
    totalTaxContributed: 490000,
    dataSharingConsent: true,
    dpdpConsentGranted: true,
    dpdpNoticeVersion: 'DPDP-ACT-2023-RULES-2025-v1.0',
    consentTimestamp: '2026-08-10T16:00:00Z',
  },
  {
    id: 'usr_vikram',
    fullName: 'Vikramaditya Rathore',
    email: 'vikram.rathore@example.com',
    phone: '+91 98290 55667',
    profession: 'Renewable Infrastructure Consultant',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
    filingCount: 1,
    totalTaxContributed: 740000,
    dataSharingConsent: true,
    dpdpConsentGranted: true,
    dpdpNoticeVersion: 'DPDP-ACT-2023-RULES-2025-v1.0',
    consentTimestamp: '2026-08-12T09:20:00Z',
  },
  {
    id: 'usr_sneha',
    fullName: 'Sneha Kulkarni',
    email: 'sneha.k@example.com',
    phone: '+91 99220 44332',
    profession: 'UX Designer',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    filingCount: 1,
    totalTaxContributed: 295000,
    dataSharingConsent: true,
    dpdpConsentGranted: true,
    dpdpNoticeVersion: 'DPDP-ACT-2023-RULES-2025-v1.0',
    consentTimestamp: '2026-08-14T12:00:00Z',
  },
];

/**
 * Get all registered citizen users (includes initial demo users + newly created accounts)
 */
export function getRegisteredUsers(): CitizenUser[] {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(DEMO_CITIZEN_PROFILES));
      return DEMO_CITIZEN_PROFILES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEMO_CITIZEN_PROFILES;
  } catch (e) {
    return DEMO_CITIZEN_PROFILES;
  }
}

/**
 * Get currently logged-in citizen user.
 * Defaults to null (Logged Out state) so user lands on Global Dashboard by default.
 */
export function getStoredCurrentUser(): CitizenUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * Save user session to local storage
 */
export function setStoredCurrentUser(user: CitizenUser | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to update auth session', e);
  }
}

/**
 * Log in by Email or Mobile Phone via backend API or Supabase citizen_users
 */
export async function loginCitizen(
  emailOrPhone: string,
  passwordOrPin?: string
): Promise<{ success: boolean; user?: CitizenUser; error?: string }> {
  const normalized = emailOrPhone.trim();
  const digitsOnly = normalized.replace(/\D/g, '');

  // 1. Try Backend Express API
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: normalized,
        password: passwordOrPin || '1234',
      }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.user) {
      setStoredCurrentUser(data.user);
      return { success: true, user: data.user };
    }

    if (data.error) {
      return { success: false, error: data.error };
    }
  } catch (backendErr) {
    console.warn('Backend login endpoint unavailable, checking Supabase / local:', backendErr);
  }

  // 2. Try direct Supabase PostgreSQL citizen_users query if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        let query = supabase.from('citizen_users').select('*');
        if (normalized.includes('@')) {
          query = query.ilike('email', normalized);
        } else if (digitsOnly.length >= 10) {
          query = query.ilike('phone', `%${digitsOnly.slice(-10)}%`);
        } else {
          query = query.or(`email.ilike.${normalized},phone.ilike.%${normalized}%`);
        }

        const { data, error } = await query.limit(1).maybeSingle();

        if (!error && data) {
          const user: CitizenUser = {
            id: data.id,
            fullName: data.full_name,
            email: data.email,
            phone: data.phone || undefined,
            profession: data.profession || undefined,
            city: data.city || 'Bengaluru',
            state: data.state || 'Karnataka',
            pincode: data.pincode || '560001',
            filingCount: data.filing_count || 0,
            totalTaxContributed: Number(data.total_tax_contributed) || 0,
            dataSharingConsent: data.data_sharing_consent ?? true,
            dpdpConsentGranted: data.dpdp_consent_granted ?? true,
            dpdpNoticeVersion: data.dpdp_notice_version || 'DPDP-ACT-2023-RULES-2025-v1.0',
            consentTimestamp: data.consent_timestamp,
            consentVersion: data.consent_version,
          };
          setStoredCurrentUser(user);
          return { success: true, user };
        }
      }
    } catch (supaErr) {
      console.warn('Direct Supabase citizen_users query warning:', supaErr);
    }
  }

  // 3. Fallback to local user registry if offline/network issue
  const allUsers = getRegisteredUsers();
  const found = allUsers.find((u) => {
    const uEmail = u.email.toLowerCase();
    const uPhoneDigits = (u.phone || '').replace(/\D/g, '');
    const matchEmail = uEmail === normalized.toLowerCase();
    const matchPhone = digitsOnly.length >= 10 && uPhoneDigits.endsWith(digitsOnly.slice(-10));
    return matchEmail || matchPhone;
  });

  if (found) {
    setStoredCurrentUser(found);
    return { success: true, user: found };
  }

  return {
    success: false,
    error: 'Participant profile not found. Please verify your Email or Phone number, or register a new participant profile under DPDP Act rules.',
  };
}

/**
 * Register a new citizen account via backend API with mandatory DPDP Act 2023 consent
 */
export async function registerCitizen(
  userData: Partial<CitizenUser> & {
    password?: string;
    termsAccepted?: boolean;
    dataSharingConsent: boolean;
    accuracyDeclaration?: boolean;
    dpdpConsentGranted?: boolean;
  }
): Promise<{ success: boolean; user?: CitizenUser; error?: string }> {
  if (!userData.fullName || !userData.email) {
    return { success: false, error: 'Full Name and Email address are mandatory.' };
  }

  if (userData.termsAccepted !== true) {
    return {
      success: false,
      error: 'You must review and accept the DPDP Act 2023 Notice & Survey Terms.',
    };
  }

  if (userData.dataSharingConsent !== true) {
    return {
      success: false,
      error: 'You must provide consent to process anonymized budget preference data for civic opinion research under Section 6 of DPDP Act 2023.',
    };
  }

  if (userData.accuracyDeclaration !== true) {
    return {
      success: false,
      error: 'You must declare that the demographic and civic opinion information provided is genuine.',
    };
  }

  const emailClean = userData.email.trim().toLowerCase();
  const phoneClean = (userData.phone || '').trim();

  // 1. Try Backend Express API
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: userData.fullName.trim(),
        email: emailClean,
        phone: phoneClean,
        password: userData.password || '1234',
        profession: userData.profession || 'Civic Participant',
        city: userData.city || 'Bengaluru',
        state: userData.state || 'Karnataka',
        pincode: userData.pincode || '560001',
        termsAccepted: true,
        dataSharingConsent: true,
        dpdpConsentGranted: true,
        dpdpNoticeVersion: 'DPDP-ACT-2023-RULES-2025-v1.0',
        accuracyDeclaration: true,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.user) {
      setStoredCurrentUser(data.user);
      return { success: true, user: data.user };
    }

    if (data.error) {
      return { success: false, error: data.error };
    }
  } catch (backendErr) {
    console.warn('Backend registration endpoint unavailable, writing to Supabase / local:', backendErr);
  }

  // 2. Write to Supabase citizen_users directly if configured
  const newUserId = `usr_${Date.now()}`;
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('citizen_users').insert({
          id: newUserId,
          full_name: userData.fullName.trim(),
          email: emailClean,
          phone: phoneClean || null,
          password_hash: userData.password || '1234',
          profession: userData.profession || 'Civic Participant',
          city: userData.city || 'Bengaluru',
          state: userData.state || 'Karnataka',
          pincode: userData.pincode || '560001',
          filing_count: 0,
          total_tax_contributed: 0,
          data_sharing_consent: true,
          dpdp_consent_granted: true,
          dpdp_notice_version: 'DPDP-ACT-2023-RULES-2025-v1.0',
          terms_accepted: true,
          accuracy_declaration: true,
        });
      }
    } catch (supaErr) {
      console.warn('Direct Supabase citizen_users insert warning:', supaErr);
    }
  }

  // 3. Local fallback persistence
  const allUsers = getRegisteredUsers();
  const newUser: CitizenUser = {
    id: newUserId,
    fullName: userData.fullName.trim(),
    email: emailClean,
    phone: phoneClean,
    profession: userData.profession || 'Civic Participant',
    city: userData.city || 'Bengaluru',
    state: userData.state || 'Karnataka',
    pincode: userData.pincode || '560001',
    filingCount: 0,
    totalTaxContributed: 0,
    dataSharingConsent: true,
    dpdpConsentGranted: true,
    dpdpNoticeVersion: 'DPDP-ACT-2023-RULES-2025-v1.0',
    consentTimestamp: new Date().toISOString(),
    consentVersion: 'DPDP-2023-v1.0',
  };

  const updated = [...allUsers, newUser];
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updated));
  setStoredCurrentUser(newUser);

  return { success: true, user: newUser };
}

/**
 * Update citizen consent on backend (DPDP Consent Management)
 */
export async function updateCitizenConsent(
  user: CitizenUser,
  consentGiven: boolean
): Promise<{ success: boolean; user?: CitizenUser }> {
  try {
    const res = await fetch('/api/auth/consent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: user.token ? `Bearer ${user.token}` : '',
      },
      body: JSON.stringify({
        userId: user.id,
        email: user.email,
        consentGiven,
        consentVersion: 'DPDP-ACT-2023-RULES-2025-v1.0',
      }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.user) {
      setStoredCurrentUser(data.user);
      return { success: true, user: data.user };
    }
  } catch (err) {
    console.error('Consent update error:', err);
  }

  // Local update
  const updatedUser: CitizenUser = {
    ...user,
    dataSharingConsent: consentGiven,
    dpdpConsentGranted: consentGiven,
    consentTimestamp: new Date().toISOString(),
  };
  setStoredCurrentUser(updatedUser);
  return { success: true, user: updatedUser };
}

/**
 * Filter all survey records for a specific citizen user
 */
export function filterRecordsForCitizen(
  allRecords: TaxRecord[],
  user: CitizenUser | null
): TaxRecord[] {
  if (!user) return [];

  const userEmail = (user.email || '').trim().toLowerCase();
  const userPhoneDigits = (user.phone || '').replace(/\D/g, '');

  return allRecords.filter((rec) => {
    const recEmail = (rec.email || '').trim().toLowerCase();
    const recPhoneDigits = (rec.phone || '').replace(/\D/g, '');

    return (
      (userEmail && recEmail === userEmail) ||
      (userPhoneDigits.length >= 10 && recPhoneDigits.endsWith(userPhoneDigits.slice(-10))) ||
      (rec.fullName.toLowerCase() === user.fullName.toLowerCase())
    );
  });
}
