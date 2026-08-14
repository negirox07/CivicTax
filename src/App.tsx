import React, { useState, useEffect, useCallback } from 'react';
import { Header, AppNavTab } from './components/Header';
import { GlobalDashboardView } from './components/GlobalDashboardView';
import { TaxFilingForm } from './components/TaxFilingForm';
import { DashboardView } from './components/DashboardView';
import { PdfReportsView } from './components/PdfReportsView';
import { CivicTransparencyView } from './components/CivicTransparencyView';
import { CertificateModal } from './components/CertificateModal';
import { TaxRecord } from './types';
import {
  fetchAllTaxRecords,
  persistTaxRecord,
  removeTaxRecord,
} from './utils/dataService';
import { resetToSampleData } from './utils/storage';
import { generateTaxCertificatePdf } from './utils/pdfExport';
import { Landmark, ShieldCheck } from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<TaxRecord[]>([]);
  const [activeTab, setActiveTab] = useState<AppNavTab>('global');
  const [editingRecord, setEditingRecord] = useState<TaxRecord | null>(null);
  const [inspectedRecord, setInspectedRecord] = useState<TaxRecord | null>(null);
  const [dataSource, setDataSource] = useState<'SUPABASE' | 'LOCAL_STORAGE'>('LOCAL_STORAGE');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load records from Supabase (or local fallback)
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchAllTaxRecords();
      setRecords(res.records);
      setDataSource(res.source);
    } catch (err) {
      console.error('Failed to load tax records:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save or update a record
  const handleSaveRecord = async (record: TaxRecord) => {
    const res = await persistTaxRecord(record);
    setRecords(res.updatedRecords);
    setEditingRecord(null);
  };

  // Delete a record
  const handleDeleteRecord = async (id: string) => {
    const res = await removeTaxRecord(id);
    setRecords(res.updatedRecords);
  };

  // Reset to initial sample records
  const handleResetData = () => {
    if (window.confirm('Reset local dataset to pre-loaded multi-citizen sample tax records?')) {
      const samples = resetToSampleData();
      setRecords(samples);
      setEditingRecord(null);
      setActiveTab('global');
    }
  };

  // Trigger New Filing
  const handleNewFiling = () => {
    setEditingRecord(null);
    setActiveTab('filing');
  };

  // Trigger Edit
  const handleSelectEdit = (record: TaxRecord) => {
    setEditingRecord(record);
    setActiveTab('filing');
  };

  // Trigger PDF Download
  const handleDownloadPdf = async (record: TaxRecord) => {
    await generateTaxCertificatePdf(record);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#E2E8F0] flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'filing') {
            setEditingRecord(null);
          }
        }}
        records={records}
        onResetData={handleResetData}
        onNewFiling={handleNewFiling}
        dataSource={dataSource}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {/* Landing Page: Global Public Dashboard */}
        {activeTab === 'global' && (
          <GlobalDashboardView
            records={records}
            onStartFiling={handleNewFiling}
            onGoToPersonalDashboard={() => setActiveTab('dashboard')}
            onGoToReports={() => setActiveTab('reports')}
            dataSource={dataSource}
            onReloadData={loadData}
          />
        )}

        {/* Individual Tax Filing & Allocation Form */}
        {activeTab === 'filing' && (
          <TaxFilingForm
            initialData={editingRecord}
            onSaveRecord={handleSaveRecord}
            onGoToDashboard={() => setActiveTab('dashboard')}
            onDownloadPdf={handleDownloadPdf}
          />
        )}

        {/* Citizen Personal Multi-Year Filings Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardView
            records={records}
            onSelectEdit={handleSelectEdit}
            onDeleteRecord={handleDeleteRecord}
            onDownloadPdf={handleDownloadPdf}
            onNewFiling={handleNewFiling}
            onViewCertModal={(rec) => setInspectedRecord(rec)}
          />
        )}

        {/* PDF Reports & Verification Center */}
        {activeTab === 'reports' && (
          <PdfReportsView
            records={records}
            onNewFiling={handleNewFiling}
          />
        )}

        {/* Civic Transparency & Fiscal Matrix */}
        {activeTab === 'transparency' && <CivicTransparencyView />}
      </main>

      {/* Certificate Modal */}
      <CertificateModal
        record={inspectedRecord}
        onClose={() => setInspectedRecord(null)}
      />

      {/* Footer */}
      <footer className="bg-[#0F172A] text-[#94A3B8] border-t border-[#1E293B] py-8 px-4 sm:px-6 lg:px-8 mt-12 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <Landmark className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-[#E2E8F0]">CivicTax</span>
            <span>— National Citizen-Directed Tax Transparency Ledger & Participatory Budget Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[#64748B] text-xs">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit Masked Privacy Safe</span>
            </span>
            <span>•</span>
            <span className="text-[#94A3B8]">Supabase Ready</span>
            <span>•</span>
            <span className="text-[#94A3B8]">Open Civic Governance</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
