import React from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  FileCheck2,
  Database,
  UserCheck,
  Mail,
  AlertTriangle,
  Landmark,
  Scale,
  Sparkles,
  Layers,
} from 'lucide-react';

interface PrivacyPolicyViewProps {
  onGoToGlobalDashboard: () => void;
  onStartFiling: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({
  onGoToGlobalDashboard,
  onStartFiling,
}) => {
  const contactEmail = 'mukeshsingh.negi07@gmail.com';
  const effectiveDate = 'August 14, 2026';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="privacy-policy-root">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#131E32] to-[#0A0B0D] border border-[#1E293B] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-1.5 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Official Civic Privacy & Data Protection Policy</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white tracking-tight">
          CivicTax Privacy Policy & Data Governance
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-[#94A3B8]">
          <span>Effective Date: <strong className="text-white">{effectiveDate}</strong></span>
          <span>•</span>
          <span>Version: <strong className="text-emerald-400 font-mono">2.4.0 (SHA-256 Masked)</strong></span>
          <span>•</span>
          <span>Data Controller: <strong className="text-white">CivicTax Governance Initiative</strong></span>
        </div>

        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed pt-1">
          CivicTax is dedicated to transparent, privacy-first civic engagement. This Privacy Policy details how taxpayer data is handled, encrypted, masked, and utilized in our participatory budgeting consensus ledger.
        </p>
      </div>

      {/* Core Privacy Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0F172A] border border-emerald-500/30 rounded-2xl p-5 space-y-2 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white">Masked Identification</h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            PAN numbers and contact details are masked (e.g., <code className="text-emerald-300 font-mono">CKPAR****Q</code>). Unmasked personal data is never published.
          </p>
        </div>

        <div className="bg-[#0F172A] border border-sky-500/30 rounded-2xl p-5 space-y-2 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white">Anonymized Open Data</h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            The public consensus ledger only ingests anonymized sector percentages and geographic aggregates to compute national priorities.
          </p>
        </div>

        <div className="bg-[#0F172A] border border-purple-500/30 rounded-2xl p-5 space-y-2 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white">Cryptographic Integrity</h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Every submission generates a verifiable SHA-256 cryptographic seal ensuring tax certificates remain authentic and immutable.
          </p>
        </div>
      </div>

      {/* Detailed Legal & Architectural Sections */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-[#CBD5E1]">
        {/* Section 1 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-white font-serif font-bold text-lg">
            <span className="text-emerald-400 font-mono text-sm">01.</span>
            <h3>Information We Collect</h3>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            When you interact with CivicTax, we collect information necessary to compute statutory tax estimates and record your participatory budget preferences:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-[#CBD5E1] pl-2">
            <li><strong>Taxpayer Profile Data:</strong> Full Name, Email Address, Phone Number, State, City, and Pincode.</li>
            <li><strong>Fiscal & Tax Data:</strong> Permanent Account Number (PAN), Aadhaar Number, Annual Gross Income, Deductions, Chosen Tax Regime (Old vs. New), and Tax Liability.</li>
            <li><strong>Participatory Budget Allocations:</strong> Customized percentage distributions across our 8 national development sectors (Healthcare, Education, Clean Energy, Infrastructure, Agriculture, Science & Tech, Social Welfare, Defense).</li>
            <li><strong>Civic Proposals:</strong> Citizen-authored municipal recommendations and community suggestions submitted alongside filing records.</li>
          </ul>
        </section>

        <div className="h-px bg-[#1E293B]"></div>

        {/* Section 2 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-white font-serif font-bold text-lg">
            <span className="text-emerald-400 font-mono text-sm">02.</span>
            <h3>How Your Data Is Used</h3>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            We utilize collected information exclusively for civic empowerment, mathematical tax modeling, and public consensus research:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-[#CBD5E1] pl-2">
            <li>To simulate participatory allocation of your personal income tax contributions.</li>
            <li>To aggregate anonymous public priority statistics displayed on the national consensus dashboard.</li>
            <li>To generate downloadable, cryptographically verified PDF Certificates of Civic Contribution.</li>
            <li>To generate AI-powered economic impact assessments via the Google Gemini API.</li>
          </ul>
        </section>

        <div className="h-px bg-[#1E293B]"></div>

        {/* Section 3 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-white font-serif font-bold text-lg">
            <span className="text-emerald-400 font-mono text-sm">03.</span>
            <h3>Public Consensus Ledger vs. Private Filings</h3>
          </div>
          <div className="bg-[#0A0B0D] border border-[#1E293B] rounded-2xl p-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 p-3 rounded-xl bg-[#0F172A] border border-emerald-500/20">
                <span className="font-bold text-emerald-400 block uppercase tracking-wider">Publicly Visible (Open Data)</span>
                <p className="text-[#94A3B8]">
                  • Aggregated sector percentages and totals.<br />
                  • Anonymous city and state allocation trends.<br />
                  • Public civic proposals and community upvotes.<br />
                  • SHA-256 verification status codes.
                </p>
              </div>
              <div className="space-y-1.5 p-3 rounded-xl bg-[#0F172A] border border-rose-500/20">
                <span className="font-bold text-rose-400 block uppercase tracking-wider">Private & Protected (Restricted)</span>
                <p className="text-[#94A3B8]">
                  • Full Unmasked PAN & Aadhaar numbers.<br />
                  • Personal phone number & email address.<br />
                  • Individual itemized deduction breakdowns.<br />
                  • Private session security tokens.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-[#1E293B]"></div>

        {/* Section 4 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-white font-serif font-bold text-lg">
            <span className="text-emerald-400 font-mono text-sm">04.</span>
            <h3>Data Storage & Administrative Access Control</h3>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            CivicTax implements strict role-based access control (RBAC):
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-[#CBD5E1] pl-2">
            <li><strong>Client-Side Storage:</strong> Citizen session data is stored securely in encrypted local browser memory for instant offline access.</li>
            <li><strong>Cloud Persistence:</strong> When Supabase cloud database connectivity is enabled, records are persisted in PostgreSQL tables with Row-Level Security (RLS) policies.</li>
            <li><strong>Admin Privileges & Database Synchronization:</strong> Administrative controls (including the <code className="text-emerald-400 font-mono">DB:Syncup</code> tools, database schema migrations, and cloud provisioning badges) are strictly restricted to authenticated administrators (<code className="text-emerald-300 font-mono">mukeshsingh.negi07@gmail.com</code>) and are not exposed publicly.</li>
          </ul>
        </section>

        <div className="h-px bg-[#1E293B]"></div>

        {/* Section 5 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-white font-serif font-bold text-lg">
            <span className="text-emerald-400 font-mono text-sm">05.</span>
            <h3>Third-Party Processors</h3>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            CivicTax interfaces with select third-party infrastructure providers to deliver platform features:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-[#CBD5E1] pl-2">
            <li><strong>Google Gemini AI SDK:</strong> Used on the backend server to simulate narrative macroeconomic impacts. Prompts contain sector percentages and numerical tax brackets, never raw taxpayer identities.</li>
            <li><strong>Supabase / PostgreSQL:</strong> Provides durable cloud database storage for public consensus aggregations.</li>
          </ul>
        </section>

        <div className="h-px bg-[#1E293B]"></div>

        {/* Section 6 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-white font-serif font-bold text-lg">
            <span className="text-emerald-400 font-mono text-sm">06.</span>
            <h3>Your Rights & Data Control</h3>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            You retain absolute ownership of your civic data. At any time, you may:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-[#CBD5E1] pl-2">
            <li><strong>Export Your Data:</strong> Download complete PDF records and cryptographic certificates.</li>
            <li><strong>Delete or Reset:</strong> Clear your personal filing ledger or reset to default mock state using the profile menu.</li>
            <li><strong>Update Records:</strong> Edit previously filed returns and adjust sector allocation percentages.</li>
          </ul>
        </section>

        <div className="h-px bg-[#1E293B]"></div>

        {/* Section 7: Contact DPO */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-white font-serif font-bold text-lg">
            <span className="text-emerald-400 font-mono text-sm">07.</span>
            <h3>Contact Data Protection Officer</h3>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            For questions, data access requests, or privacy concerns, please contact our Data Governance lead:
          </p>
          <div className="bg-[#0A0B0D] border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="font-bold text-white text-xs">Mukesh Singh Negi — CivicTax Lead</div>
              <div className="text-xs font-mono text-emerald-400">{contactEmail}</div>
            </div>
            <a
              href={`mailto:${contactEmail}?subject=CivicTax%20Privacy%20Inquiry`}
              className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Privacy Officer</span>
            </a>
          </div>
        </section>
      </div>

      {/* Footer Navigation CTAs */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-4">
        <button
          type="button"
          onClick={onGoToGlobalDashboard}
          className="text-xs text-[#94A3B8] hover:text-white flex items-center gap-1.5 cursor-pointer"
        >
          <span>← Back to Public Consensus Dashboard</span>
        </button>

        <button
          type="button"
          onClick={onStartFiling}
          className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>File & Direct Your Tax Return</span>
        </button>
      </div>
    </div>
  );
};
