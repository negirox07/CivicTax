import React, { useState, useEffect } from 'react';
import {
  Building2,
  GraduationCap,
  HeartPulse,
  Leaf,
  ShieldCheck,
  Tractor,
  Atom,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sliders,
  Scale,
  ArrowRight,
  FileCheck2,
  Download,
  Info,
  HelpCircle,
  Layers,
  MapPin,
  CreditCard,
  User,
  DollarSign,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import confetti from 'canvas-confetti';
import { TaxRecord, SectorAllocations, SectorId } from '../types';
import { SECTOR_DEFINITIONS, ALL_SECTOR_IDS, PRESET_ALLOCATIONS } from '../data/sectors';
import { ImpactInsights } from './ImpactInsights';
import {
  formatCurrencyINR,
  formatCompactINR,
  maskPAN,
  maskAadhaar,
  formatAadhaarInput,
  generateVerificationHash,
} from '../utils/formatters';

interface TaxFilingFormProps {
  initialData?: TaxRecord | null;
  onSaveRecord: (record: TaxRecord) => void;
  onGoToDashboard: () => void;
  onDownloadPdf: (record: TaxRecord) => void;
}

const FINANCIAL_YEARS = ['2026-27', '2025-26', '2024-25', '2023-24', '2022-23', '2021-22'];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi NCR', 'Gujarat', 'Haryana',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha',
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Uttarakhand'
];

