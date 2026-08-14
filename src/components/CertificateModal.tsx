import React from 'react';
import { X, Download, Printer, ShieldCheck, QrCode } from 'lucide-react';
import { TaxRecord } from '../types';
import { SECTOR_DEFINITIONS, ALL_SECTOR_IDS } from '../data/sectors';
import { formatCurrencyINR, maskPAN, maskAadhaar } from '../utils/formatters';
import { generateTaxCertificatePdf } from '../utils/pdfExport';

interface CertificateModalProps {
  record: TaxRecord | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-[#0A0B0D] text-[#E2E8F0] border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm font-serif">Citizen Tax Certificate - FY {record.financialYear}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => generateTaxCertificatePdf(record)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#94A3B8] hover:text-white p-1 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body Preview */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs bg-[#0F172A]">
          {/* Official Header */}
          <div className="text-center border-b border-[#1E293B] pb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] block mb-1">
              REPUBLIC CITIZEN PARTICIPATORY BUDGETING PLATFORM
            </span>
            <h2 className="text-xl font-bold font-serif text-[#E2E8F0]">
              Citizen Tax Allocation & Civic Contribution Certificate
            </h2>
            <div className="text-[#94A3B8] text-[11px] mt-1">
              Financial Assessment Year: <strong className="text-[#E2E8F0]">FY {record.financialYear}</strong> • Verification Hash: <strong className="font-mono text-emerald-400">{record.verificationHash}</strong>
            </div>
          </div>

          {/* Citizen Details Box */}
          <div className="bg-[#0A0B0D] border border-[#1E293B] rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-[#64748B] block text-[10px] uppercase">Taxpayer Name:</span>
              <span className="font-bold text-[#E2E8F0] text-sm">{record.fullName}</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px] uppercase">Profession:</span>
              <span className="font-semibold text-[#CBD5E1]">{record.profession} ({record.age}y)</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px] uppercase">Masked PAN:</span>
              <span className="font-mono font-bold text-[#CBD5E1]">{maskPAN(record.panNumber)}</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px] uppercase">Masked Aadhaar:</span>
              <span className="font-mono font-bold text-[#CBD5E1]">{maskAadhaar(record.aadhaarNumber)}</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px] uppercase">Location:</span>
              <span className="font-semibold text-[#CBD5E1]">{record.city}, {record.state}</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px] uppercase">Gross Salary:</span>
              <span className="font-semibold text-[#CBD5E1]">{formatCurrencyINR(record.annualSalary)}</span>
            </div>
            <div className="sm:col-span-2 bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-2 flex items-center justify-between">
              <span className="text-emerald-300 font-semibold text-xs">Direct Tax Contributed:</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">
                {formatCurrencyINR(record.taxPaid)}
              </span>
            </div>
          </div>

          {/* Allocation Table */}
          <div>
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">
              Citizen Directed Sector Allocations:
            </span>
            <div className="border border-[#1E293B] rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#1E293B] text-[#CBD5E1] font-bold border-b border-[#1E293B]">
                  <tr>
                    <th className="py-2 px-3">Public Sector</th>
                    <th className="py-2 px-3 text-center">Pref %</th>
                    <th className="py-2 px-3 text-right">Rupee Amount</th>
                    <th className="py-2 px-3 text-right">Realized Tangible Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {ALL_SECTOR_IDS.map((secId) => {
                    const sec = SECTOR_DEFINITIONS[secId];
                    const pct = record.allocations[secId] || 0;
                    const amt = Math.round((Number(record.taxPaid) * pct) / 100);
                    const units = Math.max(1, Math.floor(amt / sec.tangibleUnit.unitCost));

                    return (
                      <tr key={secId} className={pct > 0 ? 'bg-[#0F172A]' : 'bg-[#0A0B0D]/50 opacity-60'}>
                        <td className="py-2 px-3 font-semibold text-[#E2E8F0] flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sec.chartColor }}></span>
                          <span>{sec.name}</span>
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-400">{pct}%</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#E2E8F0]">{formatCurrencyINR(amt)}</td>
                        <td className="py-2 px-3 text-right text-[#94A3B8] text-[11px]">{units.toLocaleString()} {sec.tangibleUnit.label.slice(0, 20)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Citizen Proposal & AI Statement */}
          <div className="bg-[#131E32] border border-[#1E293B] rounded-xl p-4 space-y-2">
            <span className="font-bold text-emerald-400 block text-xs">Civic Impact Summary:</span>
            <p className="text-[#CBD5E1] leading-relaxed">
              {record.aiImpactSummary?.summary ||
                `Your contribution of ${formatCurrencyINR(record.taxPaid)} creates verifiable advancements in infrastructure, public health, and education.`}
            </p>
            {record.citizenProposal && (
              <div className="pt-2 border-t border-[#1E293B]">
                <span className="font-bold text-[#E2E8F0]">Citizen Proposal: </span>
                <span className="italic text-[#94A3B8]">"{record.citizenProposal}"</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3.5 bg-[#0A0B0D] border-t border-[#1E293B] flex items-center justify-between">
          <span className="text-[11px] text-[#94A3B8]">
            Digital Certificate • Masked ID Protection Active
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => generateTaxCertificatePdf(record)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="bg-[#1E293B] hover:bg-[#334155] text-[#E2E8F0] text-xs font-semibold px-4 py-2 rounded-xl border border-[#334155] transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
