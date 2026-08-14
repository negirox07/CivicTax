import { TaxRecord, SectorAllocations, SectorId } from '../types';
import { ALL_SECTOR_IDS, SECTOR_DEFINITIONS, INITIAL_SAMPLE_RECORDS } from '../data/sectors';
import {
  getSupabaseClient,
  isSupabaseActive,
  isSupabaseConfigured,
  getSupabaseStatus,
} from './supabaseClient';
import {
  loadTaxRecords as loadLocalRecords,
  saveTaxRecords as saveLocalRecords,
  addOrUpdateTaxRecord as addOrUpdateLocalRecord,
  deleteTaxRecord as deleteLocalRecord,
} from './storage';

export interface SectorConsensusItem {
  sectorId: SectorId;
  name: string;
  shortName: string;
  chartColor: string;
  iconName: string;
  citizenAvgPct: number;
  govBenchmarkPct: number;
  deltaPct: number;
  totalAllocatedAmount: number;
  contributorsCount: number;
}

export interface StateCivicMetric {
  state: string;
  citizenCount: number;
  totalTaxPaid: number;
  topSectorId: SectorId;
  topSectorName: string;
  avgTaxPerCitizen: number;
}

export interface GlobalPublicStats {
  totalTaxesPaid: number;
  totalCitizens: number;
  activeStatesCount: number;
  activeCitiesCount: number;
  financialYears: string[];
  selectedFinancialYear: string; // 'ALL' or specific year
  averageTaxPerCitizen: number;
  sectorConsensus: SectorConsensusItem[];
  topRankedSectors: SectorConsensusItem[];
  stateBreakdown: StateCivicMetric[];
  recentCitizenProposals: Array<{
    id: string;
    fullName: string;
    city: string;
    state: string;
    taxPaid: number;
    financialYear: string;
    citizenProposal: string;
    topSector: string;
    date: string;
  }>;
  tangibleOutcomes: {
    roadMeters: number;
    drainageMeters: number;
    solarPanelsKwh: number;
    hospitalDiagnostics: number;
    studentScholarships: number;
    farmerIrrigationDays: number;
    researchHours: number;
    co2TonsMitigated: number;
  };
}

/**
 * Convert Database Row (snake_case) to frontend TaxRecord (camelCase)
 */
function mapRowToTaxRecord(row: any): TaxRecord {
  return {
    id: row.id,
    fullName: row.full_name || row.fullName || 'Anonymous Citizen',
    panNumber: row.pan_number || row.panNumber || 'ABCDE1234F',
    aadhaarNumber: row.aadhaar_number || row.aadhaarNumber,
    email: row.email,
    phone: row.phone,
    profession: row.profession || 'Citizen Contributor',
    age: Number(row.age) || 30,
    city: row.city || 'National',
    state: row.state || 'India',
    pincode: row.pincode,
    annualSalary: Number(row.annual_salary ?? row.annualSalary ?? 0),
    taxPaid: Number(row.tax_paid ?? row.taxPaid ?? 0),
    taxRegime: row.tax_regime || row.taxRegime || 'new',
    financialYear: row.financial_year || row.financialYear || '2025-26',
    submissionDate: row.submission_date || row.submissionDate || new Date().toISOString(),
    allocations: row.allocations || {
      infrastructure: 25,
      education: 25,
      healthcare: 20,
      clean_energy: 15,
      defense_security: 5,
      agriculture_rural: 5,
      science_tech: 3,
      social_welfare: 2,
    },
    citizenProposal: row.citizen_proposal || row.citizenProposal,
    verificationHash: row.verification_hash || row.verificationHash || 'CT-VERIFIED-HASH',
    aiImpactSummary: row.ai_impact_summary || row.aiImpactSummary,
  };
}

/**
 * Convert frontend TaxRecord (camelCase) to Database Row (snake_case)
 */
