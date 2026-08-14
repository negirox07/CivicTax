import { SectorAllocations, SectorId } from '../types';
import { SECTOR_DEFINITIONS } from '../data/sectors';
import { formatCurrencyINR, formatCompactINR } from './formatters';

export interface RealisticImpactDetail {
  sectorId: SectorId;
  sectorName: string;
  allocatedAmount: number;
  percentage: number;
  tangibleMetrics: {
    primaryUnit: string;
    primaryCount: number;
    secondaryUnits: { label: string; count: number; description: string }[];
  };
  realisticNarrative: string;
  infrastructureSpotlight?: {
    pavedRoadMeters: number;
    drainageMeters: number;
    streetlightsFunded: number;
    metroTransitRuns: number;
    summary: string;
  };
  healthcareSpotlight?: {
    diagnosticTreatments: number;
    phcMedicineKits: number;
    ambulanceHours: number;
    maternalCarePackages: number;
    dialysisSessions: number;
    summary: string;
  };
}

export interface ImpactSummaryReport {
  totalTax: number;
  overallNarrative: string;
  infrastructureSummary: {
    allocatedAmount: number;
    percentage: number;
    headline: string;
    narrative: string;
    deliverables: { label: string; count: number; unit: string; description: string }[];
  };
  healthcareSummary: {
    allocatedAmount: number;
    percentage: number;
    headline: string;
    narrative: string;
    deliverables: { label: string; count: number; unit: string; description: string }[];
  };
  sectorBreakdowns: RealisticImpactDetail[];
  communityMultipliers: {
    scale: number;
    scaleLabel: string;
    pooledTax: number;
    infraAchievement: string;
    healthAchievement: string;
    educationAchievement: string;
    energyAchievement: string;
  }[];
}

/**
 * Calculates realistic public infrastructure and healthcare impact summaries based on budget allocations
 */
