import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// In-memory registered user database with pre-seeded demo citizen profiles
interface StoredCitizenUser {
  id: string;
  fullName: string;
  email: string;
  panNumber: string;
  passwordHash: string;
  aadhaarNumber?: string;
  phone?: string;
  profession?: string;
  city?: string;
  state?: string;
  pincode?: string;
  avatar?: string;
  filingCount?: number;
  totalTaxContributed?: number;
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
    panNumber: "ABCDE1234F",
    passwordHash: "1234", // Simple demo PIN
    aadhaarNumber: "789456123012",
    phone: "+91 98765 43210",
    profession: "Senior Software Engineer",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560103",
    filingCount: 3,
    totalTaxContributed: 965000,
    dataSharingConsent: true,
    consentTimestamp: "2025-04-12T10:30:00Z",
    consentVersion: "v1.0-public-growth",
    createdAt: "2025-04-10T09:00:00Z",
    updatedAt: "2025-04-12T10:30:00Z",
  },
  {
    id: "usr_priya",
    fullName: "Priya Narayanan",
    email: "priya.narayanan@example.com",
    panNumber: "BPLPN5432K",
    passwordHash: "1234",
    aadhaarNumber: "453218907654",
    phone: "+91 98450 11223",
    profession: "Clinical Research Associate",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600028",
    filingCount: 1,
    totalTaxContributed: 225000,
    dataSharingConsent: true,
    consentTimestamp: "2025-05-18T14:15:00Z",
    consentVersion: "v1.0-public-growth",
    createdAt: "2025-05-18T14:15:00Z",
    updatedAt: "2025-05-18T14:15:00Z",
  },
  {
    id: "usr_rahul",
    fullName: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    panNumber: "AZRPS8876M",
    passwordHash: "1234",
    aadhaarNumber: "671290345612",
    phone: "+91 97112 33445",
    profession: "Supply Chain Architect",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400050",
    filingCount: 1,
    totalTaxContributed: 610000,
    dataSharingConsent: true,
    consentTimestamp: "2025-06-02T11:45:00Z",
    consentVersion: "v1.0-public-growth",
    createdAt: "2025-06-02T11:45:00Z",
    updatedAt: "2025-06-02T11:45:00Z",
  },
  {
    id: "usr_ananya",
    fullName: "Dr. Ananya Roy",
    email: "ananya.roy@example.com",
    panNumber: "CKPAR4412Q",
    passwordHash: "1234",
    aadhaarNumber: "332187654321",
    phone: "+91 94331 99887",
    profession: "Biotech Scientist & Educator",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700019",
    filingCount: 1,
    totalTaxContributed: 490000,
    dataSharingConsent: true,
    consentTimestamp: "2025-06-20T16:00:00Z",
    consentVersion: "v1.0-public-growth",
    createdAt: "2025-06-20T16:00:00Z",
    updatedAt: "2025-06-20T16:00:00Z",
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
    res.json({ status: "ok", service: "civictax-api" });
  });

  // -------------------------------------------------------------
  // AUTHENTICATION & CITIZEN REGISTRATION ENDPOINTS
  // -------------------------------------------------------------

  // 1. Citizen Registration with Explicit Backend Terms & Consent Validation
  app.post("/api/auth/register", (req: Request, res: Response) => {
    try {
      const {
        fullName,
        email,
        panNumber,
        password,
        aadhaarNumber,
        phone,
        profession,
        city,
        state,
        pincode,
        termsAccepted,
        dataSharingConsent,
        accuracyDeclaration,
      } = req.body;

      // Validate required fields
      if (!fullName || !email || !panNumber) {
        return res.status(400).json({
          error: "Full name, Email address, and PAN Number are mandatory for citizen registration.",
        });
      }

      // Validate Explicit Terms & Conditions and Consents
      if (termsAccepted !== true) {
        return res.status(400).json({
          error: "You must accept the CivicTax Terms of Service & Privacy Policy to create an account.",
        });
      }

      if (dataSharingConsent !== true) {
        return res.status(400).json({
          error:
            "Citizen consent is required. You must check the consent agreement to share anonymized tax allocation data for national public transparency and civic growth.",
        });
      }

      if (accuracyDeclaration !== true) {
        return res.status(400).json({
          error: "You must certify that the taxpayer identity and financial details provided are accurate.",
        });
      }

      // Clean & validate PAN
      const cleanPan = String(panNumber).trim().toUpperCase();
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(cleanPan)) {
        return res.status(400).json({
          error: "Invalid PAN format. PAN must be exactly 10 characters (e.g. ABCDE1234F).",
        });
      }

      const cleanEmail = String(email).trim().toLowerCase();

      // Check if user already exists
      const existingUser = CITIZEN_USERS_STORE.find(
        (u) =>
          u.email.toLowerCase() === cleanEmail ||
          u.panNumber.toUpperCase() === cleanPan
      );

      if (existingUser) {
        // Update user consent and profile details if needed
        existingUser.dataSharingConsent = true;
        existingUser.consentTimestamp = new Date().toISOString();
        if (password) existingUser.passwordHash = String(password);
        if (phone) existingUser.phone = String(phone);
        if (profession) existingUser.profession = String(profession);
        if (city) existingUser.city = String(city);
        if (state) existingUser.state = String(state);
        if (pincode) existingUser.pincode = String(pincode);
        existingUser.updatedAt = new Date().toISOString();

        const token = `ct_token_${Buffer.from(`${existingUser.id}:${existingUser.email}`).toString("base64")}`;
        return res.json({
          success: true,
          message: "Citizen profile recognized and logged in successfully.",
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
        panNumber: cleanPan,
        passwordHash: password ? String(password) : "1234",
        aadhaarNumber: aadhaarNumber ? String(aadhaarNumber).trim() : undefined,
        phone: phone ? String(phone).trim() : undefined,
        profession: profession ? String(profession).trim() : "Taxpayer Contributor",
        city: city ? String(city).trim() : "Bengaluru",
        state: state ? String(state).trim() : "Karnataka",
        pincode: pincode ? String(pincode).trim() : "560001",
        filingCount: 0,
        totalTaxContributed: 0,
        dataSharingConsent: true,
        consentTimestamp: nowIso,
        consentVersion: "v1.0-public-growth",
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      CITIZEN_USERS_STORE.push(newCitizen);

      const token = `ct_token_${Buffer.from(`${newCitizen.id}:${newCitizen.email}`).toString("base64")}`;

      return res.status(201).json({
        success: true,
        message: "Citizen registered and authenticated successfully.",
        user: sanitizeCitizenUser(newCitizen, token),
      });
    } catch (err: any) {
      console.error("Citizen registration error:", err);
      return res.status(500).json({ error: err.message || "Failed to register citizen." });
    }
  });

  // 2. Citizen Sign In (by Email or PAN with Password/PIN verification)
  app.post("/api/auth/login", (req: Request, res: Response) => {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !String(identifier).trim()) {
        return res.status(400).json({
          error: "Please provide your Email Address or 10-Digit PAN Number.",
        });
      }

      const cleanId = String(identifier).trim().toLowerCase();
      const cleanPan = String(identifier).trim().toUpperCase();

      const user = CITIZEN_USERS_STORE.find(
        (u) =>
          u.email.toLowerCase() === cleanId ||
          u.panNumber.toUpperCase() === cleanPan
      );

      if (!user) {
        return res.status(404).json({
          error: "No citizen account found with this Email or PAN. Please register a new account.",
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
        message: "Citizen authenticated successfully.",
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
      // Format: ct_token_<base64(id:email)>
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
        return res.status(404).json({ error: "Authenticated citizen session expired." });
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

  // 4. Update Citizen Data Sharing Consent
  app.post("/api/auth/consent", (req: Request, res: Response) => {
    try {
      const { userId, email, consentGiven, consentVersion } = req.body;
      const user = CITIZEN_USERS_STORE.find(
        (u) => (userId && u.id === userId) || (email && u.email.toLowerCase() === String(email).toLowerCase())
      );

      if (!user) {
        return res.status(404).json({ error: "Citizen not found." });
      }

      user.dataSharingConsent = consentGiven === true;
      user.consentTimestamp = new Date().toISOString();
      user.consentVersion = consentVersion || "v1.0-public-growth";
      user.updatedAt = new Date().toISOString();

      return res.json({
        success: true,
        message: "Data sharing and civic growth consent preference updated.",
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
          summary: `As a ${profession || "Citizen"} contributing ₹${Number(taxPaid || 0).toLocaleString("en-IN")} in FY ${financialYear || "2025-26"}, your preferred prioritization directs significant public funds into key civic building blocks.`,
          keyTakeaways: [
            `Direct contribution creates high multiplier effects in local state development.`,
            `Balanced resource distribution accelerates essential public infrastructure and welfare capabilities.`,
            `Active civic participation encourages transparent governmental fiscal planning.`,
          ],
          civicEmpowermentQuote: "Informed citizen participation transforms mandatory taxation into purposeful nation building.",
        });
      }

      const prompt = `You are a civic finance and public policy expert. Analyze the following taxpayer's annual tax filing and sector allocation preference for national public budgets:
Taxpayer Name: ${taxpayerName || "Citizen"}
Profession: ${profession || "Working Professional"}
Annual Income: ₹${salary}
Tax Paid: ₹${taxPaid}
Financial Year: ${financialYear}
Allocations: ${JSON.stringify(allocations)}
Citizen's Civic Note / Vision: "${citizenNote || "Ensure transparent and quality public amenities"}"

Provide a concise, inspiring, and transparent civic impact analysis in JSON format with:
1. "summary": A 2-sentence empowering evaluation of how their specific rupee contribution and chosen allocation affects civic progress.
2. "keyTakeaways": An array of 3 bullet points showing tangible local or national outcomes enabled by their preferences (e.g. healthcare facilities, schools, highway km, clean energy).
3. "civicEmpowermentQuote": A 1-sentence memorable quote about civic responsibility and transparent governance.

Respond strictly in valid JSON format.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
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
            "Your tax investment accelerates vital social and economic infrastructure.",
            "Citizen feedback fosters accountable government budgetary allocation.",
          ],
          civicEmpowermentQuote: "Every rupee accounted for is a step toward stronger democracy.",
        });
      }
    } catch (err: any) {
      console.error("AI Civic Impact generation error:", err);
      res.status(500).json({
        error: "Failed to generate AI insights",
        summary: "Your tax contribution actively drives local and national progress across infrastructure, healthcare, and education.",
        keyTakeaways: [
          "Drives sustainable economic growth and public welfare.",
          "Strengthens transparent civic allocation benchmarks.",
        ],
        civicEmpowermentQuote: "Civic stewardship begins with individual transparency.",
      });
    }
  });

  // SEO: robots.txt endpoint
  app.get("/robots.txt", (_req: Request, res: Response) => {
    res.type("text/plain").send(`User-agent: *\nAllow: /\n\nSitemap: https://civictax.org/sitemap.xml\n`);
  });

  // SEO: sitemap.xml endpoint
  app.get("/sitemap.xml", (_req: Request, res: Response) => {
    res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://civictax.org/</loc>
    <lastmod>2026-08-14</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://civictax.org/#filing</loc>
    <lastmod>2026-08-14</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://civictax.org/#dashboard</loc>
    <lastmod>2026-08-14</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://civictax.org/#transparency</loc>
    <lastmod>2026-08-14</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://civictax.org/#reports</loc>
    <lastmod>2026-08-14</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
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