export const TaxFilingForm: React.FC<TaxFilingFormProps> = ({
  initialData,
  onSaveRecord,
  onGoToDashboard,
  onDownloadPdf,
}) => {
  // Form State
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [age, setAge] = useState<number | ''>(initialData?.age || 30);
  const [profession, setProfession] = useState(initialData?.profession || 'Software Professional');
  const [annualSalary, setAnnualSalary] = useState<number | ''>(initialData?.annualSalary || 1800000);
  const [taxPaid, setTaxPaid] = useState<number | ''>(initialData?.taxPaid || 250000);
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [panNumber, setPanNumber] = useState(initialData?.panNumber || '');
  const [aadhaarNumber, setAadhaarNumber] = useState(initialData?.aadhaarNumber || '');
  const [financialYear, setFinancialYear] = useState(initialData?.financialYear || '2025-26');
  const [state, setState] = useState(initialData?.state || 'Karnataka');
  const [city, setCity] = useState(initialData?.city || 'Bengaluru');
  const [pincode, setPincode] = useState(initialData?.pincode || '560001');
  const [citizenProposal, setCitizenProposal] = useState(initialData?.citizenProposal || '');

  // Allocations State (Default to Balanced)
  const [allocations, setAllocations] = useState<SectorAllocations>(
    initialData?.allocations || {
      infrastructure: 25,
      education: 25,
      healthcare: 20,
      clean_energy: 15,
      defense_security: 5,
      agriculture_rural: 5,
      science_tech: 3,
      social_welfare: 2,
    }
  );

  // Active UI Step
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<{ summary: string; keyTakeaways: string[]; civicEmpowermentQuote: string } | null>(
    initialData?.aiImpactSummary || null
  );
  const [submittedRecord, setSubmittedRecord] = useState<TaxRecord | null>(null);

  // Sync with initialData if it changes
  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName);
      setAge(initialData.age);
      setProfession(initialData.profession);
      setAnnualSalary(initialData.annualSalary);
      setTaxPaid(initialData.taxPaid);
      setEmail(initialData.email);
      setPhone(initialData.phone);
      setPanNumber(initialData.panNumber);
      setAadhaarNumber(initialData.aadhaarNumber);
      setFinancialYear(initialData.financialYear);
      setState(initialData.state);
      setCity(initialData.city);
      setPincode(initialData.pincode);
      setCitizenProposal(initialData.citizenProposal || '');
      setAllocations(initialData.allocations);
      setAiInsight(initialData.aiImpactSummary || null);
    }
  }, [initialData]);

  // Calculate total percentage allocated
  const totalPercentage: number = (Object.values(allocations) as number[]).reduce((acc: number, val: number): number => acc + (Number(val) || 0), 0);
  const remainingPercentage: number = 100 - totalPercentage;
  const currentTaxAmount = Number(taxPaid) || 0;

  // Sector Icon Resolver
  const renderSectorIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Building2': return <Building2 className={className} />;
      case 'GraduationCap': return <GraduationCap className={className} />;
      case 'HeartPulse': return <HeartPulse className={className} />;
      case 'Leaf': return <Leaf className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'Tractor': return <Tractor className={className} />;
      case 'Atom': return <Atom className={className} />;
      case 'Users': return <Users className={className} />;
      default: return <Building2 className={className} />;
    }
  };

  // Handle Allocation Slider Changes
  const handleAllocationChange = (sectorId: SectorId, newValue: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(newValue)));
    setAllocations((prev) => ({
      ...prev,
      [sectorId]: clamped,
    }));
  };

  // Smart Auto-Balance: Distribute remaining difference proportionally or equally
  const handleAutoBalance = () => {
    const diff: number = 100 - totalPercentage;
    if (diff === 0) return;

    // Distribute diff across active non-zero sectors or all sectors
    const entries = Object.entries(allocations) as [SectorId, number][];
    const newAlloc = { ...allocations };
    
    // Add 1% step-by-step to highest or lowest
    let remainder = 100;
    const count = entries.length;
    const baseShare = Math.floor(100 / count);
    let extra = 100 % count;

    entries.forEach(([id], idx) => {
      newAlloc[id] = baseShare + (idx < extra ? 1 : 0);
    });

    setAllocations(newAlloc);
  };

  // Apply a Curated Preset
  const applyPreset = (presetAllocations: SectorAllocations) => {
    setAllocations(presetAllocations);
  };

  // Validate form fields
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Please enter your full name';
    if (!age || age < 18 || age > 120) errs.age = 'Age must be between 18 and 120';
    if (!profession.trim()) errs.profession = 'Please specify your profession';
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid email is required for confirmation';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) errs.phone = 'Please provide a valid 10-digit mobile number';
    if (!panNumber.trim() || panNumber.trim().length !== 10) {
      errs.panNumber = 'PAN must be exactly 10 alphanumeric characters (e.g., ABCDE1234F)';
    }
    const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
    if (!cleanAadhaar || cleanAadhaar.length !== 12) {
      errs.aadhaarNumber = 'Aadhaar must be a 12-digit number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!annualSalary || Number(annualSalary) <= 0) errs.annualSalary = 'Please enter annual income';
    if (taxPaid === '' || Number(taxPaid) < 0) errs.taxPaid = 'Please enter tax paid amount';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (totalPercentage !== 100) {
      errs.allocations = `Total allocation must equal exactly 100%. Currently at ${totalPercentage}% (${remainingPercentage > 0 ? `${remainingPercentage}% remaining` : `${Math.abs(remainingPercentage)}% over`}). Use 'Auto-Balance' to resolve.`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Request AI Civic Impact Summary
  const generateAiImpact = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/civic-impact-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxpayerName: fullName,
          taxPaid: Number(taxPaid) || 0,
          salary: Number(annualSalary) || 0,
          profession,
          financialYear,
          allocations,
          citizenNote: citizenProposal,
        }),
      });
      const data = await res.json();
      if (data.summary) {
        setAiInsight(data);
      }
    } catch (e) {
      console.error('AI insight error', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Final Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) {
      setActiveStep(1);
      return;
    }
    if (!validateStep2()) {
      setActiveStep(2);
      return;
    }
    if (!validateStep3()) {
      setActiveStep(3);
      return;
    }

    const cleanPan = panNumber.toUpperCase().trim();
    const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
    const vHash = generateVerificationHash(cleanPan, financialYear, Number(taxPaid));

    const newRecord: TaxRecord = {
      id: initialData?.id || `rec_${Date.now()}`,
      fullName: fullName.trim(),
      age: Number(age),
      profession: profession.trim(),
      annualSalary: Number(annualSalary),
      taxPaid: Number(taxPaid),
      email: email.trim(),
      phone: phone.trim(),
      panNumber: cleanPan,
      aadhaarNumber: cleanAadhaar,
      financialYear,
      state,
      city: city.trim(),
      pincode: pincode.trim(),
      submissionDate: new Date().toISOString(),
      allocations,
      citizenProposal: citizenProposal.trim(),
      aiImpactSummary: aiInsight || {
        summary: `Your contribution of ${formatCurrencyINR(Number(taxPaid))} in FY ${financialYear} strategically channels vital resources into priority public development.`,
        keyTakeaways: [
          'Directly empowers regional infrastructure and medical advancements.',
          'Bolsters public education and renewable energy adoption.',
          'Strengthens participatory civic governance.',
        ],
        civicEmpowermentQuote: 'Democratic taxation is highest when citizens steer public progress.',
      },
      verificationHash: initialData?.verificationHash || vHash,
    };

    onSaveRecord(newRecord);
    setSubmittedRecord(newRecord);

    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Chart Data Preparation for Live Preview
  const chartData = ALL_SECTOR_IDS.map((secId) => {
    const sec = SECTOR_DEFINITIONS[secId];
    const pct = allocations[secId] || 0;
    const inrValue = Math.round((currentTaxAmount * pct) / 100);
    return {
      name: sec.shortName,
      fullName: sec.name,
      value: pct,
      inrValue,
      color: sec.chartColor,
    };
  }).filter((d) => d.value > 0);

  // If successfully submitted, render success modal / view
  if (submittedRecord) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] shadow-2xl overflow-hidden text-center p-8">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="inline-block bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20 mb-2">
            Filing Confirmed for FY {submittedRecord.financialYear}
          </span>

          <h2 className="text-2xl font-bold text-[#E2E8F0] font-serif mb-2">
            Civic Tax Allocation Successfully Recorded!
          </h2>
          <p className="text-[#94A3B8] text-sm max-w-lg mx-auto mb-6">
            Thank you, <strong className="text-[#E2E8F0]">{submittedRecord.fullName}</strong>. Your tax contribution of{' '}
            <strong className="text-emerald-400 font-mono">{formatCurrencyINR(submittedRecord.taxPaid)}</strong> and custom sector allocation have been saved to your civic dashboard.
          </p>

          {/* Verification Code Box */}
          <div className="bg-[#0A0B0D] border border-[#1E293B] rounded-xl p-4 max-w-md mx-auto mb-6 text-left">
            <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-1">
              <span>Digital Certificate Hash:</span>
              <span className="font-semibold text-emerald-400">VERIFIED</span>
            </div>
            <div className="font-mono text-sm font-bold text-emerald-400 tracking-wide bg-[#0F172A] p-2.5 rounded border border-[#1E293B]">
              {submittedRecord.verificationHash}
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-2">
              <span>Masked PAN: <strong className="text-[#94A3B8]">{maskPAN(submittedRecord.panNumber)}</strong></span>
              <span>Masked Aadhaar: <strong className="text-[#94A3B8]">{maskAadhaar(submittedRecord.aadhaarNumber)}</strong></span>
            </div>
          </div>

          {/* Post-Filing Impact Insights Section */}
          <div className="my-6 text-left">
            <ImpactInsights
              allocations={submittedRecord.allocations}
              taxPaid={submittedRecord.taxPaid}
              annualSalary={submittedRecord.annualSalary}
              fullName={submittedRecord.fullName}
              city={submittedRecord.city}
              state={submittedRecord.state}
              financialYear={submittedRecord.financialYear}
              citizenProposal={submittedRecord.citizenProposal}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onDownloadPdf(submittedRecord)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition active:scale-95 text-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF Certificate</span>
            </button>

            <button
              onClick={onGoToDashboard}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1E293B] hover:bg-[#334155] text-[#E2E8F0] font-semibold px-6 py-3 rounded-xl transition text-sm border border-[#334155] cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>View in Historical Dashboard</span>
            </button>

            <button
              onClick={() => {
                setSubmittedRecord(null);
                setActiveStep(1);
              }}
              className="w-full sm:w-auto text-[#94A3B8] hover:text-[#E2E8F0] text-xs font-medium px-4 py-2 cursor-pointer"
            >
              File Another Year
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Intro Banner */}
      <div className="bg-[#0F172A] text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-xl border border-[#1E293B]">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sliders className="w-4 h-4" />
            <span>Participatory Democracy & Public Budget Allocation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif mb-2 text-[#E2E8F0]">
            Citizen Tax Filing & Public Investment Allocator
          </h1>
          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
            Specify your annual tax contribution, record your identity details (PAN & Aadhaar with secure masking), and directly designate how public funds should be prioritized across <strong className="text-[#E2E8F0]">Infrastructure, Healthcare, Education, Clean Energy, and Defense</strong>.
          </p>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="flex items-center justify-between mb-8 max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => setActiveStep(1)}
          className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-semibold border-b-2 transition flex-1 justify-center cursor-pointer ${
            activeStep === 1
              ? 'border-emerald-500 text-emerald-400'
              : 'border-[#1E293B] text-[#64748B] hover:text-[#94A3B8]'
          }`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            activeStep === 1 ? 'bg-emerald-500 text-slate-950' : 'bg-[#1E293B] text-[#94A3B8]'
          }`}>1</span>
          <span>Citizen Identity</span>
        </button>

        <div className="w-6 h-px bg-[#1E293B]"></div>

        <button
          type="button"
          onClick={() => {
            if (validateStep1()) setActiveStep(2);
          }}
          className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-semibold border-b-2 transition flex-1 justify-center cursor-pointer ${
            activeStep === 2
              ? 'border-emerald-500 text-emerald-400'
              : 'border-[#1E293B] text-[#64748B] hover:text-[#94A3B8]'
          }`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            activeStep === 2 ? 'bg-emerald-500 text-slate-950' : 'bg-[#1E293B] text-[#94A3B8]'
          }`}>2</span>
          <span>Tax & Financial Year</span>
        </button>

        <div className="w-6 h-px bg-[#1E293B]"></div>

        <button
          type="button"
          onClick={() => {
            if (validateStep1() && validateStep2()) setActiveStep(3);
          }}
          className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-semibold border-b-2 transition flex-1 justify-center cursor-pointer ${
            activeStep === 3
              ? 'border-emerald-500 text-emerald-400'
              : 'border-[#1E293B] text-[#64748B] hover:text-[#94A3B8]'
          }`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            activeStep === 3 ? 'bg-emerald-500 text-slate-950' : 'bg-[#1E293B] text-[#94A3B8]'
          }`}>3</span>
          <span>Budget Allocation & Charts</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* STEP 1: CITIZEN IDENTITY DETAILS */}
        {activeStep === 1 && (
          <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] shadow-xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#E2E8F0] flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-400" />
                  Step 1: Citizen Identification & Demographics
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Required for official annual tax certification and demographic civic consensus.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#64748B]">Section 1 of 3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
                  Full Name (As on PAN/Aadhaar) *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Mukesh Singh Negi"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-[#0A0B0D] text-[#E2E8F0] focus:outline-none focus:ring-2 placeholder:text-[#64748B] ${
                    errors.fullName ? 'border-rose-400 focus:ring-rose-200' : 'border-[#1E293B] focus:border-emerald-500 focus:ring-emerald-500/30'
                  }`}
                />
                {errors.fullName && <p className="text-xs text-rose-400 mt-1">{errors.fullName}</p>}
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
                  Age (Years) *
                </label>
                <input
                  type="number"
                  min="18"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="e.g. 34"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-[#0A0B0D] text-[#E2E8F0] focus:outline-none focus:ring-2 placeholder:text-[#64748B] ${
                    errors.age ? 'border-rose-400 focus:ring-rose-200' : 'border-[#1E293B] focus:border-emerald-500 focus:ring-emerald-500/30'
                  }`}
                />
                {errors.age && <p className="text-xs text-rose-400 mt-1">{errors.age}</p>}
              </div>

              {/* Profession */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
                  Profession / Occupation *
                </label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="e.g. Senior Software Engineer, Doctor, Teacher"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-[#0A0B0D] text-[#E2E8F0] focus:outline-none focus:ring-2 placeholder:text-[#64748B] ${
                    errors.profession ? 'border-rose-400 focus:ring-rose-200' : 'border-[#1E293B] focus:border-emerald-500 focus:ring-emerald-500/30'
                  }`}
                />
                {errors.profession && <p className="text-xs text-rose-400 mt-1">{errors.profession}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
                  Email Address (For PDF Certificate Delivery) *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. mukeshsingh.negi07@gmail.com"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-[#0A0B0D] text-[#E2E8F0] focus:outline-none focus:ring-2 placeholder:text-[#64748B] ${
                    errors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-[#1E293B] focus:border-emerald-500 focus:ring-emerald-500/30'
                  }`}
                />
                {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
                  Mobile Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-[#0A0B0D] text-[#E2E8F0] focus:outline-none focus:ring-2 placeholder:text-[#64748B] ${
                    errors.phone ? 'border-rose-400 focus:ring-rose-200' : 'border-[#1E293B] focus:border-emerald-500 focus:ring-emerald-500/30'
                  }`}
                />
                {errors.phone && <p className="text-xs text-rose-400 mt-1">{errors.phone}</p>}
              </div>

              {/* PAN Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                    PAN Card (10 Digits) *
                  </label>
                  <span className="text-[11px] text-[#64748B]">Masked on export</span>
                </div>
                <input
                  type="text"
                  maxLength={10}
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. ABCDE1234F"
                  className={`w-full font-mono uppercase px-3.5 py-2.5 rounded-lg border text-sm bg-[#0A0B0D] text-[#E2E8F0] focus:outline-none focus:ring-2 placeholder:text-[#64748B] ${
                    errors.panNumber ? 'border-rose-400 focus:ring-rose-200' : 'border-[#1E293B] focus:border-emerald-500 focus:ring-emerald-500/30'
                  }`}
                />
                {errors.panNumber && <p className="text-xs text-rose-400 mt-1">{errors.panNumber}</p>}
              </div>

              {/* Aadhaar Number */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                    Aadhaar Number (12 Digits) *
                  </label>
                  <span className="text-[11px] text-emerald-400 font-medium">Auto-formatted & Protected</span>
                </div>
                <input
                  type="text"
                  maxLength={14}
                  value={formatAadhaarInput(aadhaarNumber)}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\s+/g, ''))}
                  placeholder="e.g. 1234 5678 9012"
                  className={`w-full font-mono tracking-wider px-3.5 py-2.5 rounded-lg border text-sm bg-[#0A0B0D] text-[#E2E8F0] focus:outline-none focus:ring-2 placeholder:text-[#64748B] ${
                    errors.aadhaarNumber ? 'border-rose-400 focus:ring-rose-200' : 'border-[#1E293B] focus:border-emerald-500 focus:ring-emerald-500/30'
                  }`}
                />
                {errors.aadhaarNumber && <p className="text-xs text-rose-400 mt-1">{errors.aadhaarNumber}</p>}
              </div>

              {/* State & City */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
                  State / Union Territory *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#1E293B] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-[#0A0B0D] text-[#E2E8F0]"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st} className="bg-[#0F172A] text-[#E2E8F0]">{st}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bengaluru"
                    className="w-full px-3 py-2.5 rounded-lg border border-[#1E293B] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-[#0A0B0D] text-[#E2E8F0] placeholder:text-[#64748B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="560001"
                    className="w-full px-3 py-2.5 rounded-lg border border-[#1E293B] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono bg-[#0A0B0D] text-[#E2E8F0] placeholder:text-[#64748B]"
                  />
                </div>
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-4 flex justify-end border-t border-[#1E293B]">
              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) setActiveStep(2);
                }}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 transition active:scale-95 text-sm cursor-pointer"
              >
                <span>Continue to Tax Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: TAX & FINANCIAL YEAR */}
        {activeStep === 2 && (
          <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] shadow-xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#E2E8F0] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  Step 2: Financial Year & Tax Paid
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Select the financial year you are filing for and your direct tax contribution.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#64748B]">Section 2 of 3</span>
            </div>

            <div className="space-y-6">
              {/* Financial Year Selection Pills */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
                  Select Assessment / Financial Year *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {FINANCIAL_YEARS.map((fy) => (
                    <button
                      key={fy}
                      type="button"
                      onClick={() => setFinancialYear(fy)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold transition border text-center cursor-pointer ${
                        financialYear === fy
                          ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-500 shadow-sm'
                          : 'bg-[#0A0B0D] text-[#94A3B8] border-[#1E293B] hover:bg-[#1E293B] hover:text-[#E2E8F0]'
                      }`}
                    >
                      FY {fy}
                    </button>
                  ))}
                </div>
              </div>

              {/* Annual Salary & Tax Paid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
                    Annual Gross Income / Salary (INR ₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-[#64748B] font-bold text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={annualSalary}
                      onChange={(e) => setAnnualSalary(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder="1800000"
                      className={`w-full pl-8 pr-3.5 py-2.5 rounded-lg border text-sm font-semibold bg-[#0A0B0D] text-[#E2E8F0] focus:outline-none focus:ring-2 placeholder:text-[#64748B] ${
                        errors.annualSalary ? 'border-rose-400 focus:ring-rose-200' : 'border-[#1E293B] focus:border-emerald-500 focus:ring-emerald-500/30'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] text-[#94A3B8] mt-1 block">
                    {annualSalary ? formatCompactINR(Number(annualSalary)) : 'e.g. ₹ 18 Lakh'}
                  </span>
                  {errors.annualSalary && <p className="text-xs text-rose-400 mt-1">{errors.annualSalary}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
                    Total Income Tax Paid (INR ₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-emerald-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={taxPaid}
                      onChange={(e) => setTaxPaid(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder="250000"
                      className={`w-full pl-8 pr-3.5 py-2.5 rounded-lg border text-sm font-bold text-emerald-400 bg-[#0A0B0D] focus:outline-none focus:ring-2 placeholder:text-[#64748B] ${
                        errors.taxPaid ? 'border-rose-400 focus:ring-rose-200' : 'border-[#1E293B] focus:border-emerald-500 focus:ring-emerald-500/30'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium mt-1 block">
                    {taxPaid ? `Allocatable Tax Pool: ${formatCurrencyINR(Number(taxPaid))}` : 'e.g. ₹ 2,50,000'}
                  </span>
                  {errors.taxPaid && <p className="text-xs text-rose-400 mt-1">{errors.taxPaid}</p>}
                </div>
              </div>

              {/* Effective Tax Rate Metric Box */}
              {annualSalary && taxPaid && Number(annualSalary) > 0 && (
                <div className="bg-[#0A0B0D] border border-[#1E293B] rounded-xl p-4 flex items-center justify-between flex-wrap gap-4 text-xs">
                  <div>
                    <span className="text-[#94A3B8] block">Effective Direct Tax Rate:</span>
                    <span className="text-base font-bold text-[#E2E8F0]">
                      {((Number(taxPaid) / Number(annualSalary)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-8 w-px bg-[#1E293B] hidden sm:block"></div>
                  <div>
                    <span className="text-[#94A3B8] block">Monthly Civic Contribution:</span>
                    <span className="text-base font-bold text-emerald-400">
                      {formatCurrencyINR(Math.round(Number(taxPaid) / 12))} / month
                    </span>
                  </div>
                  <div className="h-8 w-px bg-[#1E293B] hidden sm:block"></div>
                  <div>
                    <span className="text-[#94A3B8] block">Demographic Status:</span>
                    <span className="text-base font-bold text-emerald-400">
                      Top Decile Nation Contributor
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Nav buttons */}
            <div className="pt-4 flex items-center justify-between border-t border-[#1E293B]">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="text-[#94A3B8] hover:text-[#E2E8F0] text-xs font-semibold px-4 py-2 cursor-pointer"
              >
                Back to Identity
              </button>

              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) setActiveStep(3);
                }}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 transition active:scale-95 text-sm cursor-pointer"
              >
                <span>Continue to Budget Allocation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CIVIC TAX ALLOCATION & GRAPHICAL REPRESENTATION */}
        {activeStep === 3 && (
          <div className="space-y-8">
            {/* Top Allocation Header & Presets Bar */}
            <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] shadow-xl p-6 sm:p-8">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#1E293B] pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#E2E8F0] flex items-center gap-2 font-serif">
                    <Layers className="w-5 h-5 text-emerald-400" />
                    Step 3: Direct Your Tax Allocation across Civic Sectors
                  </h2>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    How should the government invest your <strong className="text-emerald-400 font-mono">{formatCurrencyINR(currentTaxAmount)}</strong> tax contribution? Adjust the percentage sliders below.
                  </p>
                </div>

                {/* Total % Badge & Auto-Balance Button */}
                <div className="flex items-center gap-3">
                  <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    totalPercentage === 100
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : totalPercentage < 100
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    <span>Total Allocated: <strong>{totalPercentage}%</strong></span>
                    {totalPercentage === 100 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span>({remainingPercentage > 0 ? `${remainingPercentage}% remaining` : `${Math.abs(remainingPercentage)}% over`})</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoBalance}
                    className="text-xs font-semibold bg-[#1E293B] hover:bg-[#334155] text-[#E2E8F0] px-3 py-1.5 rounded-xl border border-[#334155] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Auto-Balance 100%</span>
                  </button>
                </div>
              </div>

              {/* Presets Quick Picker */}
              <div className="mb-6">
                <span className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
                  Quick Civic Strategy Presets:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {PRESET_ALLOCATIONS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset.allocations)}
                      className="p-2.5 rounded-xl border border-[#1E293B] hover:border-emerald-500/40 bg-[#0A0B0D] hover:bg-[#1E293B]/70 text-left transition group cursor-pointer"
                    >
                      <div className="text-xs font-bold text-[#E2E8F0] group-hover:text-emerald-400">
                        {preset.title}
                      </div>
                      <div className="text-[10px] text-[#94A3B8] line-clamp-1 mt-0.5">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {errors.allocations && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/60 text-rose-300 rounded-xl text-xs flex items-center gap-2 mb-6">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.allocations}</span>
                </div>
              )}

              {/* Main Grid: Left Sliders, Right Live Visual Chart & Impact */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Sector Sliders (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {ALL_SECTOR_IDS.map((secId) => {
                    const sec = SECTOR_DEFINITIONS[secId];
                    const pct = allocations[secId] || 0;
                    const allocatedAmount = Math.round((currentTaxAmount * pct) / 100);
                    const unitsFunded = Math.max(0, Math.floor(allocatedAmount / sec.tangibleUnit.unitCost));

                    return (
                      <div
                        key={secId}
                        className={`p-4 rounded-xl border transition ${
                          pct > 0 ? 'bg-[#0A0B0D] border-[#1E293B] shadow-md' : 'bg-[#0A0B0D]/50 border-[#1E293B]/50 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
                              style={{ backgroundColor: sec.chartColor }}
                            >
                              {renderSectorIcon(sec.iconName, 'w-4 h-4')}
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm font-bold text-[#E2E8F0]">{sec.name}</div>
                              <div className="text-[11px] text-[#94A3B8] hidden sm:block">{sec.description}</div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-sm font-bold text-[#E2E8F0] font-mono">
                              {pct}%
                            </div>
                            <div className="text-xs font-semibold text-emerald-400 font-mono">
                              {formatCurrencyINR(allocatedAmount)}
                            </div>
                          </div>
                        </div>

                        {/* Slider Control */}
                        <div className="space-y-1.5">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={pct}
                            onChange={(e) => handleAllocationChange(secId, parseFloat(e.target.value))}
                            className="w-full h-2 bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />

                          {/* Tangible Civic Impact Tag */}
                          <div className="flex items-center justify-between text-[11px] text-[#94A3B8] pt-1">
                            <span className="text-emerald-400 font-medium">
                              Funds ≈ <strong>{unitsFunded.toLocaleString()}</strong> {sec.tangibleUnit.label}
                            </span>
                            <span className="text-[#64748B]">
                              Nat'l Avg: {sec.benchmarkPct}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Column: Live Graphic Visualizer & Tangible Outcomes (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Live Donut Chart Card */}
                  <div className="bg-[#0A0B0D] border border-[#1E293B] rounded-2xl p-5 shadow-inner">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#E2E8F0] uppercase tracking-wider">
                        Live Allocation Split
                      </span>
                      <span className="text-xs font-semibold text-emerald-400 font-mono">
                        {formatCurrencyINR(currentTaxAmount)}
                      </span>
                    </div>

                    <div className="h-56 w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            formatter={(value: any, _name: any, item: any) => [
                              `${value}% (${formatCurrencyINR(item.payload.inrValue)})`,
                              item.payload.fullName,
                            ]}
                            contentStyle={{
                              backgroundColor: '#0F172A',
                              borderColor: '#334155',
                              borderRadius: '12px',
                              color: '#E2E8F0',
                            }}
                            itemStyle={{ color: '#E2E8F0' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Center Label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] uppercase font-bold text-[#64748B]">Tax Pool</span>
                        <span className="text-xs font-extrabold text-emerald-400 font-mono">{formatCompactINR(currentTaxAmount)}</span>
                      </div>
                    </div>

                    {/* Chart Sector Legend */}
                    <div className="grid grid-cols-2 gap-1.5 mt-2 pt-2 border-t border-[#1E293B]">
                      {chartData.map((sec) => (
                        <div key={sec.name} className="flex items-center gap-1.5 text-[11px]">
                          <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: sec.color }}></span>
                          <span className="text-[#94A3B8] truncate">{sec.name}:</span>
                          <span className="font-bold text-[#E2E8F0] font-mono">{sec.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tangible Civic Impact Summary Card */}
                  <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-[#1E293B] rounded-2xl p-5 shadow-lg">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-3">
                      <Sparkles className="w-4 h-4" />
                      <span>Your Tax in Physical Action</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {ALL_SECTOR_IDS.filter((id) => Number(allocations[id] || 0) >= 15).map((id) => {
                        const sec = SECTOR_DEFINITIONS[id];
                        const pct = Number(allocations[id] || 0);
                        const amt = Math.round((currentTaxAmount * pct) / 100);
                        const count = Math.max(1, Math.floor(amt / sec.tangibleUnit.unitCost));

                        return (
                          <div key={id} className="bg-[#0A0B0D]/80 rounded-xl p-2.5 border border-[#334155]/60 flex items-start gap-2.5">
                            <div className="p-1.5 rounded-lg bg-[#1E293B] text-emerald-400 shrink-0 mt-0.5">
                              {renderSectorIcon(sec.iconName, 'w-3.5 h-3.5')}
                            </div>
                            <div>
                              <div className="font-bold text-[#E2E8F0]">
                                {count.toLocaleString()} {sec.tangibleUnit.label}
                              </div>
                              <div className="text-[11px] text-[#94A3B8]">
                                Funded by <strong className="text-emerald-400 font-mono">{formatCurrencyINR(amt)}</strong> ({pct}% of your tax)
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {ALL_SECTOR_IDS.filter((id) => Number(allocations[id] || 0) >= 15).length === 0 && (
                        <p className="text-[#64748B] text-[11px] italic">
                          Increase priority on any sector above 15% to see concrete civic milestone estimates.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Impact Insights Analysis Component */}
              <div className="mt-8">
                <ImpactInsights
                  allocations={allocations}
                  taxPaid={currentTaxAmount}
                  annualSalary={Number(annualSalary) || 1800000}
                  fullName={fullName || 'Citizen Contributor'}
                  city={city || 'Bengaluru'}
                  state={state || 'Karnataka'}
                  financialYear={financialYear}
                  citizenProposal={citizenProposal}
                />
              </div>

              {/* Citizen Proposal & Policy Feedback Box */}
              <div className="mt-8 pt-6 border-t border-[#1E293B] space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#E2E8F0] uppercase tracking-wider">
                      Citizen Civic Policy Note & Municipal Proposal (Optional)
                    </label>
                    <p className="text-xs text-[#94A3B8]">
                      Share specific public amenities or infrastructural issues in your area that need immediate municipal funding.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={generateAiImpact}
                    disabled={isAiLoading}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl transition disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAiLoading ? 'Analyzing...' : 'Generate AI Civic Insight'}</span>
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={citizenProposal}
                  onChange={(e) => setCitizenProposal(e.target.value)}
                  placeholder="e.g. Focus on modernizing stormwater drainage to prevent seasonal urban waterlogging, and equip government school science labs with computer hardware."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#1E293B] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-[#0A0B0D] text-[#E2E8F0] placeholder:text-[#64748B]"
                />

                {/* AI Impact Callout if generated */}
                {aiInsight && (
                  <div className="bg-[#0A0B0D] border border-emerald-500/30 rounded-xl p-4 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>AI Civic & Public Policy Assessment:</span>
                    </div>
                    <p className="text-[#E2E8F0] leading-relaxed">{aiInsight.summary}</p>
                    <ul className="list-disc list-inside text-[#94A3B8] space-y-1 pl-1">
                      {aiInsight.keyTakeaways?.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                    {aiInsight.civicEmpowermentQuote && (
                      <p className="text-emerald-300 font-medium italic pt-1 border-t border-[#1E293B]">
                        "{aiInsight.civicEmpowermentQuote}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Submit / Action Bar */}
              <div className="mt-8 pt-6 border-t border-[#1E293B] flex items-center justify-between flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="text-[#94A3B8] hover:text-[#E2E8F0] text-xs font-semibold px-4 py-2 cursor-pointer"
                >
                  Back to Tax Details
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition active:scale-95 text-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save & Confirm Annual Tax Allocation</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
