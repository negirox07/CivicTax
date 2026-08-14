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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", service: "civictax-api" });
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
