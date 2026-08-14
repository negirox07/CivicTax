import { TaxRecord } from '../types';
import { INITIAL_SAMPLE_RECORDS } from '../data/sectors';

const STORAGE_KEY = 'civictax_citizen_records_v1';

export function loadTaxRecords(): TaxRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Initialize with sample records
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_RECORDS));
      return INITIAL_SAMPLE_RECORDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_SAMPLE_RECORDS;
  } catch (err) {
    console.error('Failed to load tax records from localStorage', err);
    return INITIAL_SAMPLE_RECORDS;
  }
}

export function saveTaxRecords(records: TaxRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save tax records to localStorage', err);
  }
}

export function addOrUpdateTaxRecord(record: TaxRecord): TaxRecord[] {
  const existing = loadTaxRecords();
  const index = existing.findIndex((r) => r.id === record.id);
  let updated: TaxRecord[];
  if (index >= 0) {
    updated = [...existing];
    updated[index] = record;
  } else {
    // Check if same financial year exists
    const fyIndex = existing.findIndex((r) => r.financialYear === record.financialYear);
    if (fyIndex >= 0) {
      // replace the old filing for the same financial year
      updated = [...existing];
      updated[fyIndex] = record;
    } else {
      updated = [record, ...existing];
    }
  }
  // Sort descending by financial year
  updated.sort((a, b) => b.financialYear.localeCompare(a.financialYear));
  saveTaxRecords(updated);
  return updated;
}

export function deleteTaxRecord(id: string): TaxRecord[] {
  const existing = loadTaxRecords();
  const filtered = existing.filter((r) => r.id !== id);
  saveTaxRecords(filtered);
  return filtered;
}

export function resetToSampleData(): TaxRecord[] {
  saveTaxRecords(INITIAL_SAMPLE_RECORDS);
  return INITIAL_SAMPLE_RECORDS;
}

export function clearAllRecords(): TaxRecord[] {
  saveTaxRecords([]);
  return [];
}