export function calculateImpactInsights(
  allocations: SectorAllocations,
  taxPaid: number,
  taxpayerName: string = 'Citizen Contributor',
  city: string = 'your municipality',
  state: string = 'the state'
): ImpactSummaryReport {
  const totalTax = Math.max(0, Number(taxPaid) || 0);

  // Sector allocations in INR
  const getAmt = (id: SectorId) => Math.round((totalTax * (allocations[id] || 0)) / 100);
  const getPct = (id: SectorId) => allocations[id] || 0;

  const infraAmt = getAmt('infrastructure');
  const infraPct = getPct('infrastructure');

  const healthAmt = getAmt('healthcare');
  const healthPct = getPct('healthcare');

  const eduAmt = getAmt('education');
  const cleanEnergyAmt = getAmt('clean_energy');

  // --- INFRASTRUCTURE SPECIFIC REALISTIC CALCULATIONS ---
  // CPWD Benchmark: Paved 4-lane road maintenance ~₹12,000/m; Storm drainage ~₹4,500/m; Solar streetlight ~₹6,000; Metro rapid transit run ~₹2,200
  const pavedRoadMeters = Math.max(0, Math.floor(infraAmt / 12000));
  const drainageMeters = Math.max(0, Math.floor(infraAmt / 4500));
  const streetlightsFunded = Math.max(0, Math.floor(infraAmt / 6000));
  const metroTransitRuns = Math.max(0, Math.floor(infraAmt / 2200));

  let infraHeadline = '';
  let infraNarrative = '';

  if (infraPct === 0 || infraAmt === 0) {
    infraHeadline = 'No direct funding allocated to Infrastructure';
    infraNarrative = `Currently, 0% of your tax is earmarked for public works. Allocating even 15–25% would directly channel ${formatCurrencyINR(totalTax * 0.2)} toward arterial road maintenance, urban drainage, and transit improvements in ${city}.`;
  } else if (infraAmt < 25000) {
    infraHeadline = `Targeted Municipal Pothole & Public Light Upgrades`;
    infraNarrative = `Your contribution of ${formatCurrencyINR(infraAmt)} (${infraPct}% of tax) directly finances ${streetlightsFunded} solar LED public streetlights and approximately ${drainageMeters} meters of urban stormwater drainage repairs, reducing localized monsoon water-logging and improving pedestrian safety.`;
  } else if (infraAmt < 100000) {
    infraHeadline = `High-Grade Arterial Road Surfacing & Transit Support`;
    infraNarrative = `Your allocation of ${formatCurrencyINR(infraAmt)} (${infraPct}%) funds roughly ${pavedRoadMeters} meters of high-durability paved roadway with reflective safety markers, ${streetlightsFunded} energy-efficient street lamps, and ${metroTransitRuns} electrified municipal rapid transit operations across ${city}.`;
  } else {
    infraHeadline = `Major Regional Mobility & Urban Infrastructure Corridor`;
    infraNarrative = `With a significant ${formatCurrencyINR(infraAmt)} (${infraPct}%) designated for public infrastructure, your investment enables over ${pavedRoadMeters} meters of heavy-duty reinforced expressway paving, ${drainageMeters} meters of high-capacity subterranean concrete drainage, and ${streetlightsFunded} solar-powered smart streetlights along high-density public transport corridors.`;
  }

  const infraDeliverables = [
    {
      label: 'Paved High-Grade Roadway',
      count: pavedRoadMeters,
      unit: 'Meters',
      description: 'Paves durable multi-lane bitumen/concrete surface designed for heavy vehicular traffic.',
    },
    {
      label: 'Subterranean Storm Drainage',
      count: drainageMeters,
      unit: 'Meters',
      description: 'Prevents monsoon urban flooding and foundation erosion on municipal transit routes.',
    },
    {
      label: 'Solar LED Public Streetlights',
      count: streetlightsFunded,
      unit: 'Units',
      description: 'Zero-emission solar street illumination improving night-time commuter safety.',
    },
    {
      label: 'Rapid Transit & Metro Operations',
      count: metroTransitRuns,
      unit: 'Kilometers Powered',
      description: 'Subsidizes clean electric traction energy for urban metro and zero-emission bus fleets.',
    },
  ];

  // --- HEALTHCARE SPECIFIC REALISTIC CALCULATIONS ---
  // National Health Mission (NHM) Benchmarks:
  // Subsidized Diagnostic Treatment ~₹2,800; PHC Medicine Kit ~₹1,500; Ambulance Shift ~₹3,200; Maternal Package ~₹4,200; Dialysis Session ~₹1,800
  const diagnosticTreatments = Math.max(0, Math.floor(healthAmt / 2800));
  const phcMedicineKits = Math.max(0, Math.floor(healthAmt / 1500));
  const ambulanceHours = Math.max(0, Math.floor(healthAmt / 3200));
  const maternalCarePackages = Math.max(0, Math.floor(healthAmt / 4200));
  const dialysisSessions = Math.max(0, Math.floor(healthAmt / 1800));

  let healthHeadline = '';
  let healthNarrative = '';

  if (healthPct === 0 || healthAmt === 0) {
    healthHeadline = 'No direct funding allocated to Healthcare';
    healthNarrative = `With 0% assigned to healthcare, vital local Primary Health Centres (PHCs) receive no dedicated portion of your contribution. Allocating 20% (${formatCurrencyINR(totalTax * 0.2)}) could subsidize diagnostic tests and emergency trauma services for vulnerable citizens.`;
  } else if (healthAmt < 25000) {
    healthHeadline = `Primary Health Clinic Supplies & Preventative Screenings`;
    healthNarrative = `Your healthcare allocation of ${formatCurrencyINR(healthAmt)} (${healthPct}% of tax) sponsors ${phcMedicineKits} essential medicine kits for low-income families and ${diagnosticTreatments} comprehensive diagnostic blood and radiology lab panels at district government dispensaries.`;
  } else if (healthAmt < 100000) {
    healthHeadline = `Subsidized Chronic Care, Dialysis & Emergency Care`;
    healthNarrative = `By directing ${formatCurrencyINR(healthAmt)} (${healthPct}%) to public health, you fund ${dialysisSessions} life-saving subsidized renal dialysis procedures, ${diagnosticTreatments} full diagnostic screenings, and ${ambulanceHours} hours of 24/7 advanced emergency trauma ambulance readiness across ${state}.`;
  } else {
    healthHeadline = `Comprehensive Public Hospital & Specialized Clinical Care`;
    healthNarrative = `Your high-impact allocation of ${formatCurrencyINR(healthAmt)} (${healthPct}%) delivers transformative medical relief: providing ${diagnosticTreatments} specialized clinical lab panels, ${dialysisSessions} free dialysis rounds, ${maternalCarePackages} maternal-infant health packages, and funding over ${ambulanceHours} emergency ambulance dispatch shifts.`;
  }

  const healthDeliverables = [
    {
      label: 'Free Subsidized Diagnostic Tests',
      count: diagnosticTreatments,
      unit: 'Patient Panels',
      description: 'Comprehensive blood profiling, pathology tests, and vital screenings for underprivileged patients.',
    },
    {
      label: 'Subsidized Renal Dialysis Sessions',
      count: dialysisSessions,
      unit: 'Sessions',
      description: 'Fully subsidized hemodialysis treatments relieving catastrophic out-of-pocket health costs.',
    },
    {
      label: 'PHC Essential Medicine Packages',
      count: phcMedicineKits,
      unit: 'Family Kits',
      description: 'Distributes verified antibiotics, anti-hypertensives, insulin, and preventative health supplies.',
    },
    {
      label: 'Maternal & Newborn Care Packages',
      count: maternalCarePackages,
      unit: 'Mother-Child Kits',
      description: 'Supplies neonatal nutrition, vital immunization vaccines, and postpartum healthcare monitoring.',
    },
    {
      label: 'Emergency Trauma Ambulance Readiness',
      count: ambulanceHours,
      unit: 'Dispatch Shifts',
      description: 'Maintains trained paramedic response teams, on-board oxygen, and emergency defibrillators.',
    },
  ];

  // --- SECTOR BY SECTOR REALISTIC DETAIL ---
  const sectorBreakdowns: RealisticImpactDetail[] = (
    Object.keys(SECTOR_DEFINITIONS) as SectorId[]
  ).map((secId) => {
    const sec = SECTOR_DEFINITIONS[secId];
    const pct = allocations[secId] || 0;
    const amt = Math.round((totalTax * pct) / 100);
    const primaryCount = Math.max(0, Math.floor(amt / sec.tangibleUnit.unitCost));

    let realisticNarrative = '';

    switch (secId) {
      case 'infrastructure':
        realisticNarrative = infraNarrative;
        break;
      case 'healthcare':
        realisticNarrative = healthNarrative;
        break;
      case 'education':
        realisticNarrative =
          pct > 0
            ? `Your ₹${amt.toLocaleString('en-IN')} allocation supplies ${primaryCount} underprivileged students with full annual curriculum kits, digital learning tablets, and STEM laboratory access.`
            : 'No funds allocated for public education and digital classroom labs.';
        break;
      case 'clean_energy':
        realisticNarrative =
          pct > 0
            ? `Channels ₹${amt.toLocaleString('en-IN')} into renewable solar infrastructure, installing ~${primaryCount} kWh of rooftop microgrid capacity and mitigating approx ${(primaryCount * 0.8).toFixed(1)} metric tons of CO2 annually.`
            : 'Zero clean energy contribution allocated.';
        break;
      case 'defense_security':
        realisticNarrative =
          pct > 0
            ? `Provides ₹${amt.toLocaleString('en-IN')} towards national cyber-defense infrastructure and soldier protective equipment (${primaryCount} tactical equipment kits).`
            : 'No allocation provided for defense and security modernization.';
        break;
      case 'agriculture_rural':
        realisticNarrative =
          pct > 0
            ? `Directs ₹${amt.toLocaleString('en-IN')} into rural agrarian support, providing ${primaryCount} days of zero-cost solar micro-irrigation for drought-prone farming communities.`
            : 'No rural agrarian subsidy allocated.';
        break;
      case 'science_tech':
        realisticNarrative =
          pct > 0
            ? `Fuels ₹${amt.toLocaleString('en-IN')} into public digital infrastructure and AI/space research, sponsoring ${primaryCount} computing and laboratory hours for university researchers.`
            : 'No direct allocation towards scientific research and digital goods.';
        break;
      case 'social_welfare':
        realisticNarrative =
          pct > 0
            ? `Allocates ₹${amt.toLocaleString('en-IN')} to provide ${primaryCount} nutritional support and elder-care packages for vulnerable citizens.`
            : 'No social safety-net contribution allocated.';
        break;
    }

    return {
      sectorId: secId,
      sectorName: sec.name,
      allocatedAmount: amt,
      percentage: pct,
      tangibleMetrics: {
        primaryUnit: sec.tangibleUnit.label,
        primaryCount,
        secondaryUnits: [],
      },
      realisticNarrative,
      infrastructureSpotlight:
        secId === 'infrastructure'
          ? {
              pavedRoadMeters,
              drainageMeters,
              streetlightsFunded,
              metroTransitRuns,
              summary: infraNarrative,
            }
          : undefined,
      healthcareSpotlight:
        secId === 'healthcare'
          ? {
              diagnosticTreatments,
              phcMedicineKits,
              ambulanceHours,
              maternalCarePackages,
              dialysisSessions,
              summary: healthNarrative,
            }
          : undefined,
    };
  });

  // --- OVERALL CIVIC SYNTHESIS NARRATIVE ---
  const activeSectorsCount = Object.values(allocations).filter((p) => p > 0).length;
  const topSector = [...sectorBreakdowns].sort((a, b) => b.allocatedAmount - a.allocatedAmount)[0];

  const overallNarrative =
    totalTax > 0
      ? `As a verified taxpayer contributing ${formatCurrencyINR(totalTax)}, your participatory budget directs resources across ${activeSectorsCount} public sectors, with peak emphasis on ${topSector?.sectorName || 'public services'} (${topSector?.percentage}%). In physical terms, this translates directly into verifiable meters of paved transit, subsidized hospital treatments, and sustainable community utilities in ${city}, ${state}.`
      : `Enter your annual tax contribution to generate concrete, real-world public infrastructure and healthcare impact insights.`;

  // --- COMMUNITY MULTIPLIERS (SCALING EFFECT) ---
  const communityMultipliers = [
    {
      scale: 1,
      scaleLabel: `Individual (${taxpayerName})`,
      pooledTax: totalTax,
      infraAchievement: `${pavedRoadMeters}m paved road & ${streetlightsFunded} solar street lamps`,
      healthAchievement: `${diagnosticTreatments} subsidized diagnostics & ${dialysisSessions} dialysis rounds`,
      educationAchievement: `${Math.floor(eduAmt / 6500)} full-year student scholarships`,
      energyAchievement: `${Math.floor(cleanEnergyAmt / 4500)} kWh clean solar capacity`,
    },
    {
      scale: 100,
      scaleLabel: '100 Neighborhood Taxpayers',
      pooledTax: totalTax * 100,
      infraAchievement: `${(pavedRoadMeters * 100).toLocaleString()}m arterial avenue resurfacing & ${(streetlightsFunded * 100).toLocaleString()} smart LED lights`,
      healthAchievement: `Fully equipped Primary Health Clinic (PHC) + ${(diagnosticTreatments * 100).toLocaleString()} free patient checkups`,
      educationAchievement: `${(Math.floor(eduAmt / 6500) * 100).toLocaleString()} student STEM labs and digital classrooms`,
      energyAchievement: `${(Math.floor(cleanEnergyAmt / 4500) * 100).toLocaleString()} kWh clean solar grid powering 400 households`,
    },
    {
      scale: 1000,
      scaleLabel: '1,000 Ward Residents',
      pooledTax: totalTax * 1000,
      infraAchievement: `${((pavedRoadMeters * 1000) / 1000).toFixed(1)} km complete urban expressway corridor with smart flood drainage`,
      healthAchievement: `24/7 Multi-Speciality Community Trauma Center + ${(ambulanceHours * 1000).toLocaleString()} ambulance response hours`,
      educationAchievement: `District Model Public School campus with modern robotic & AI laboratories`,
      energyAchievement: `1.5 Megawatt community solar park eliminating 1,800 tons of carbon emissions`,
    },
    {
      scale: 10000,
      scaleLabel: '10,000 City Filers',
      pooledTax: totalTax * 10000,
      infraAchievement: `${((pavedRoadMeters * 10000) / 1000).toFixed(0)} km multi-lane regional highway network & integrated metro link`,
      healthAchievement: `350-bed Super-Speciality Public Hospital with cardiac catheterization & advanced MRI suites`,
      educationAchievement: `Endowment for 10 Regional Polytechnic Skill Institutes educating thousands annually`,
      energyAchievement: `Zero-carbon municipal water treatment plant and 15 MW renewable energy facility`,
    },
  ];

  return {
    totalTax,
    overallNarrative,
    infrastructureSummary: {
      allocatedAmount: infraAmt,
      percentage: infraPct,
      headline: infraHeadline,
      narrative: infraNarrative,
      deliverables: infraDeliverables,
    },
    healthcareSummary: {
      allocatedAmount: healthAmt,
      percentage: healthPct,
      headline: healthHeadline,
      narrative: healthNarrative,
      deliverables: healthDeliverables,
    },
    sectorBreakdowns,
    communityMultipliers,
  };
}
