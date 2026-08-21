import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API client (lazily and securely on server only)
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

// In-memory registered user database with pre-seeded demo citizen profiles
// Designed under India's Digital Personal Data Protection Act (DPDP Act), 2023 & DPDP Rules, 2025
// Strictly NO PAN or Aadhaar identifiers are stored.
interface StoredCitizenUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  passwordHash: string;
  profession?: string;
  city?: string;
  state?: string;
  pincode?: string;
  avatar?: string;
  filingCount?: number;
  totalTaxContributed?: number;
  dpdpConsentGranted: boolean;
  dpdpNoticeVersion: string;
  dataSharingConsent: boolean;
  consentTimestamp: string;
  consentVersion: string;
  createdAt: string;
  updatedAt: string;
}

const CITIZEN_USERS_STORE: StoredCitizenUser[] = [
  {
    id: "usr_mukesh",
    fullName: "Mukesh Singh Negi",
    email: "mukeshsingh.negi07@gmail.com",
    phone: "+91 98765 43210",
    passwordHash: "1234", // Demo PIN
    profession: "Senior Software Engineer",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560103",
    filingCount: 3,
    totalTaxContributed: 965000,
    dpdpConsentGranted: true,
    dpdpNoticeVersion: "DPDP-ACT-2023-RULES-2025-v1.0",
    dataSharingConsent: true,
    consentTimestamp: "2026-08-01T10:30:00Z",
    consentVersion: "DPDP-2023-v1.0",
    createdAt: "2026-08-01T09:00:00Z",
    updatedAt: "2026-08-01T10:30:00Z",
  },
  {
    id: "usr_priya",
    fullName: "Priya Narayanan",
    email: "priya.narayanan@example.com",
    phone: "+91 98450 11223",
    passwordHash: "1234",
    profession: "Clinical Research Associate",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600028",
    filingCount: 1,
    totalTaxContributed: 225000,
    dpdpConsentGranted: true,
    dpdpNoticeVersion: "DPDP-ACT-2023-RULES-2025-v1.0",
    dataSharingConsent: true,
    consentTimestamp: "2026-08-05T14:15:00Z",
    consentVersion: "DPDP-2023-v1.0",
    createdAt: "2026-08-05T14:15:00Z",
    updatedAt: "2026-08-05T14:15:00Z",
  },
  {
    id: "usr_rahul",
    fullName: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "+91 97112 33445",
    passwordHash: "1234",
    profession: "Supply Chain Architect",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400050",
    filingCount: 1,
    totalTaxContributed: 610000,
    dpdpConsentGranted: true,
    dpdpNoticeVersion: "DPDP-ACT-2023-RULES-2025-v1.0",
    dataSharingConsent: true,
    consentTimestamp: "2026-08-07T11:45:00Z",
    consentVersion: "DPDP-2023-v1.0",
    createdAt: "2026-08-07T11:45:00Z",
    updatedAt: "2026-08-07T11:45:00Z",
  },
  {
    id: "usr_ananya",
    fullName: "Dr. Ananya Roy",
    email: "ananya.roy@example.com",
    phone: "+91 94331 99887",
    passwordHash: "1234",
    profession: "Biotech Scientist & Educator",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700019",
    filingCount: 1,
    totalTaxContributed: 490000,
    dpdpConsentGranted: true,
    dpdpNoticeVersion: "DPDP-ACT-2023-RULES-2025-v1.0",
    dataSharingConsent: true,
    consentTimestamp: "2026-08-10T16:00:00Z",
    consentVersion: "DPDP-2023-v1.0",
    createdAt: "2026-08-10T16:00:00Z",
    updatedAt: "2026-08-10T16:00:00Z",
  },
];

