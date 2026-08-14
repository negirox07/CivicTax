import React, { useState } from 'react';
import {
  Mail,
  Github,
  Code2,
  Package,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Sparkles,
  ShieldCheck,
  Landmark,
  Layers,
  HeartHandshake,
  Cpu,
  ArrowRight,
  Terminal,
  Activity,
  Boxes,
  Zap,
} from 'lucide-react';

interface AboutUsViewProps {
  onStartFiling: () => void;
  onGoToGlobalDashboard: () => void;
}

export const AboutUsView: React.FC<AboutUsViewProps> = ({
  onStartFiling,
  onGoToGlobalDashboard,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPackage, setCopiedPackage] = useState(false);

  const emailAddress = 'mukeshsingh.negi07@gmail.com';
  const nugetPackageName = 'XLExtension';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleCopyPackage = () => {
    navigator.clipboard.writeText(`dotnet add package ${nugetPackageName}`);
    setCopiedPackage(true);
    setTimeout(() => setCopiedPackage(false), 2500);
  };

  const moreProjects = [
    {
      title: 'AlgoViz',
      url: 'https://algo-viz-nu.vercel.app',
      displayUrl: 'algo-viz-nu.vercel.app',
      badge: 'Algorithms & Data Structures',
      description: 'Interactive computational algorithm visualizer demonstrating graph traversals, sorting mechanics, and time complexities.',
      icon: <Activity className="w-5 h-5 text-indigo-400" />,
      color: 'from-indigo-500/20 to-purple-500/10',
      border: 'border-indigo-500/30',
    },
    {
      title: 'Neon IME',
      url: 'https://neon-ime.vercel.app',
      displayUrl: 'neon-ime.vercel.app',
      badge: 'Input Method & Text Engine',
      description: 'Modern, high-performance web-based input method editor and interactive phonetic linguistic keyboard workspace.',
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-500/20 to-teal-500/10',
      border: 'border-emerald-500/30',
    },
    {
      title: 'Atmosphere IQ',
      url: 'https://atmosphere-iq.vercel.app',
      displayUrl: 'atmosphere-iq.vercel.app',
      badge: 'Environmental Intelligence',
      description: 'Real-time atmospheric telemetry, AQI analytics, weather forecasting models, and environmental health diagnostics.',
      icon: <Globe className="w-5 h-5 text-sky-400" />,
      color: 'from-sky-500/20 to-blue-500/10',
      border: 'border-sky-500/30',
    },
    {
      title: 'MyToolHub',
      url: 'https://mytoolhub.vercel.app',
      displayUrl: 'mytoolhub.vercel.app',
      badge: 'Developer Productivity Suite',
      description: 'Unified Swiss-army web tools collection for developers, formatters, encodings, converters, and quick daily utilities.',
      icon: <Boxes className="w-5 h-5 text-amber-400" />,
      color: 'from-amber-500/20 to-orange-500/10',
      border: 'border-amber-500/30',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10" id="about-us-root">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-[#0F172A] via-[#131E32] to-[#0A0B0D] border border-[#1E293B] rounded-3xl p-6 sm:p-12 shadow-2xl overflow-hidden">
        {/* Glow accents */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-1.5 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Landmark className="w-4 h-4" />
            <span>CivicTech & Democratic Governance Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-tight leading-tight">
            Empowering Citizens Through Participatory Fiscal Democracy
          </h1>

          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
            CivicTax was created to transform taxation from a passive annual obligation into an active, transparent civic voice. By combining modern web technology, cryptographic hash verification, and open consensus metrics, CivicTax enables every citizen to direct national budget priorities and witness collective economic impact.
          </p>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button
              type="button"
              onClick={onStartFiling}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Participate in Tax Allocation</span>
            </button>

            <button
              type="button"
              onClick={onGoToGlobalDashboard}
              className="bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Explore Public Consensus Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONNECT & EXPLORE SECTION (PRIMARY USER REQUIREMENT) */}
      <div className="space-y-6" id="connect-and-explore-section">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <HeartHandshake className="w-4 h-4" />
          <span>Connect & Explore</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
          Connect with Us & Discover More
        </h2>
        <p className="text-sm text-[#94A3B8] max-w-3xl">
          We believe in open source software, transparent public governance, and community-driven engineering. Get in touch, explore the source code repositories, or check out our developer packages and live web applications.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Email */}
          <div className="bg-[#0F172A] border border-[#1E293B] hover:border-emerald-500/40 rounded-2xl p-5 transition flex flex-col justify-between space-y-4 group">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition">
                <Mail className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Direct Email</div>
              <div className="text-sm font-bold text-white break-all font-mono">
                {emailAddress}
              </div>
              <p className="text-xs text-[#94A3B8]">
                For collaborations, inquiries, civic data queries, and feedback.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#1E293B]">
              <a
                href={`mailto:${emailAddress}?subject=CivicTax%20Inquiry`}
                className="flex-1 text-center py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold text-xs border border-emerald-500/30 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                title="Copy email address"
                className="p-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-slate-300 transition cursor-pointer"
              >
                {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Card 2: GitHub */}
          <div className="bg-[#0F172A] border border-[#1E293B] hover:border-sky-500/40 rounded-2xl p-5 transition flex flex-col justify-between space-y-4 group">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 group-hover:scale-105 transition">
                <Github className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Open Source GitHub</div>
              <div className="text-sm font-bold text-white font-mono">
                github.com/negirox
              </div>
              <p className="text-xs text-[#94A3B8]">
                Explore repositories, developer tools, algorithms, and civic architectures.
              </p>
            </div>

            <div className="pt-2 border-t border-[#1E293B]">
              <a
                href="https://github.com/negirox"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-sky-300 font-bold text-xs border border-sky-500/30 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Visit GitHub Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 3: Stack Overflow */}
          <div className="bg-[#0F172A] border border-[#1E293B] hover:border-amber-500/40 rounded-2xl p-5 transition flex flex-col justify-between space-y-4 group">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition">
                <Code2 className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Stack Overflow</div>
              <div className="text-sm font-bold text-white font-mono">
                Negi-Rox
              </div>
              <p className="text-xs text-[#94A3B8]">
                Active technical contributor answering engineering, C#, algorithms, and web queries.
              </p>
            </div>

            <div className="pt-2 border-t border-[#1E293B]">
              <a
                href="https://stackoverflow.com/users/search?q=negi-rox"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-amber-300 font-bold text-xs border border-amber-500/30 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>View Stack Overflow</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 4: NuGet Package */}
          <div className="bg-[#0F172A] border border-[#1E293B] hover:border-purple-500/40 rounded-2xl p-5 transition flex flex-col justify-between space-y-4 group">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-105 transition">
                <Package className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">NuGet Package</div>
              <div className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                <span>{nugetPackageName}</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-bold">.NET</span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                High-performance Excel & data manipulation extension library for .NET developers.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#1E293B]">
              <a
                href="https://www.nuget.org/packages/XLExtension"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-2 px-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 font-bold text-xs border border-purple-500/30 transition cursor-pointer flex items-center justify-center gap-1"
              >
                <span>NuGet Gallery</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={handleCopyPackage}
                title="Copy CLI install command"
                className="p-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-slate-300 transition cursor-pointer"
              >
                {copiedPackage ? <Check className="w-4 h-4 text-purple-400" /> : <Terminal className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EXPLORE MORE PROJECTS SECTION (SPECIFIED BY USER) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Boxes className="w-4 h-4" />
              <span>Portfolio Ecosystem</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white mt-1">
              Explore More Projects
            </h2>
          </div>
          <span className="text-xs text-[#94A3B8]">4 Live Web Applications</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {moreProjects.map((proj) => (
            <div
              key={proj.title}
              className={`bg-[#0F172A] border ${proj.border} rounded-2xl p-6 transition hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#0A0B0D] border border-[#1E293B]">
                      {proj.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-serif">{proj.title}</h3>
                      <span className="text-[11px] font-mono text-emerald-400">{proj.displayUrl}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-[#1E293B] text-slate-300 border border-[#334155]">
                    {proj.badge}
                  </span>
                </div>

                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {proj.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between">
                <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Live Production App</span>
                </span>

                <a
                  href={proj.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-3 rounded-xl bg-[#1E293B] hover:bg-emerald-500 hover:text-slate-950 text-white font-bold text-xs border border-[#334155] hover:border-emerald-400 transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>Launch Application</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CORE ARCHITECTURE & ETHOS */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl p-6 sm:p-10 space-y-8">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Civic Integrity & Technology</span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-white">
            How CivicTax Works Behind the Scenes
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            CivicTax operates under strict data minimization and cryptographic validation. We believe transparency is the bedrock of public trust.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-[#0A0B0D] border border-[#1E293B] p-5 rounded-2xl space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">SHA-256 Ledger Seals</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Every tax return and allocation record generates an immutable SHA-256 digest ensuring records cannot be tampered with post-filing.
            </p>
          </div>

          <div className="bg-[#0A0B0D] border border-[#1E293B] p-5 rounded-2xl space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">AI-Powered Fiscal Modeling</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Integrated with Google Gemini 2.5 Flash to generate personalized civic asset simulations based on your actual tax brackets.
            </p>
          </div>

          <div className="bg-[#0A0B0D] border border-[#1E293B] p-5 rounded-2xl space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Participatory Benchmarks</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Live delta comparison against official Union Budget allocations to highlight the gap between citizen will and statutory policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
