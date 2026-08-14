import React, { useState } from 'react';
import {
  Download,
  Printer,
  ShieldCheck,
  Award,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  QrCode,
  FileText,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { TaxRecord, SectorId } from '../types';
import { SECTOR_DEFINITIONS, ALL_SECTOR_IDS } from '../data/sectors';
import {
  formatCurrencyINR,
  formatCompactINR,
  maskPAN,
  maskAadhaar,
  getTaxpayerTier,
} from '../utils/formatters';
import { generateTaxCertificatePdf } from '../utils/pdfExport';

interface PdfReportsViewProps {
  records: TaxRecord[];
  onNewFiling: () => void;
}

export const PdfReportsView: React.FC<PdfReportsViewProps> = ({
  records,
  onNewFiling,
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    records.length > 0 ? records[0].id : ''
  );
  const [isExporting, setIsExporting] = useState(false);

  if (records.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] p-12 shadow-sm">
          <FileText className="w-12 h-12 text-[#64748B] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#E2E8F0] font-serif mb-2">No Reports Available Yet</h2>
          <p className="text-[#94A3B8] text-sm max-w-md mx-auto mb-6">
            Complete your annual tax allocation form to generate verified official civic reports and downloadable PDF certificates.
          </p>
          <button
            onClick={onNewFiling}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition"
          >
            File First Return
          </button>
        </div>
      </div>
    );
  }

  const selectedRecord = records.find((r) => r.id === selectedRecordId) || records[0];
  const taxpayerTier = getTaxpayerTier(selectedRecord.taxPaid);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      await generateTaxCertificatePdf(selectedRecord);
    } catch (e) {
      console.error('PDF export failed', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Verifiable Civic Documentation</span>
          </div>
          <h1 className="text-2xl font-bold text-[#E2E8F0] font-serif">
            Citizen Tax Allocation & Civic Report Hub
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Download tamper-evident PDF certificates specifying your tax contribution and participatory budget direction.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-emerald-950/40 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating PDF...' : 'Download Official PDF'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-[#1E293B] hover:bg-[#334155] text-[#E2E8F0] px-4 py-2.5 rounded-xl text-sm font-semibold border border-[#334155] transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Records List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider px-1">
            Select Financial Year Certificate:
          </h2>

          <div className="space-y-2.5">
            {records.map((rec) => {
              const isSelected = rec.id === selectedRecord.id;
              return (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecordId(rec.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/30 border-emerald-500 shadow-sm ring-1 ring-emerald-500/50'
                      : 'bg-[#0F172A] border-[#1E293B] hover:border-[#334155] hover:bg-[#131E32]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#E2E8F0] bg-[#1E293B] px-2 py-0.5 rounded border border-[#334155]">
                      FY {rec.financialYear}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-400 font-mono">
                      {formatCurrencyINR(rec.taxPaid)}
                    </span>
                  </div>

                  <div className="text-xs text-[#94A3B8] font-medium truncate mt-1">
                    {rec.fullName} ({rec.profession})
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-2 pt-2 border-t border-[#1E293B]">
                    <span className="font-mono">{rec.verificationHash.slice(0, 15)}...</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                      Preview <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: High-Fidelity Printable Certificate Preview (8 Cols) */}
        <div className="lg:col-span-8">
          <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] shadow-xl overflow-hidden p-6 sm:p-10 relative">
            {/* Watermark Background Seal */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <ShieldCheck className="w-96 h-96 text-white" />
            </div>

            {/* Document Header */}
            <div className="border-b border-[#1E293B] pb-6 mb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-block bg-[#1E293B] text-emerald-400 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded mb-2 border border-[#334155]">
                    REPUBLIC CITIZEN CIVIC PORTAL
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#E2E8F0] tracking-tight">
                    Citizen Tax Allocation & Civic Contribution Certificate
                  </h2>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Issued under the Participatory Public Budgeting & Civic Transparency Mandate
                  </p>
                </div>

                {/* QR / Security Stamp */}
                <div className="text-right shrink-0">
                  <div className="w-16 h-16 bg-[#1E293B] border border-[#334155] rounded-lg p-1 flex flex-col items-center justify-center text-[#E2E8F0] shadow-inner">
                    <QrCode className="w-10 h-10 text-emerald-400" />
                    <span className="text-[7px] font-mono font-bold uppercase mt-0.5 text-[#94A3B8]">SECURE VERIFIED</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#94A3B8] mt-4 pt-3 border-t border-[#1E293B] flex-wrap gap-2">
                <span>
                  Financial Assessment Year: <strong className="text-[#E2E8F0]">FY {selectedRecord.financialYear}</strong>
                </span>
                <span>
                  Digital Verification Code: <strong className="font-mono text-emerald-400">{selectedRecord.verificationHash}</strong>
                </span>
              </div>
            </div>

            {/* Section 1: Taxpayer Identification */}
            <div className="bg-[#0A0B0D] border border-[#1E293B] rounded-xl p-4 mb-6">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">
                1. Citizen Identification Details
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[#64748B] block text-[11px]">Full Name:</span>
                  <span className="font-bold text-[#E2E8F0] text-sm">{selectedRecord.fullName}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[11px]">Profession & Age:</span>
                  <span className="font-semibold text-[#CBD5E1]">{selectedRecord.profession} ({selectedRecord.age}y)</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[11px]">Masked PAN:</span>
                  <span className="font-mono font-bold text-[#CBD5E1]">{maskPAN(selectedRecord.panNumber)}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[11px]">Masked Aadhaar:</span>
                  <span className="font-mono font-bold text-[#CBD5E1]">{maskAadhaar(selectedRecord.aadhaarNumber)}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[11px]">Location:</span>
                  <span className="font-semibold text-[#CBD5E1]">{selectedRecord.city}, {selectedRecord.state}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[11px]">Gross Annual Income:</span>
                  <span className="font-semibold text-[#CBD5E1]">{formatCurrencyINR(selectedRecord.annualSalary)}</span>
                </div>
                <div className="sm:col-span-2 bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-2 flex items-center justify-between">
                  <span className="text-emerald-300 font-semibold text-xs">Direct Tax Contributed:</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    {formatCurrencyINR(selectedRecord.taxPaid)}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Sector-wise Allocation Matrix */}
            <div className="mb-6">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">
                2. Citizen Directed Public Sector Budget Breakdown
              </span>

              <div className="border border-[#1E293B] rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#1E293B] text-[#CBD5E1] font-bold border-b border-[#1E293B]">
                    <tr>
                      <th className="py-2.5 px-3">Public Service Sector</th>
                      <th className="py-2.5 px-3 text-center">Citizen Pref %</th>
                      <th className="py-2.5 px-3 text-right">Rupee Amount Allocated</th>
                      <th className="py-2.5 px-3 text-right">Tangible Public Output</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {ALL_SECTOR_IDS.map((secId) => {
                      const sec = SECTOR_DEFINITIONS[secId];
                      const pct = selectedRecord.allocations[secId] || 0;
                      const amt = Math.round((Number(selectedRecord.taxPaid) * pct) / 100);
                      const count = Math.max(1, Math.floor(amt / sec.tangibleUnit.unitCost));

                      return (
                        <tr key={secId} className={pct > 0 ? 'bg-[#0F172A]' : 'bg-[#0A0B0D]/50 opacity-60'}>
                          <td className="py-2.5 px-3 font-semibold text-[#E2E8F0] flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sec.chartColor }}></span>
                            <span>{sec.name}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-400">
                            {pct}%
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-[#E2E8F0]">
                            {formatCurrencyINR(amt)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#94A3B8] text-[11px]">
                            {count.toLocaleString()} {sec.tangibleUnit.label.slice(0, 24)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: AI / Policy Impact Statement & Citizen Proposal */}
            <div className="bg-[#131E32] border border-[#1E293B] rounded-xl p-4 mb-6 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Civic Impact Statement:</span>
              </div>
              <p className="text-[#CBD5E1] leading-relaxed">
                {selectedRecord.aiImpactSummary?.summary ||
                  `Your direct contribution of ${formatCurrencyINR(selectedRecord.taxPaid)} creates quantifiable civic progress in public healthcare clinics, modern road transit, and educational technology.`}
              </p>
              {selectedRecord.citizenProposal && (
                <div className="pt-2 border-t border-[#1E293B]">
                  <strong className="text-[#E2E8F0]">Citizen Municipal Proposal: </strong>
                  <span className="italic text-[#94A3B8]">"{selectedRecord.citizenProposal}"</span>
                </div>
              )}
            </div>

            {/* Document Footer Verification Stamp */}
            <div className="border-t border-[#1E293B] pt-4 flex items-center justify-between text-[11px] text-[#64748B] flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Authenticity Verified • CivicTax Open Governance Network</span>
              </div>
              <div>
                <span>Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
