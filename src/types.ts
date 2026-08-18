export type SectorId =
  | 'infrastructure'
  | 'healthcare'
  | 'education'
  | 'clean_energy'
  | 'defense_security'
  | 'agriculture_rural'
  | 'science_tech'
  | 'social_welfare';

export interface SectorDefinition {
  id: SectorId;
  name: string;
  shortName: string;
  iconName: string;
  color: string;
  chartColor: string;
  bgLight: string;
  borderLight: string;
  description: string;
  subCategories: string[];
  benchmarkPct: number; // Official Union/National Budget Benchmark %
  tangibleUnit: {
    unitCost: number; // in INR
    label: string;
    description: string;
  };
  scope?: string;
  socioEconomicImpact?: {
    overview: string;
    macroBenefit: string;
    humanWelfareGain: string;
    policyPrograms: string[];
  };
}

export type SectorAllocations = Record<SectorId, number>; // percentage values totaling 100

export interface AiImpactSummary {
  summary: string;
  keyTakeaways: string[];
  civicEmpowermentQuote: string;
}

export interface TaxRecord {
  id: string;
  fullName: string;
  age: number;
  profession: string;
  annualSalary: number;
  taxPaid: number;
  email: string;
  phone: string;
  financialYear: string;
  taxRegime?: 'old' | 'new' | string;
  state: string;
  city: string;
  pincode: string;
  submissionDate: string;
  allocations: SectorAllocations;
  citizenProposal?: string;
  aiImpactSummary?: AiImpactSummary;
  verificationHash: string;
  dpdpConsentGranted?: boolean;
  dpdpNoticeVersion?: string;
}

export interface PresetAllocation {
  id: string;
  title: string;
  description: string;
  icon: string;
  allocations: SectorAllocations;
}

export interface CitizenUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  profession?: string;
  city?: string;
  state?: string;
  pincode?: string;
  avatar?: string;
  filingCount?: number;
  totalTaxContributed?: number;
  dataSharingConsent?: boolean;
  dpdpConsentGranted?: boolean;
  dpdpNoticeVersion?: string;
  consentTimestamp?: string;
  consentVersion?: string;
  token?: string;
}
