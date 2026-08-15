export function formatCurrencyINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactINR(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '••••@••••.•••';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0] || '•'}•••@${domain}`;
  }
  return `${local.slice(0, 2)}••••${local.slice(-1)}@${domain}`;
}

export function maskPhone(phone: string): string {
  if (!phone) return '•••••• ••••';
  const clean = phone.replace(/\s+/g, '');
  if (clean.length < 10) return '•••••• ••••';
  return `${clean.slice(0, 4)} ••• ${clean.slice(-3)}`;
}

// Deprecated PAN/Aadhaar masks kept as safe aliases to prevent breaking legacy imports
export function maskPAN(_pan?: string): string {
  return 'DPDP-2023-COMPLIANT';
}

export function maskAadhaar(_aadhaar?: string): string {
  return 'DPDP-NO-UID-STORED';
}

export function formatAadhaarInput(val: string): string {
  return val;
}

export function generateVerificationHash(identifier: string, fy: string, amount: number): string {
  const chars = '0123456789ABCDEF';
  let rand = '';
  for (let i = 0; i < 8; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  // Generate safe 3-letter prefix from email or participant name
  const cleanId = (identifier || 'SURVEY').replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'CIV';
  const yearCode = (fy || '2026').replace(/[^0-9]/g, '').slice(0, 4);
  const amtHex = Math.floor(amount % 65535).toString(16).toUpperCase().padStart(4, '0');
  return `CT-${yearCode}-${cleanId}-${amtHex}-${rand.slice(0, 4)}`;
}

export function getTaxpayerTier(totalLifetimeTax: number): {
  tierName: string;
  badgeColor: string;
  badgeBg: string;
  borderBadge: string;
  iconName: string;
  description: string;
} {
  if (totalLifetimeTax >= 1000000) {
    return {
      tierName: 'Platinum Civic Survey Leader',
      badgeColor: 'text-indigo-400',
      badgeBg: 'bg-indigo-950/40',
      borderBadge: 'border-indigo-500/40',
      iconName: 'Crown',
      description: 'Exceptional civic participant providing vital data for public infrastructure modeling.',
    };
  }
  if (totalLifetimeTax >= 500000) {
    return {
      tierName: 'Gold Civic Steward',
      badgeColor: 'text-amber-400',
      badgeBg: 'bg-amber-950/40',
      borderBadge: 'border-amber-500/40',
      iconName: 'Award',
      description: 'Major contributor driving high-impact healthcare and education research priorities.',
    };
  }
  if (totalLifetimeTax >= 200000) {
    return {
      tierName: 'Silver Civic Contributor',
      badgeColor: 'text-slate-300',
      badgeBg: 'bg-slate-800/40',
      borderBadge: 'border-slate-500/40',
      iconName: 'ShieldCheck',
      description: 'Consistent survey contributor actively shaping public transit and green project simulations.',
    };
  }
  return {
    tierName: 'Bronze Civic Participant',
    badgeColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/40',
    borderBadge: 'border-emerald-500/40',
    iconName: 'CheckCircle2',
    description: 'Valued democratic survey participant building public knowledge and community consensus.',
  };
}