function mapTaxRecordToRow(record: TaxRecord): any {
  return {
    id: record.id,
    full_name: record.fullName,
    pan_number: record.panNumber,
    aadhaar_number: record.aadhaarNumber || null,
    email: record.email || null,
    phone: record.phone || null,
    profession: record.profession,
    age: record.age,
    city: record.city,
    state: record.state,
    pincode: record.pincode || null,
    annual_salary: record.annualSalary,
    tax_paid: record.taxPaid,
    tax_regime: record.taxRegime,
    financial_year: record.financialYear,
    submission_date: record.submissionDate,
    allocations: record.allocations,
    citizen_proposal: record.citizenProposal || null,
    verification_hash: record.verificationHash,
    ai_impact_summary: record.aiImpactSummary || null,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Fetch all tax records asynchronously.
 * If Supabase is active and configured, fetches from Supabase table `tax_records`.
 * Otherwise, loads from local storage / initial sample records.
 */
export async function fetchAllTaxRecords(): Promise<{
  records: TaxRecord[];
  source: 'SUPABASE' | 'LOCAL_STORAGE';
  error?: string;
}> {
  const supabase = getSupabaseClient();
  const useSupabase = isSupabaseActive() && isSupabaseConfigured() && supabase !== null;

  if (useSupabase && supabase) {
    try {
      const { data, error } = await supabase
        .from('tax_records')
        .select('*')
        .order('financial_year', { ascending: false });

      if (error) {
        console.warn('Supabase fetch failed, falling back to local storage:', error.message);
        const local = loadLocalRecords();
        return { records: local, source: 'LOCAL_STORAGE', error: error.message };
      }

      if (data && data.length > 0) {
        const mapped = data.map(mapRowToTaxRecord);
        // Cache to local storage as well for offline resilience
        saveLocalRecords(mapped);
        return { records: mapped, source: 'SUPABASE' };
      } else {
        // Supabase table is empty: seed initial sample records to Supabase!
        const local = loadLocalRecords();
        if (local.length > 0) {
          const rowsToInsert = local.map(mapTaxRecordToRow);
          await supabase.from('tax_records').upsert(rowsToInsert);
        }
        return { records: local, source: 'SUPABASE' };
      }
    } catch (err: any) {
      console.warn('Supabase connection exception:', err);
      const local = loadLocalRecords();
      return { records: local, source: 'LOCAL_STORAGE', error: err.message };
    }
  }

  // Local storage mode
  const local = loadLocalRecords();
  return { records: local, source: 'LOCAL_STORAGE' };
}

/**
 * Save or update a single tax record.
 * Saves to Supabase when active, and always syncs to local storage.
 */
export async function persistTaxRecord(record: TaxRecord): Promise<{
  updatedRecords: TaxRecord[];
  savedToSupabase: boolean;
  error?: string;
}> {
  // Always update local cache first
  const localUpdated = addOrUpdateLocalRecord(record);

  const supabase = getSupabaseClient();
  const useSupabase = isSupabaseActive() && isSupabaseConfigured() && supabase !== null;

  if (useSupabase && supabase) {
    try {
      const row = mapTaxRecordToRow(record);
      const { error } = await supabase
        .from('tax_records')
        .upsert(row, { onConflict: 'id' });

      if (error) {
        console.error('Failed to save to Supabase:', error.message);
        return { updatedRecords: localUpdated, savedToSupabase: false, error: error.message };
      }

      return { updatedRecords: localUpdated, savedToSupabase: true };
    } catch (err: any) {
      console.error('Supabase save exception:', err);
      return { updatedRecords: localUpdated, savedToSupabase: false, error: err.message };
    }
  }

  return { updatedRecords: localUpdated, savedToSupabase: false };
}

/**
 * Delete a tax record from Supabase and local storage.
 */
export async function removeTaxRecord(id: string): Promise<{
  updatedRecords: TaxRecord[];
  deletedFromSupabase: boolean;
}> {
  const localUpdated = deleteLocalRecord(id);

  const supabase = getSupabaseClient();
  const useSupabase = isSupabaseActive() && isSupabaseConfigured() && supabase !== null;

  if (useSupabase && supabase) {
    try {
      await supabase.from('tax_records').delete().eq('id', id);
      return { updatedRecords: localUpdated, deletedFromSupabase: true };
    } catch (err) {
      console.error('Failed to delete from Supabase:', err);
    }
  }

  return { updatedRecords: localUpdated, deletedFromSupabase: false };
}

/**
 * Synchronize all local storage records into Supabase cloud table.
 */
export async function syncLocalRecordsToSupabase(): Promise<{
  success: boolean;
  syncedCount: number;
  message: string;
}> {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) {
    return {
      success: false,
      syncedCount: 0,
      message: 'Supabase URL and API Key are not configured in environment variables.',
    };
  }

  try {
    const local = loadLocalRecords();
    const rows = local.map(mapTaxRecordToRow);
    const { error } = await supabase.from('tax_records').upsert(rows, { onConflict: 'id' });

    if (error) {
      return { success: false, syncedCount: 0, message: error.message };
    }

    return {
      success: true,
      syncedCount: rows.length,
      message: `Successfully synchronized ${rows.length} citizen tax records to Supabase Cloud.`,
    };
  } catch (err: any) {
    return { success: false, syncedCount: 0, message: err.message };
  }
}

/**
 * Compute aggregated Public Interest Statistics across all records.
 */
export function calculateGlobalPublicStats(
  records: TaxRecord[],
  selectedFinancialYear: string = 'ALL'
): GlobalPublicStats {
  const activeRecords =
    selectedFinancialYear === 'ALL'
      ? records
      : records.filter((r) => r.financialYear === selectedFinancialYear);

  const totalTaxesPaid = activeRecords.reduce((acc, r) => acc + (Number(r.taxPaid) || 0), 0);
  const totalCitizens = activeRecords.length;
  const averageTaxPerCitizen = totalCitizens > 0 ? Math.round(totalTaxesPaid / totalCitizens) : 0;

  // Extract unique states and cities
  const statesSet = new Set(activeRecords.map((r) => r.state).filter(Boolean));
  const citiesSet = new Set(activeRecords.map((r) => r.city).filter(Boolean));
  const allYearsSet = new Set(records.map((r) => r.financialYear).filter(Boolean));
  const financialYears = Array.from(allYearsSet).sort().reverse();

  // Sector consensus calculation
  const sectorSums: Record<SectorId, { totalPct: number; totalAmount: number; count: number }> = {
    infrastructure: { totalPct: 0, totalAmount: 0, count: 0 },
    education: { totalPct: 0, totalAmount: 0, count: 0 },
    healthcare: { totalPct: 0, totalAmount: 0, count: 0 },
    clean_energy: { totalPct: 0, totalAmount: 0, count: 0 },
    defense_security: { totalPct: 0, totalAmount: 0, count: 0 },
    agriculture_rural: { totalPct: 0, totalAmount: 0, count: 0 },
    science_tech: { totalPct: 0, totalAmount: 0, count: 0 },
    social_welfare: { totalPct: 0, totalAmount: 0, count: 0 },
  };

  activeRecords.forEach((record) => {
    const allocations = record.allocations || {};
    const tax = Number(record.taxPaid) || 0;

    ALL_SECTOR_IDS.forEach((secId) => {
      const pct = Number(allocations[secId]) || 0;
      if (pct > 0) {
        sectorSums[secId].totalPct += pct;
        sectorSums[secId].totalAmount += (pct / 100) * tax;
        sectorSums[secId].count += 1;
      }
    });
  });

  const sectorConsensus: SectorConsensusItem[] = ALL_SECTOR_IDS.map((secId) => {
    const def = SECTOR_DEFINITIONS[secId];
    const data = sectorSums[secId];
    const avgPct = totalCitizens > 0 ? Math.round((data.totalPct / totalCitizens) * 10) / 10 : def.benchmarkPct;
    const delta = Math.round((avgPct - def.benchmarkPct) * 10) / 10;

    return {
      sectorId: secId,
      name: def.name,
      shortName: def.shortName,
      chartColor: def.chartColor,
      iconName: def.iconName,
      citizenAvgPct: avgPct,
      govBenchmarkPct: def.benchmarkPct,
      deltaPct: delta,
      totalAllocatedAmount: Math.round(data.totalAmount),
      contributorsCount: data.count,
    };
  });

  // Sort sectors by Citizen Consensus Percentage descending (Areas of Top Interest)
  const topRankedSectors = [...sectorConsensus].sort((a, b) => b.citizenAvgPct - a.citizenAvgPct);

  // State-wise Breakdown
  const stateMap: Record<string, { totalTax: number; citizens: number; sectorTotals: Record<SectorId, number> }> = {};

  activeRecords.forEach((r) => {
    const stateName = r.state || 'Other';
    if (!stateMap[stateName]) {
      stateMap[stateName] = {
        totalTax: 0,
        citizens: 0,
        sectorTotals: {
          infrastructure: 0,
          education: 0,
          healthcare: 0,
          clean_energy: 0,
          defense_security: 0,
          agriculture_rural: 0,
          science_tech: 0,
          social_welfare: 0,
        },
      };
    }
    stateMap[stateName].totalTax += Number(r.taxPaid) || 0;
    stateMap[stateName].citizens += 1;

    ALL_SECTOR_IDS.forEach((secId) => {
      stateMap[stateName].sectorTotals[secId] += Number(r.allocations?.[secId]) || 0;
    });
  });

  const stateBreakdown: StateCivicMetric[] = Object.entries(stateMap)
    .map(([state, data]) => {
      let topSec: SectorId = 'infrastructure';
      let maxSecScore = -1;
      ALL_SECTOR_IDS.forEach((secId) => {
        if (data.sectorTotals[secId] > maxSecScore) {
          maxSecScore = data.sectorTotals[secId];
          topSec = secId;
        }
      });

      return {
        state,
        citizenCount: data.citizens,
        totalTaxPaid: data.totalTax,
        topSectorId: topSec,
        topSectorName: SECTOR_DEFINITIONS[topSec].shortName,
        avgTaxPerCitizen: Math.round(data.totalTax / (data.citizens || 1)),
      };
    })
    .sort((a, b) => b.totalTaxPaid - a.totalTaxPaid);

  // Recent Citizen Proposals Feed
  const recentCitizenProposals = activeRecords
    .filter((r) => r.citizenProposal && r.citizenProposal.trim().length > 0)
    .map((r) => {
      // Find top allocated sector for this citizen
      let topSec: SectorId = 'infrastructure';
      let maxPct = 0;
      ALL_SECTOR_IDS.forEach((secId) => {
        const val = Number(r.allocations?.[secId]) || 0;
        if (val > maxPct) {
          maxPct = val;
          topSec = secId;
        }
      });

      return {
        id: r.id,
        fullName: r.fullName,
        city: r.city,
        state: r.state,
        taxPaid: r.taxPaid,
        financialYear: r.financialYear,
        citizenProposal: r.citizenProposal!,
        topSector: SECTOR_DEFINITIONS[topSec].shortName,
        date: r.submissionDate,
      };
    });

  // Calculate National Tangible Outcomes
  const infraAmount = sectorSums.infrastructure.totalAmount;
  const healthAmount = sectorSums.healthcare.totalAmount;
  const eduAmount = sectorSums.education.totalAmount;
  const energyAmount = sectorSums.clean_energy.totalAmount;
  const agriAmount = sectorSums.agriculture_rural.totalAmount;
  const techAmount = sectorSums.science_tech.totalAmount;

  const tangibleOutcomes = {
    roadMeters: Math.round(infraAmount / 12000),
    drainageMeters: Math.round(infraAmount / 15000),
    solarPanelsKwh: Math.round(energyAmount / 4500),
    hospitalDiagnostics: Math.round(healthAmount / 3500),
    studentScholarships: Math.round(eduAmount / 25000),
    farmerIrrigationDays: Math.round(agriAmount / 8000),
    researchHours: Math.round(techAmount / 10000),
    co2TonsMitigated: Math.round((energyAmount / 4500) * 0.8),
  };

  return {
    totalTaxesPaid,
    totalCitizens,
    activeStatesCount: statesSet.size,
    activeCitiesCount: citiesSet.size,
    financialYears,
    selectedFinancialYear,
    averageTaxPerCitizen,
    sectorConsensus,
    topRankedSectors,
    stateBreakdown,
    recentCitizenProposals,
    tangibleOutcomes,
  };
}
