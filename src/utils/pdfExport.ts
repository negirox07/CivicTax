import jsPDF from 'jspdf';
import { TaxRecord } from '../types';
import { SECTOR_DEFINITIONS, ALL_SECTOR_IDS } from '../data/sectors';
import { formatCurrencyINR, maskPAN, maskAadhaar } from './formatters';

export async function generateTaxCertificatePdf(record: TaxRecord): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
  const margin = 12; // 12 mm margins
  const contentWidth = pageWidth - margin * 2; // 186 mm
  const boxX = margin + 1.5;
  const boxWidth = contentWidth - 3; // 183 mm

  // 1. Outer Decorative Dual Border Frame
  doc.setDrawColor(15, 23, 42); // Slate 900
  doc.setLineWidth(0.8);
  doc.rect(margin, margin, contentWidth, pageHeight - margin * 2);

  doc.setDrawColor(16, 185, 129); // Emerald 500
  doc.setLineWidth(0.3);
  doc.rect(margin + 1, margin + 1, contentWidth - 2, pageHeight - margin * 2 - 2);

  // 2. Header Banner Background
  const headerY = margin + 2;
  const headerHeight = 25;
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(boxX, headerY, boxWidth, headerHeight, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.text('NATIONAL CITIZEN TAX ALLOCATION & CIVIC REPORT', pageWidth / 2, headerY + 8, { align: 'center' });

  // Header Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text('PUBLIC TRANSPARENCY & CITIZEN-DIRECTED PARTICIPATORY BUDGET INITIATIVE', pageWidth / 2, headerY + 14, { align: 'center' });

  // Header Metadata Line
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(52, 211, 153); // Emerald 400
  const headerMeta = `ASSESSMENT YEAR: FY ${record.financialYear}   |   STATUS: VERIFIED & COMMITTED   |   CODE: ${record.verificationHash}`;
  doc.text(headerMeta, pageWidth / 2, headerY + 20, { align: 'center' });

  let y = headerY + headerHeight + 3; // ~42 mm

  // 3. Section 1: Citizen Identification Card
  const sec1Height = 31;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(boxX, y, boxWidth, sec1Height, 1.5, 1.5, 'FD');

  // Section 1 Header
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('1. CITIZEN TAXPAYER IDENTIFICATION & FISCAL PROFILE', boxX + 4, y + 5.5);

  // Left Column Details (X: boxX + 4)
  const col1LabelX = boxX + 4;
  const col1ValX = boxX + 24;
  const col2LabelX = boxX + 70;
  const col2ValX = boxX + 93;

  doc.setFontSize(7.2);

  // Row 1
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Full Name:', col1LabelX, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const cleanFullName = record.fullName?.length > 24 ? record.fullName.slice(0, 22) + '..' : (record.fullName || 'Citizen Contributor');
  doc.text(cleanFullName, col1ValX, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Masked PAN:', col2LabelX, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(maskPAN(record.panNumber), col2ValX, y + 12);

  // Row 2
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Profession:', col1LabelX, y + 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const cleanProf = `${record.profession || 'Professional'} (${record.age || 30}y)`;
  const profDisplay = cleanProf.length > 24 ? cleanProf.slice(0, 22) + '..' : cleanProf;
  doc.text(profDisplay, col1ValX, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Masked UID:', col2LabelX, y + 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(maskAadhaar(record.aadhaarNumber), col2ValX, y + 18);

  // Row 3
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Location:', col1LabelX, y + 24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const locStr = `${record.city || 'City'}, ${record.state || 'State'}`;
  const locDisplay = locStr.length > 24 ? locStr.slice(0, 22) + '..' : locStr;
  doc.text(locDisplay, col1ValX, y + 24);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Filing Date:', col2LabelX, y + 24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const filingDateStr = new Date(record.submissionDate || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.text(filingDateStr, col2ValX, y + 24);

  // Right Side Highlight Card (Gross Salary & Tax Paid)
  const statBoxX = boxX + 133;
  const statBoxWidth = boxWidth - 136; // ~47 mm
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.setDrawColor(167, 243, 208); // Emerald 200
  doc.roundedRect(statBoxX, y + 3, statBoxWidth, 25, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(4, 120, 87); // Emerald 700
  doc.text('GROSS ANNUAL SALARY', statBoxX + 3, y + 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrencyINR(record.annualSalary), statBoxX + 3, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(4, 120, 87);
  doc.text('DIRECT TAX CONTRIBUTED', statBoxX + 3, y + 19);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(5, 150, 105); // Emerald 600
  doc.text(formatCurrencyINR(record.taxPaid), statBoxX + 3, y + 25.5);

  y += sec1Height + 3; // ~76 mm

  // 4. Section 2: Sector Allocation Table
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('2. CITIZEN DIRECTED SECTORAL TAX ALLOCATIONS & PUBLIC OUTPUT', boxX + 4, y + 4.5);

  y += 6.5;

  // Table Column Coordinates
  // boxX is ~13.5 mm, boxWidth is 183 mm, right edge is ~196.5 mm
  const colSectorX = boxX + 4;       // 17.5 mm (left aligned)
  const colPrefCenterX = boxX + 76;   // 89.5 mm (center aligned)
  const colAmountRightX = boxX + 116; // 129.5 mm (right aligned)
  const colBenchCenterX = boxX + 138; // 151.5 mm (center aligned)
  const colImpactRightX = boxX + 180; // 193.5 mm (right aligned)

  // Table Header Row
  const headerRowH = 6.2;
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(boxX, y, boxWidth, headerRowH, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.text('PUBLIC SERVICE SECTOR', colSectorX, y + 4.2);
  doc.text('CITIZEN %', colPrefCenterX, y + 4.2, { align: 'center' });
  doc.text('ALLOCATED (INR)', colAmountRightX, y + 4.2, { align: 'right' });
  doc.text('UNION BENCHMARK', colBenchCenterX, y + 4.2, { align: 'center' });
  doc.text('DIRECT TANGIBLE IMPACT', colImpactRightX, y + 4.2, { align: 'right' });

  y += headerRowH;

  // Table Data Rows
  const totalTax = Number(record.taxPaid || 0);
  const rowHeight = 5.8;

  ALL_SECTOR_IDS.forEach((secId, idx) => {
    const sec = SECTOR_DEFINITIONS[secId];
    const pct = record.allocations[secId] || 0;
    const allocatedAmt = Math.round((totalTax * pct) / 100);
    const unitsPurchased = Math.max(1, Math.round(allocatedAmt / sec.tangibleUnit.unitCost));

    // Zebra striping
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252); // Slate 50
    } else {
      doc.setFillColor(255, 255, 255); // White
    }
    doc.rect(boxX, y, boxWidth, rowHeight, 'F');

    // 1. Sector Name (cleanly bounded)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    // Truncate sector name safely if very long to prevent any column bleeding
    const sectorName = sec.name.length > 30 ? sec.shortName : sec.name;
    doc.text(sectorName, colSectorX, y + 4.1);

    // 2. Citizen Preference % (Centered)
    if (pct > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(4, 120, 87); // Emerald 700
      doc.text(`${pct}%`, colPrefCenterX, y + 4.1, { align: 'center' });
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184); // Slate 400
      doc.text('0%', colPrefCenterX, y + 4.1, { align: 'center' });
    }

    // 3. Rupee Amount Allocated (Right-aligned)
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(formatCurrencyINR(allocatedAmt), colAmountRightX, y + 4.1, { align: 'right' });

    // 4. Union Benchmark % (Centered)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${sec.benchmarkPct}% (Govt)`, colBenchCenterX, y + 4.1, { align: 'center' });

    // 5. Tangible Output (Right-aligned, safely truncated)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.3);
    doc.setTextColor(29, 78, 216); // Blue 700
    // Clean label truncation so it never bleeds into previous column
    const unitLabel = sec.tangibleUnit.label.length > 22 ? sec.tangibleUnit.label.slice(0, 20) + '..' : sec.tangibleUnit.label;
    const impactText = `${unitsPurchased.toLocaleString()} ${unitLabel}`;
    doc.text(impactText, colImpactRightX, y + 4.1, { align: 'right' });

    y += rowHeight;
  });

  // Table Total Summary Row
  const summaryRowH = 5.6;
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.rect(boxX, y, boxWidth, summaryRowH, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(boxX, y, boxX + boxWidth, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL PARTICIPATORY TAX ALLOCATED:', colSectorX, y + 3.8);
  doc.setTextColor(4, 120, 87);
  doc.text('100%', colPrefCenterX, y + 3.8, { align: 'center' });
  doc.text(formatCurrencyINR(totalTax), colAmountRightX, y + 3.8, { align: 'right' });
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('100% Statutory Reconciled', colImpactRightX, y + 3.8, { align: 'right' });

  y += summaryRowH + 3.5; // ~140 mm

  // 5. Section 3: AI / Policy Impact Statement & Citizen Proposal (Dynamic Safe Spacing)
  const defaultImpact = `Your direct contribution of ${formatCurrencyINR(record.taxPaid)} creates quantifiable civic progress in regional infrastructure, quality public healthcare clinics, modern road transit, and educational technology.`;
  const impactSummaryText = record.aiImpactSummary?.summary || defaultImpact;

  doc.setFontSize(7.2);
  doc.setFont('helvetica', 'normal');
  // Maximum text width is boxWidth - 10 mm (~173 mm)
  const splitImpactLines: string[] = doc.splitTextToSize(impactSummaryText, boxWidth - 10);

  let splitProposalLines: string[] = [];
  if (record.citizenProposal) {
    const proposalClean = `"${record.citizenProposal}"`;
    // Leave room for the 'Citizen Proposal:' prefix (38 mm)
    splitProposalLines = doc.splitTextToSize(proposalClean, boxWidth - 48);
  }

  // Calculate required height with proper padding
  const impactTextH = splitImpactLines.length * 3.4;
  const proposalTextH = record.citizenProposal ? (Math.max(1, splitProposalLines.length) * 3.4 + 4) : 0;
  const sec3Height = Math.max(22, 9 + impactTextH + proposalTextH + 3);

  // Background Box
  doc.setFillColor(240, 253, 244); // Emerald 50
  doc.setDrawColor(187, 247, 208); // Emerald 200
  doc.setLineWidth(0.3);
  doc.roundedRect(boxX, y, boxWidth, sec3Height, 1.5, 1.5, 'FD');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(6, 95, 70); // Emerald 800
  doc.text('3. CITIZEN CIVIC IMPACT STATEMENT & MUNICIPAL PROPOSAL', boxX + 4, y + 5);

  // Impact Summary Text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(30, 41, 59); // Slate 800
  let currentSec3Y = y + 9.5;
  doc.text(splitImpactLines, boxX + 4, currentSec3Y);

  currentSec3Y += impactTextH;

  // Proposal if present
  if (record.citizenProposal) {
    currentSec3Y += 3;
    doc.setDrawColor(187, 247, 208);
    doc.setLineWidth(0.2);
    doc.line(boxX + 4, currentSec3Y - 1.5, boxX + boxWidth - 4, currentSec3Y - 1.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(15, 23, 42);
    doc.text('Citizen Policy Proposal:', boxX + 4, currentSec3Y + 2);

    doc.setFont('helvetica', 'italic');
    doc.setTextColor(71, 85, 105);
    doc.text(splitProposalLines, boxX + 42, currentSec3Y + 2);
  }

  y += sec3Height + 3.5;

  // 6. Section 4: Tangible Key Public Assets Breakdown (If Takeaways exist)
  if (record.aiImpactSummary?.keyTakeaways && record.aiImpactSummary.keyTakeaways.length > 0) {
    const takeaways = record.aiImpactSummary.keyTakeaways.slice(0, 3);
    const sec4Height = 8 + (takeaways.length * 4);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(boxX, y, boxWidth, sec4Height, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('4. KEY CIVIC DELIVERABLES POWERED BY THIS TAX CONTRIBUTION', boxX + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);

    takeaways.forEach((item, tIdx) => {
      const cleanItem = item.length > 105 ? item.slice(0, 102) + '...' : item;
      doc.text(`•  ${cleanItem}`, boxX + 6, y + 9.5 + (tIdx * 4));
    });

    y += sec4Height + 3.5;
  }

  // 7. Section 5: Official Verification Seal & Anti-Tamper Block
  const sec5Height = 22;
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.3);
  doc.roundedRect(boxX, y, boxWidth, sec5Height, 1.5, 1.5, 'FD');

  // Official Stamp Box Simulation (Left side)
  const stampX = boxX + 4;
  const stampY = y + 3;
  const stampW = 36;
  const stampH = 16;
  doc.setDrawColor(5, 150, 105); // Emerald 600
  doc.setLineWidth(0.6);
  doc.rect(stampX, stampY, stampW, stampH);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(5, 150, 105);
  doc.text('REPUBLIC CIVIC PORTAL', stampX + stampW / 2, stampY + 4.8, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('VERIFIED RETURN', stampX + stampW / 2, stampY + 9.2, { align: 'center' });
  doc.setFontSize(5.5);
  doc.setTextColor(100, 116, 139);
  doc.text('CITIZEN DEMOCRATIC VOICE', stampX + stampW / 2, stampY + 13.5, { align: 'center' });

  // Verification Details Text (Right of Stamp)
  const verifTextX = stampX + stampW + 6;
  const verifMaxW = boxWidth - stampW - 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(15, 23, 42);
  doc.text('Official Participatory Budgeting & Citizen Civic Contribution Certificate', verifTextX, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  const certDesc = 'This digitally verifiable document records the citizen’s fiscal tax contribution and signals participatory budget preferences to municipal and central planning authorities.';
  const splitCertDesc = doc.splitTextToSize(certDesc, verifMaxW);
  doc.text(splitCertDesc, verifTextX, y + 11.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(5, 150, 105);
  doc.text(`Digital Hash: ${record.verificationHash}   •   Tamper-Evident Open Civic Ledger`, verifTextX, y + 18.5);

  // 8. Footer (Bottom of Page)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  const footerDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.text(`CivicTax Open Governance Initiative • Public Transparency Report • Generated on ${footerDate}`, pageWidth / 2, pageHeight - margin - 2, { align: 'center' });

  // Save the PDF with a clean sanitized filename
  const cleanName = (record.fullName || 'Citizen').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `CivicTax_Report_FY${record.financialYear}_${cleanName}.pdf`;
  doc.save(filename);
}
