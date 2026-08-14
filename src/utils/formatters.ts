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

export function maskPAN(pan: string): string {
  if (!pan || pan.length < 10) return pan || '••••••••••';
  return `${pan.slice(0, 5)}••••${pan.slice(9)}`;
}

export function maskAadhaar(aadhaar: string): string {
  const clean = (aadhaar || '').replace(/\D/g, '');
  if (clean.length < 12) return '•••• •••• ••••';
  return `•••• •••• ${clean.slice(8, 12)}`;
}

export function formatAadhaarInput(val: string): string {
  const clean = val.replace(/\D/g, '').slice(0, 12);
  const parts = [];
  for (let i = 0; i < clean.length; i += 4) {
    parts.push(clean.slice(i, i + 4));
  }
  return parts.join(' ');
}

export function generateVerificationHash(pan: string, fy: string, amount: number): string {
  const chars = '0123456789ABCDEF';
  let rand = '';
  for (let i = 0; i < 8; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  const cleanPan = (pan || 'IND').slice(0, 3).toUpperCase();
  const yearCode = (fy || '2025').replace(/[^0-9]/g, '').slice(0, 4);
  const amtHex = Math.floor(amount % 65535).toString(16).toUpperCase().padStart(4, '0');
  return `CT-${yearCode}-${cleanPan}-${amtHex}-${rand.slice(0, 4)}`;
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
      tierName: 'Platinum Nation Builder',
      badgeColor: 'text-indigo-700',
      badgeBg: 'bg-indigo-50',
      borderBadge: 'border-indigo-300',
      iconName: 'Crown',
      description: 'Exceptional pillar of public revenue & national infrastructure transformation.',
    };
  }
  if (totalLifetimeTax >= 500000) {
    return {
      tierName: 'Gold Civic Steward',
      badgeColor: 'text-amber-700',
      badgeBg: 'bg-amber-50',
      borderBadge: 'border-amber-300',
      iconName: 'Award',
      description: 'Major contributor driving high-impact healthcare and education programs.',
    };
  }
  if (totalLifetimeTax >= 200000) {
    return {
      tierName: 'Silver Civic Contributor',
      badgeColor: 'text-slate-700',
      badgeBg: 'bg-slate-100',
      borderBadge: 'border-slate-300',
      iconName: 'ShieldCheck',
      description: 'Consistent taxpayer actively shaping public transport and green projects.',
    };
  }
  return {
    tierName: 'Bronze Civic Citizen',
    badgeColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-50',
    borderBadge: 'border-emerald-300',
    iconName: 'CheckCircle2',
    description: 'Valued democratic taxpayer building local communities and public safety.',
  };
}
