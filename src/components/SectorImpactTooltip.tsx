import React, { useState, useRef, useEffect } from 'react';
import {
  Info,
  X,
  TrendingUp,
  HeartPulse,
  Building2,
  GraduationCap,
  Leaf,
  ShieldCheck,
  Tractor,
  Atom,
  Users,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Target,
} from 'lucide-react';
import { SectorDefinition, SectorId } from '../types';

interface SectorImpactTooltipProps {
  sector: SectorDefinition;
  allocatedAmount?: number;
  allocatedPct?: number;
}

export const SectorImpactTooltip: React.FC<SectorImpactTooltipProps> = ({
  sector,
  allocatedAmount,
  allocatedPct,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Close on escape key
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false);
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  const renderIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'Building2':
        return <Building2 className={className} />;
      case 'GraduationCap':
        return <GraduationCap className={className} />;
      case 'HeartPulse':
        return <HeartPulse className={className} />;
      case 'Leaf':
        return <Leaf className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      case 'Tractor':
        return <Tractor className={className} />;
      case 'Atom':
        return <Atom className={className} />;
      case 'Users':
        return <Users className={className} />;
      default:
        return <Building2 className={className} />;
    }
  };

  const impact = sector.socioEconomicImpact;

  return (
    <div className="relative inline-flex items-center">
      {/* Tooltip Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        id={`tooltip-trigger-${sector.id}`}
        aria-label={`Learn about scope and socio-economic impact of ${sector.name}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        onMouseEnter={() => setIsOpen(true)}
        className={`p-1 rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400/50 ${
          isOpen
            ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30'
            : 'text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1E293B]'
        }`}
        title="View Scope & Socio-Economic Impact"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {/* Popover / Tooltip Container */}
      {isOpen && (
        <div
          ref={tooltipRef}
          role="dialog"
          aria-modal="true"
          id={`tooltip-popup-${sector.id}`}
          className="absolute z-50 left-0 sm:left-auto sm:right-0 top-full mt-2 w-[calc(100vw-3rem)] max-w-sm sm:w-96 max-h-[80vh] overflow-y-auto bg-[#0A0B0D] border border-[#334155] rounded-2xl shadow-2xl p-4 sm:p-5 text-left text-[#E2E8F0] animate-in fade-in zoom-in-95 duration-150 scrollbar-thin"
          style={{
            boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.8), 0 0 15px -3px rgba(16, 185, 129, 0.1)',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-[#1E293B] pb-3 mb-3.5">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                style={{ backgroundColor: sector.chartColor }}
              >
                {renderIcon(sector.iconName, 'w-4 h-4')}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-serif leading-tight">
                  {sector.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#1E293B] text-[#94A3B8] border border-[#334155]/60">
                    Gov Benchmark: {sector.benchmarkPct}%
                  </span>
                  {allocatedPct !== undefined && (
                    <span className="text-[10px] font-mono font-bold text-emerald-400">
                      Your Share: {allocatedPct}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="text-[#64748B] hover:text-[#E2E8F0] p-1 rounded-lg hover:bg-[#1E293B] transition cursor-pointer"
              aria-label="Close tooltip"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scope & Focus Section */}
          <div className="space-y-3 text-xs leading-relaxed">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sector Scope & Mandate</span>
              </div>
              <p className="text-[#CBD5E1] text-[11.5px] leading-relaxed">
                {sector.scope || sector.description}
              </p>
            </div>

            {/* Sub-categories Pills */}
            <div className="flex flex-wrap gap-1 pt-1">
              {sector.subCategories.map((sub, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-[#131E32] text-[#93C5FD] border border-[#1E293B]"
                >
                  {sub}
                </span>
              ))}
            </div>

            {/* Socio-Economic Impact Breakdown */}
            {impact && (
              <div className="pt-2.5 border-t border-[#1E293B] space-y-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>Socio-Economic & Macro Impact</span>
                </div>

                {/* Macro Economic Multiplier */}
                <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-2.5 space-y-1">
                  <span className="text-[10.5px] font-bold text-emerald-400 block">
                    📈 Macroeconomic Value
                  </span>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                    {impact.macroBenefit}
                  </p>
                </div>

                {/* Human Welfare Gain */}
                <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-2.5 space-y-1">
                  <span className="text-[10.5px] font-bold text-sky-400 block">
                    🤝 Human Welfare & Quality of Life
                  </span>
                  <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                    {impact.humanWelfareGain}
                  </p>
                </div>

                {/* Key National Policy Schemes */}
                {impact.policyPrograms && impact.policyPrograms.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                      Key Flagship Missions:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {impact.policyPrograms.map((prog, idx) => (
                        <span
                          key={idx}
                          className="text-[9.5px] font-medium px-1.5 py-0.5 rounded-md bg-[#0F172A] text-slate-300 border border-[#1E293B]"
                        >
                          {prog}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tangible Metric Footnote */}
            <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10.5px] text-[#64748B]">
              <span>Tangible Unit Cost:</span>
              <span className="font-mono text-emerald-400 font-bold">
                ₹{sector.tangibleUnit.unitCost.toLocaleString('en-IN')} / {sector.tangibleUnit.label.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