// Helper to sanitize user object (remove passwordHash)
function sanitizeCitizenUser(user: StoredCitizenUser, token?: string) {
  const { passwordHash, ...rest } = user;
  return {
    ...rest,
    token: token || `ct_token_${Buffer.from(`${user.id}:${user.email}`).toString("base64")}`,
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      service: "civictax-api",
      dpdpCompliance: "DPDP Act 2023 & DPDP Rules 2025 Compliant",
      purpose: "Independent Civic Budget Opinion Survey (Non-Government)",
    });
  });

  // -------------------------------------------------------------
  // AUTHENTICATION & CITIZEN REGISTRATION ENDPOINTS (DPDP ACT 2023)
  // -------------------------------------------------------------

  // 1. Citizen Registration with Explicit DPDP Act 2023 Consent & Data Minimization
  app.post("/api/auth/register", (req: Request, res: Response) => {
    try {
      const {
        fullName,
        email,
        phone,
        password,
        profession,
        city,
        state,
        pincode,
        termsAccepted,
        dataSharingConsent,
        accuracyDeclaration,
        dpdpConsentGranted,
      } = req.body;

      // Validate required fields (Email & Full Name are primary identifiers)
      if (!fullName || !email) {
        return res.status(400).json({
          error: "Full Name and Email address are mandatory for registration under DPDP Act 2023 guidelines.",
        });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      if (!cleanEmail.includes("@") || cleanEmail.length < 5) {
        return res.status(400).json({
          error: "Please provide a valid email address.",
        });
      }

      // Validate Explicit DPDP Act 2023 Terms & Consents
      if (termsAccepted !== true) {
        return res.status(400).json({
          error: "You must accept the CivicTax Survey Terms & DPDP Privacy Notice.",
        });
      }

      if (dataSharingConsent !== true && dpdpConsentGranted !== true) {
        return res.status(400).json({
          error:
            "Participant consent under Section 6 of DPDP Act 2023 is required to process and aggregate anonymized civic budget preferences.",
        });
      }

      if (accuracyDeclaration !== true) {
        return res.status(400).json({
          error: "You must declare that the demographic and civic opinion information provided is genuine.",
        });
      }

      const cleanPhone = phone ? String(phone).trim() : undefined;

      // Check if user already exists by email
      const existingUser = CITIZEN_USERS_STORE.find(
        (u) => u.email.toLowerCase() === cleanEmail
      );

      if (existingUser) {
        // Update user consent and profile details if needed
        existingUser.dataSharingConsent = true;
        existingUser.dpdpConsentGranted = true;
        existingUser.consentTimestamp = new Date().toISOString();
        if (password) existingUser.passwordHash = String(password);
        if (cleanPhone) existingUser.phone = cleanPhone;
        if (profession) existingUser.profession = String(profession);
        if (city) existingUser.city = String(city);
        if (state) existingUser.state = String(state);
        if (pincode) existingUser.pincode = String(pincode);
        existingUser.updatedAt = new Date().toISOString();

        const token = `ct_token_${Buffer.from(`${existingUser.id}:${existingUser.email}`).toString("base64")}`;
        return res.json({
          success: true,
          message: "Participant profile recognized and authenticated successfully under DPDP Act 2023 rules.",
          user: sanitizeCitizenUser(existingUser, token),
        });
      }

      // Create new citizen user
      const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const nowIso = new Date().toISOString();

      const newCitizen: StoredCitizenUser = {
        id: newUserId,
        fullName: String(fullName).trim(),
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash: password ? String(password) : "1234",
        profession: profession ? String(profession).trim() : "Civic Participant",
        city: city ? String(city).trim() : "Bengaluru",
        state: state ? String(state).trim() : "Karnataka",
        pincode: pincode ? String(pincode).trim() : "560001",
        filingCount: 0,
        totalTaxContributed: 0,
        dpdpConsentGranted: true,
        dpdpNoticeVersion: "DPDP-ACT-2023-RULES-2025-v1.0",
        dataSharingConsent: true,
        consentTimestamp: nowIso,
        consentVersion: "DPDP-2023-v1.0",
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      CITIZEN_USERS_STORE.push(newCitizen);

      const token = `ct_token_${Buffer.from(`${newCitizen.id}:${newCitizen.email}`).toString("base64")}`;

      return res.status(201).json({
        success: true,
        message: "Participant registered and authenticated successfully under DPDP Act 2023.",
        user: sanitizeCitizenUser(newCitizen, token),
      });
    } catch (err: any) {
      console.error("Citizen registration error:", err);
      return res.status(500).json({ error: err.message || "Failed to register participant." });
    }
  });

  // 2. Citizen Sign In (by Email or Phone with Password/PIN verification)
  app.post("/api/auth/login", (req: Request, res: Response) => {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !String(identifier).trim()) {
        return res.status(400).json({
          error: "Please provide your registered Email Address or Phone Number.",
        });
      }

      const cleanId = String(identifier).trim().toLowerCase();
      const digitsOnly = cleanId.replace(/\D/g, "");

      const user = CITIZEN_USERS_STORE.find((u) => {
        const uEmail = u.email.toLowerCase();
        const uPhoneDigits = (u.phone || "").replace(/\D/g, "");
        const matchEmail = uEmail === cleanId;
        const matchPhone = digitsOnly.length >= 10 && uPhoneDigits.endsWith(digitsOnly.slice(-10));
        return matchEmail || matchPhone;
      });

      if (!user) {
        return res.status(404).json({
          error: "No participant profile found with this Email or Phone number. Please register a new survey profile.",
        });
      }

      // If a password was provided, verify it (demo allows '1234' or matched hash)
      if (password && user.passwordHash && user.passwordHash !== String(password) && String(password) !== "1234") {
        return res.status(401).json({
          error: "Invalid Security PIN / Password. (Default demo PIN is 1234)",
        });
      }

      const token = `ct_token_${Buffer.from(`${user.id}:${user.email}`).toString("base64")}`;

      return res.json({
        success: true,
        message: "Participant authenticated successfully.",
        user: sanitizeCitizenUser(user, token),
      });
    } catch (err: any) {
      console.error("Citizen login error:", err);
      return res.status(500).json({ error: err.message || "Failed to sign in." });
    }
  });

  // 3. Current Authenticated Session Me route
  app.get("/api/auth/me", (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or invalid authorization header." });
      }

      const token = authHeader.split(" ")[1];
      if (!token.startsWith("ct_token_")) {
        return res.status(401).json({ error: "Invalid token format." });
      }

      const base64Str = token.replace("ct_token_", "");
      const decoded = Buffer.from(base64Str, "base64").toString("utf-8");
      const [userId, userEmail] = decoded.split(":");

      const user = CITIZEN_USERS_STORE.find(
        (u) => u.id === userId || u.email.toLowerCase() === (userEmail || "").toLowerCase()
      );

      if (!user) {
        return res.status(404).json({ error: "Authenticated survey session expired." });
      }

      return res.json({
        success: true,
        user: sanitizeCitizenUser(user, token),
      });
    } catch (err: any) {
      console.error("Auth session verification error:", err);
      return res.status(500).json({ error: "Session validation failed." });
    }
  });

  // 4. Update Citizen DPDP Consent (Consent Withdrawal & Update under Section 6(4))
  app.post("/api/auth/consent", (req: Request, res: Response) => {
    try {
      const { userId, email, consentGiven, consentVersion } = req.body;
      const user = CITIZEN_USERS_STORE.find(
        (u) => (userId && u.id === userId) || (email && u.email.toLowerCase() === String(email).toLowerCase())
      );

      if (!user) {
        return res.status(404).json({ error: "Participant profile not found." });
      }

      user.dataSharingConsent = consentGiven === true;
      user.dpdpConsentGranted = consentGiven === true;
      user.consentTimestamp = new Date().toISOString();
      user.consentVersion = consentVersion || "DPDP-ACT-2023-RULES-2025-v1.0";
      user.updatedAt = new Date().toISOString();

      return res.json({
        success: true,
        message: consentGiven
          ? "DPDP Act 2023 survey research consent granted."
          : "DPDP Act 2023 survey consent withdrawn. Anonymized data will not be shared in future public consensus sets.",
        user: sanitizeCitizenUser(user),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to update consent." });
    }
  });

  // 5. Get list of demo/available citizen profiles for rapid switching
  app.get("/api/auth/demo-users", (_req: Request, res: Response) => {
    const list = CITIZEN_USERS_STORE.map((u) => sanitizeCitizenUser(u));
    res.json({ success: true, users: list });
  });

  // AI Civic & Budgetary Impact Insight
  app.post("/api/civic-impact-ai", async (req: Request, res: Response) => {
    try {
      const {
        taxpayerName,
        taxPaid,
        salary,
        profession,
        financialYear,
        allocations,
        citizenNote,
      } = req.body;

      const ai = getAiClient();
      if (!ai) {
        // Return structured rule-based civic impact if no API key is available
        return res.json({
          summary: `As a ${profession || "Civic Participant"} contributing an estimated ₹${Number(taxPaid || 0).toLocaleString("en-IN")} in tax benchmark for FY ${financialYear || "2025-26"}, your preferred prioritization directs civic focus into key community sectors.`,
          keyTakeaways: [
            `Direct allocation preference reflects community demand for balanced infrastructure and public services.`,
            `Transparent consensus modeling provides valuable public policy signals for local development.`,
            `Active civic participation encourages transparent fiscal prioritization.`,
          ],
          civicEmpowermentQuote: "Informed citizen participation empowers transparent civic dialogue and balanced community development.",
        });
      }

      const prompt = `You are an independent civic finance and public policy research specialist. Analyze the following citizen's survey response and budgetary prioritization preferences for national public development:
Participant: ${taxpayerName || "Civic Participant"}
Profession: ${profession || "Working Professional"}
Reported Annual Income: ₹${salary}
Tax Contribution Benchmark: ₹${taxPaid}
Financial Year: ${financialYear}
Preferred Allocations: ${JSON.stringify(allocations)}
Citizen's Civic Vision / Note: "${citizenNote || "Ensure transparent and quality public amenities"}"

Note: This is an independent civic survey in India governed under the DPDP Act, 2023.

Provide a concise, inspiring, and transparent civic impact analysis in JSON format with:
1. "summary": A 2-sentence empowering evaluation of how their specific allocation preference affects civic priorities.
2. "keyTakeaways": An array of 3 bullet points showing tangible local or national outcomes enabled by their preferences (e.g. healthcare facilities, schools, highway km, clean energy).
3. "civicEmpowermentQuote": A 1-sentence memorable quote about civic participation and transparent public policy.

Respond strictly in valid JSON format.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      try {
        const parsed = JSON.parse(text);
        res.json(parsed);
      } catch (parseErr) {
        res.json({
          summary: text,
          keyTakeaways: [
            "Your preference signals vital support for public infrastructure and education.",
            "Citizen feedback fosters accountable community planning benchmarks.",
          ],
          civicEmpowermentQuote: "Every voice in civic planning strengthens democratic transparency.",
        });
      }
    } catch (err: any) {
      console.error("AI Civic Impact generation error:", err);
      res.status(500).json({
        error: "Failed to generate AI insights",
        summary: "Your survey contribution actively highlights civic priorities across infrastructure, healthcare, and education.",
        keyTakeaways: [
          "Informs sustainable economic development and public welfare priorities.",
          "Strengthens citizen-driven public policy benchmarks.",
        ],
        civicEmpowermentQuote: "Civic stewardship begins with individual transparency.",
      });
    }
  });

  // SEO: robots.txt endpoint (mirrors public/robots.txt for non-static deployments)
  app.get("/robots.txt", (_req: Request, res: Response) => {
    res.type("text/plain").send(`User-agent: *\nAllow: /\n\nSitemap: https://civic-tax.vercel.app/sitemap.xml\n`);
  });

  // SEO: sitemap.xml endpoint (mirrors public/sitemap.xml for non-static deployments)
  // Note: CivicTax is a single-page app - all views live under one URL, so only
  // the real document is listed. Hash-fragment "pages" are not separately
  // crawlable and Google canonicalizes them back to the base URL anyway.
  app.get("/sitemap.xml", (_req: Request, res: Response) => {
    res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://civic-tax.vercel.app/</loc>
    <lastmod>2026-08-21</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CivicTax Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
