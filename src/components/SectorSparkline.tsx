import React, { useState } from 'react';
import { SectorHistoricalPoint } from '../utils/dataService';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SectorSparklineProps {
  data: SectorHistoricalPoint[];
  color?: string;
  height?: number;
  showLabels?: boolean;
  showTrendBadge?: boolean;
  trendPct?: number;
  className?: string;
}

export const SectorSparkline: React.FC<SectorSparklineProps> = ({
  data,
  color = '#10b981',
  height = 42,
  showLabels = true,
  showTrendBadge = true,
  trendPct,
  className = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return null;
  }

  const values = data.map((d) => d.citizenAvgPct);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  // SVG coordinates calculation
  const paddingX = 14;
  const paddingY = 8;
  const svgWidth = 240;
  const svgHeight = height;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * chartW;
    // Invert Y so highest value is at top
    const y = paddingY + chartH - ((d.citizenAvgPct - minVal) / range) * chartH;
    return { x, y, dataPoint: d };
  });

  // Create smooth bezier or straight line path
  const linePath = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = points[i - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (pt.x - prev.x) / 2;
    const cp2y = pt.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pt.x},${pt.y}`;
  }, '');

  // Closed area path for gradient fill
  const firstPt = points[0];
  const lastPt = points[points.length - 1];
  const areaPath = `${linePath} L ${lastPt.x},${svgHeight} L ${firstPt.x},${svgHeight} Z`;

  // Calculated 3-year shift
  const calculatedTrend =
    trendPct !== undefined
      ? trendPct
      : data.length >= 2
      ? Math.round((data[data.length - 1].citizenAvgPct - data[0].citizenAvgPct) * 10) / 10
      : 0;

  const isUp = calculatedTrend > 0;
  const isDown = calculatedTrend < 0;

  const gradientId = `spark-grad-${color.replace('#', '')}-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-[#94A3B8] font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></span>
          <span>3-Year Historical Shift</span>
        </span>

        {showTrendBadge && (
          <span
            className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
              isUp
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : isDown
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {isUp ? (
              <TrendingUp className="w-3 h-3 text-emerald-400" />
            ) : isDown ? (
              <TrendingDown className="w-3 h-3 text-amber-400" />
            ) : (
              <Minus className="w-3 h-3 text-slate-400" />
            )}
            <span>
              {isUp ? `+${calculatedTrend}%` : `${calculatedTrend}%`} (3-Yr Shift)
            </span>
          </span>
        )}
      </div>

      {/* Sparkline Canvas / SVG */}
      <div className="relative bg-[#0A0B0D] rounded-xl border border-[#1E293B] p-2 overflow-hidden group">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full overflow-visible"
          style={{ height: `${height}px` }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.38" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background benchmark guide line */}
          <line
            x1={paddingX}
            y1={paddingY + chartH / 2}
            x2={svgWidth - paddingX}
            y2={paddingY + chartH / 2}
            stroke="#1E293B"
            strokeDasharray="2 2"
            strokeWidth="1"
          />

          {/* Area Fill */}
          <path d={areaPath} fill={`url(#${gradientId})`} />

          {/* Sparkline Stroke */}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;
            const isLast = idx === points.length - 1;
            return (
              <g key={idx} className="cursor-pointer">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5 : isLast ? 4 : 3}
                  fill={isHovered ? '#ffffff' : color}
                  stroke="#0A0B0D"
                  strokeWidth="2"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover / Tooltip Detail Indicator */}
        {hoveredIndex !== null && (
          <div className="absolute top-1 right-2 bg-[#0F172A] border border-[#334155] rounded-lg px-2 py-0.5 text-[10px] font-mono text-white shadow-lg pointer-events-none flex items-center gap-1.5">
            <span className="text-[#94A3B8]">{data[hoveredIndex].formattedYear}:</span>
            <span className="text-emerald-400 font-bold">{data[hoveredIndex].citizenAvgPct}%</span>
            <span className="text-[#64748B] text-[9px]">(Gov: {data[hoveredIndex].govBenchmarkPct}%)</span>
          </div>
        )}

        {/* Historical Year Labels along bottom */}
        {showLabels && (
          <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8] pt-1.5 border-t border-[#1E293B]/70 mt-1">
            {data.map((point, idx) => (
              <div
                key={point.year}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`text-center cursor-pointer transition ${
                  hoveredIndex === idx ? 'text-white font-bold' : ''
                }`}
              >
                <div className="text-[9px] text-[#64748B]">FY {point.shortYear}</div>
                <div
                  className={`font-semibold ${
                    idx === data.length - 1 ? 'text-emerald-400' : 'text-[#E2E8F0]'
                  }`}
                >
                  {point.citizenAvgPct}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
