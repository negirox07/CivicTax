# CivicTax — Citizen Tax Allocation & Civic Impact Platform

> **A participatory governance platform empowering citizens to record tax filings, allocate capital across 8 national development sectors, benchmark priorities against statutory Union Budgets, and generate cryptographically verified impact certificates.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-38b2ac.svg)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.15-22c55e.svg)](https://recharts.org/)
[![Google Gemini API](https://img.shields.io/badge/Gemini_AI-2.5_Flash-8b5cf6.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)

---

## 🌟 Overview

**CivicTax** bridges the gap between fiscal obligations and public accountability. Traditional tax filing ends at compliance; CivicTax transforms every rupee contributed into a direct civic voice by allowing citizens to simulate and vote on national fiscal priorities.

### Key Pillars:
1. **Participatory Budgeting**: Allocate income tax across 8 core national sectors (Healthcare, Education, Clean Energy, Infrastructure, Agriculture, Science & Tech, Social Welfare, Defense).
2. **National Consensus Dashboard**: Real-time aggregate analytics featuring interactive Recharts donut and comparative bar charts that contrast citizen demand against statutory Union Budget allocations.
3. **Cryptographic Verification**: Every tax record and allocation is sealed with an immutable SHA-256 hash stamp for verifiable authenticity.
4. **AI Fiscal Simulation**: Powered by Google Gemini 2.5 Flash to project direct tangible outcomes (e.g., hospital beds funded, school labs built, solar capacity added).
5. **Printable Tax & Impact Reports**: Official multi-year summary reports and printable Certificates of Civic Contribution.
6. **Supabase Cloud Synchronization**: Instant bi-directional cloud synchronization for public open ledger data.

---

## 🚀 Key Features

### 1. 📊 Global Public Consensus Dashboard
- **Interactive Recharts Donut Chart**: Visualizes national aggregate budget priority weights across all 8 development sectors with center hover metrics and capital volumes in INR.
- **Head-to-Head Comparative Cards**: Directly compare paired sectors (e.g., *Education vs. Healthcare*, *Clean Energy vs. Infrastructure*, *Agriculture vs. Science & Tech*) to inspect public preference margins.
- **Statutory Benchmark Comparison**: Visualizes delta percentages comparing citizen consensus against Union Budget baselines.
- **Geographic & Sectoral Breakdown**: State-by-state, city-level, and profession-based filtering.
- **Citizen Proposals Stream**: Public civic proposals with live community upvoting.

### 2. 📝 Participatory Tax Filing Engine
- **Income & Tax Slabs**: Automatic progressive tax computation under Old and New regimes for FY 2024-25, 2025-26, and 2026-27.
- **Dynamic 100% Allocation Sliders**: Lockable and auto-balancing sliders allowing taxpayers to direct their exact contributions.
- **Municipal Civic Proposals**: Attach localized municipal infrastructure proposals to filing receipts.
- **Mandatory Authentication & Terms**: Protected filing workflow requiring explicit acceptance of platform terms, citizen open data consent, and accuracy declarations.

### 3. 📜 Citizen Multi-Year Portfolio & Historical Ledger
- **Multi-Year History**: Track annual contributions, cumulative civic tax investments, and historical allocation shifts.
- **SHA-256 Integrity Verification**: Real-time hash verification verifying that records have not been tampered with.
- **Official PDF & Print Reports**: Generate downloadable, print-optimized Certificates of Civic Contribution and multi-year tax summaries.

### 4. 🤖 AI-Powered Civic Impact Simulator
- Leverages the **Google Gen AI SDK (`@google/genai`)** with `gemini-2.5-flash` to generate personalized economic impact analyses, localized municipal outcomes, and civic empowerment takeaways.

### 5. ☁️ Supabase Cloud Synchronization
- One-click schema execution and real-time synchronization with Supabase PostgreSQL for persistent multi-device access.

---

## 🔍 Search Engine Optimization (SEO) & Google Discoverability

CivicTax is architected for search engine indexing, fast web crawler discovery, and rich search snippet presentation:

### 1. Comprehensive Meta Tags (`/index.html`)
- **Descriptive Titles & Snippets**: Optimized for high click-through rate (CTR) on queries like *"tax allocation India"*, *"participatory citizen budget"*, and *"track tax impact"*.
- **Open Graph & Twitter Cards**: High-resolution 1200x630 social preview banners, rich titles, and summaries for sharing on Twitter/X, LinkedIn, WhatsApp, and Facebook.
- **Robots & Googlebot Directives**: `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1` ensuring search engines index all pages and generate rich snippet previews.

### 2. Schema.org JSON-LD Structured Data
Implemented Google-compliant JSON-LD graph objects:
- **`WebApplication`**: Declares application category (`FinanceApplication`, `GovernmentApplication`), operating system compatibility, free pricing offer, and full feature capabilities list.
- **`Organization`**: Declares platform identity, official logo, and social endpoints.
- **`FAQPage`**: Rich-result FAQ schema covering participatory tax allocation mechanisms, citizen identity encryption, and public ledger consensus calculations.

### 3. Crawler Infrastructure
- **`public/robots.txt` & Server Endpoint (`/robots.txt`)**: Grants unrestricted access to search engine crawlers and points to the sitemap.
- **`public/sitemap.xml` & Server Endpoint (`/sitemap.xml`)**: XML sitemap with daily/weekly change frequencies, canonical URLs, and priority weighting for all core routes (`/`, `/#filing`, `/#dashboard`, `/#transparency`, `/#reports`).
- **Canonical URLs**: Canonical link tags preventing duplicate indexing across previews and subdomains.

---

## 🛠️ Architecture & Tech Stack

```
CivicTax Application
├── Client-Side (React 18 + Vite + Tailwind CSS)
│   ├── src/components/
│   │   ├── GlobalDashboardView.tsx   # Recharts Donut & Consensus Charts
│   │   ├── TaxFilingForm.tsx         # Tax computation & allocation sliders
│   │   ├── DashboardView.tsx         # Citizen personal multi-year ledger
│   │   ├── CivicTransparencyView.tsx # Public ledger & proposal voting
│   │   ├── PdfReportsView.tsx        # Printable annual tax reports
│   │   ├── CertificateModal.tsx      # Cryptographic SHA-256 certificate
│   │   ├── AuthModal.tsx             # Citizen registration & mandatory terms
│   │   └── SupabaseSetupModal.tsx    # Cloud database provisioning
│   ├── src/utils/dataService.ts      # Tax math, consensus aggregation, storage
│   └── src/types.ts                  # Shared TypeScript models
│
├── Server-Side (Express + Node.js)
│   ├── server.ts                     # API proxy, Auth routes, SEO endpoints, Vite SSR
│   └── Google Gemini 2.5 Flash API   # AI Impact generation
│
└── SEO & Web Crawlers
    ├── index.html                    # Meta, OG, Twitter, Schema.org JSON-LD
    ├── public/robots.txt             # Crawler crawl rules
    └── public/sitemap.xml            # Search engine URL hierarchy
```

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or bun

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/CivicTax/civictax.git
cd civictax

# Install dependencies
npm install
```

### 2. Environment Variables
Create a `.env` file from the provided `.env.example`:
```env
PORT=3000
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 3. Running Locally
```bash
# Start the full-stack dev server (Express + Vite on Port 3000)
npm run dev
```

Visit `http://localhost:3000` to interact with CivicTax.

### 4. Building for Production
```bash
# Compile client assets and bundle server.cjs
npm run build

# Launch the production server
npm start
```

---

## 🤝 Connect & Explore

### Connect with Us
- 📧 **Email**: [`mukeshsingh.negi07@gmail.com`](mailto:mukeshsingh.negi07@gmail.com)
- 💻 **GitHub**: [github.com/negirox](https://github.com/negirox)
- 🧑‍💻 **Stack Overflow**: [Negi-Rox](https://stackoverflow.com/users/search?q=negi-rox)
- 📦 **NuGet Package**: [`XLExtension`](https://www.nuget.org/packages/XLExtension)

### Explore More Projects
- 🌐 [**algo-viz-nu.vercel.app**](https://algo-viz-nu.vercel.app) — Interactive Algorithm & Data Structures Visualizer
- 🌐 [**neon-ime.vercel.app**](https://neon-ime.vercel.app) — Modern Neon Web IME & Linguistic Keyboard Workspace
- 🌐 [**atmosphere-iq.vercel.app**](https://atmosphere-iq.vercel.app) — Real-Time Atmospheric Telemetry, AQI, & Weather Intelligence
- 🌐 [**mytoolhub.vercel.app**](https://mytoolhub.vercel.app) — Unified Developer Utilities & Productivity Suite

---

## 🔒 Security & Privacy Architecture

- **Privacy Policy**: Comprehensive data governance and rights accessible at the `/privacy` route.
- **Admin Access Control**: Database synchronization controls (`DB:Syncup` badge, schema migrations, and cloud provisioning tools) are strictly restricted to admin (`mukeshsingh.negi07@gmail.com`) and hidden from public visitors.
- **Privacy Shield**: Full PAN numbers and phone numbers are encrypted and masked (`CKPAR****Q`).
- **Anonymized Open Data**: Only anonymized sector percentages and geographic aggregates are published to the consensus ledger.
- **SHA-256 Hash Verification**: Records are sealed at submission time using client/server SHA-256 hashing.
- **Strict Registration Agreements**: Enforces a 3-part agreement suite (Terms of Service, Public Growth Consent, and Identity Accuracy Declaration) validated on both client and server.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
