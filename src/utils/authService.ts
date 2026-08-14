import { CitizenUser, TaxRecord } from '../types';
import { INITIAL_SAMPLE_RECORDS } from '../data/sectors';

const AUTH_STORAGE_KEY = 'civictax_current_user_session';
const REGISTERED_USERS_KEY = 'civictax_registered_users';

export const DEMO_CITIZEN_PROFILES: CitizenUser[] = [
  {
    id: 'usr_mukesh',
    fullName: 'Mukesh Singh Negi',
    email: 'mukeshsingh.negi07@gmail.com',
    panNumber: 'ABCDE1234F',
    aadhaarNumber: '789456123012',
    phone: '+91 98765 43210',
    profession: 'Senior Software Engineer',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
    filingCount: 3,
    totalTaxContributed: 965000,
  },
  {
    id: 'usr_priya',
    fullName: 'Priya Narayanan',
    email: 'priya.narayanan@example.com',
    panNumber: 'BPLPN5432K',
    aadhaarNumber: '453218907654',
    phone: '+91 98450 11223',
    profession: 'Clinical Research Associate',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600028',
    filingCount: 1,
    totalTaxContributed: 225000,
  },
  {
    id: 'usr_rahul',
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    panNumber: 'AZRPS8876M',
    aadhaarNumber: '671290345612',
    phone: '+91 97112 33445',
    profession: 'Supply Chain Architect',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    filingCount: 1,
    totalTaxContributed: 610000,
  },
  {
    id: 'usr_ananya',
    fullName: 'Dr. Ananya Roy',
    email: 'ananya.roy@example.com',
    panNumber: 'CKPAR4412Q',
    aadhaarNumber: '332187654321',
    phone: '+91 94331 99887',
    profession: 'Biotech Scientist & Educator',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700019',
    filingCount: 1,
    totalTaxContributed: 490000,
  },
  {
    id: 'usr_vikram',
    fullName: 'Vikramaditya Rathore',
    email: 'vikram.rathore@example.com',
    panNumber: 'DFFVR1098J',
    aadhaarNumber: '890123456789',
    phone: '+91 98290 55667',
    profession: 'Renewable Infrastructure Consultant',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
    filingCount: 1,
    totalTaxContributed: 740000,
  },
  {
    id: 'usr_sneha',
    fullName: 'Sneha Kulkarni',
    email: 'sneha.k@example.com',
    panNumber: 'FGHPS7711N',
    aadhaarNumber: '567890123456',
    phone: '+91 99220 44332',
    profession: 'UX Designer',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    filingCount: 1,
    totalTaxContributed: 295000,
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
 * Log in by Email or PAN Number via backend API
 */
export async function loginCitizen(
  emailOrPan: string,
  passwordOrPin?: string
): Promise<{ success: boolean; user?: CitizenUser; error?: string }> {
  const normalized = emailOrPan.trim();

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
    console.warn('Backend login endpoint unavailable, trying local fallback:', backendErr);
  }

  // Fallback to local user registry if offline/network issue
  const allUsers = getRegisteredUsers();
  const found = allUsers.find(
    (u) =>
      u.email.toLowerCase() === normalized.toLowerCase() ||
      u.panNumber.toLowerCase() === normalized.toLowerCase()
  );

  if (found) {
    setStoredCurrentUser(found);
    return { success: true, user: found };
  }

  return {
    success: false,
    error: 'Citizen account not found. Please verify your Email/PAN or register a new profile.',
  };
}

/**
 * Register a new citizen account via backend API with mandatory consent
 */
export async function registerCitizen(
  userData: Partial<CitizenUser> & {
    password?: string;
    termsAccepted?: boolean;
    dataSharingConsent: boolean;
    accuracyDeclaration?: boolean;
  }
): Promise<{ success: boolean; user?: CitizenUser; error?: string }> {
  if (!userData.fullName || !userData.email || !userData.panNumber) {
    return { success: false, error: 'Full Name, Email, and PAN Number are mandatory.' };
  }

  if (userData.termsAccepted !== true) {
    return {
      success: false,
      error: 'You must agree to the CivicTax Terms of Service & Privacy Policy.',
    };
  }

  if (userData.dataSharingConsent !== true) {
    return {
      success: false,
      error: 'You must provide consent to share anonymized tax allocation data for national public transparency and civic growth.',
    };
  }

  if (userData.accuracyDeclaration !== true) {
    return {
      success: false,
      error: 'You must declare that all provided taxpayer identification and income information is accurate.',
    };
  }

  const panClean = userData.panNumber.trim().toUpperCase();
  const emailClean = userData.email.trim().toLowerCase();

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: userData.fullName.trim(),
        email: emailClean,
        panNumber: panClean,
        password: userData.password || '1234',
        aadhaarNumber: userData.aadhaarNumber,
        phone: userData.phone,
        profession: userData.profession || 'Taxpayer Contributor',
        city: userData.city || 'Bengaluru',
        state: userData.state || 'Karnataka',
        pincode: userData.pincode || '560001',
        termsAccepted: true,
        dataSharingConsent: true,
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
    console.warn('Backend registration endpoint unavailable, storing locally:', backendErr);
  }

  // Local fallback
  const allUsers = getRegisteredUsers();
  const newUser: CitizenUser = {
    id: `usr_${Date.now()}`,
    fullName: userData.fullName.trim(),
    email: emailClean,
    panNumber: panClean,
    aadhaarNumber: userData.aadhaarNumber || '',
    phone: userData.phone || '',
    profession: userData.profession || 'Taxpayer Contributor',
    city: userData.city || 'Bengaluru',
    state: userData.state || 'Karnataka',
    pincode: userData.pincode || '560001',
    filingCount: 0,
    totalTaxContributed: 0,
    dataSharingConsent: true,
    consentTimestamp: new Date().toISOString(),
    consentVersion: 'v1.0-public-growth',
  };

  const updated = [...allUsers, newUser];
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updated));
  setStoredCurrentUser(newUser);

  return { success: true, user: newUser };
}

/**
 * Update citizen consent on backend
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
        consentVersion: 'v1.0-public-growth',
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
    consentTimestamp: new Date().toISOString(),
  };
  setStoredCurrentUser(updatedUser);
  return { success: true, user: updatedUser };
}

/**
 * Filter all records for a specific citizen user
 */
export function filterRecordsForCitizen(
  allRecords: TaxRecord[],
  user: CitizenUser | null
): TaxRecord[] {
  if (!user) return [];

  const userEmail = (user.email || '').trim().toLowerCase();
  const userPan = (user.panNumber || '').trim().toUpperCase();

  return allRecords.filter((rec) => {
    const recEmail = (rec.email || '').trim().toLowerCase();
    const recPan = (rec.panNumber || '').trim().toUpperCase();

    return (
      (userEmail && recEmail === userEmail) ||
      (userPan && recPan === userPan) ||
      (rec.fullName.toLowerCase() === user.fullName.toLowerCase())
    );
  });
}
