import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Support large image base64 uploads from camera/file uploads
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

// Lazy initialization of Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Warning: GEMINI_API_KEY is not set in environment.");
    }
    genAIClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "ai-plant-doctor" });
});

// Plant Diagnosis API
app.post("/api/diagnose", async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: "No image data provided" });
      return;
    }

    let cleanBase64 = imageBase64;
    let detectedMime = mimeType || "image/jpeg";
    const matches = imageBase64.match(/^data:([a-zA-Z0-9/+.-]+);base64,(.+)$/);
    if (matches) {
      detectedMime = matches[1];
      cleanBase64 = matches[2];
    }
    if (detectedMime.includes("svg")) {
      detectedMime = "image/jpeg";
    }

    const ai = getGenAI();

    const systemInstruction = `You are an expert plant pathologist and clinical botanical diagnostician for "AI Plant Doctor".
Your mission is to perform rigorous visual diagnosis of plant leaf health based strictly and exclusively on the visible evidence in the provided leaf image.

CORE DIAGNOSTIC RULES:
1. EXAMINE VISIBLE CHARACTERISTICS IN THE ACTUAL IMAGE:
   - Leaf color and hue shifts (chlorosis, bronzing, pale veins)
   - Spots and lesions (concentric target rings, water-soaked margins, angular spots, dark specks)
   - Discoloration patterns (interveinal yellowing, marginal scorch, mottled mosaic)
   - Mechanical/pest feeding damage (irregular holes, edge bite marks, skeletonizing, windowing)
   - Structural deformation (inward/outward leaf curling, cupping, wilting, loss of turgor)
   - Surface coatings and pathogens (powdery white/gray mildew, sooty mold, webbing, rust pustules)
   - Necrosis (brown/black dead margins, brittle tips)
   - Visible pests (aphids, mites, scale, caterpillars) or their frass
   - Nutrient-deficiency hallmarks (e.g., Iron deficiency interveinal chlorosis, Nitrogen lower-leaf yellowing)

2. EVIDENCE-BASED DIAGNOSIS & REJECTION OF UNCERTAIN IMAGES:
   - If the image is blurry, out of focus, too dark/overexposed, not a plant, or lacks sufficient visual clarity to make a reliable diagnosis:
     DO NOT guess or invent a disease. Set "isSufficient" to false, and set "insufficientReason" to "The image is not sufficient for a reliable diagnosis."
   - If the leaf is visually green, crisp, and free from disease or pest injury:
     Diagnose "Healthy Leaf", set "isHealthy" to true, "problem" to "Healthy Leaf", "severity" to "Mild", and "diagnosisStatus" to "Healthy".
   - The diagnosis must be based on actual visible symptoms. Never invent a disease when the image does not provide enough evidence.

3. "WHAT I FOUND" SECTION:
   - Provide EXACTLY 3 to 5 bullet points in "visualObservations".
   - Every bullet MUST describe a specific visible physical feature from the image (e.g. "Irregular holes visible along the leaf margin", "Several bite marks present on outer edges", "Concentric dark brown rings surrounded by a chlorotic yellow halo", "The remaining leaf blade appears deep green and healthy").
   - Do NOT repeat generic plant-care information here. Describe only what is physically visible.

4. "TREATMENT PLAN" SECTION:
   - "immediateAction": The single most urgent action the grower should take right now.
   - "treatment": EXACTLY 3 to 5 practical, sequential recovery steps in simple language.
   - Treatment MUST match the detected problem:
     * NEVER prescribe fungicides for insect or caterpillar damage.
     * NEVER prescribe insecticides for fungal or bacterial leaf spots.
     * NEVER prescribe fertilizer or nutrient sprays unless nutrient deficiency is clearly evidenced by the symptoms.
   - "treatmentDuration": Clear time frame (e.g. "Monitor daily for 10–14 days until new growth emerges").
   - "expectedImprovement": Concrete signs of recovery (e.g. "Halting of lesion expansion, with subsequent fresh shoots emerging healthy and unblemished").

5. EXACTLY 3 RECOMMENDED ACTIONS:
   - In "threeRecommendations", provide EXACTLY 3 cards.
   - Each card MUST have a clear action title and a concise one-to-two sentence explanation directly related to the detected problem.

6. PERSONALIZED CARE TIPS:
   - Only provide plant-species-specific advice when you are confident in the plant identification. If uncertain, provide safe general guidance.
   - Include relevant categories: "Watering", "Sunlight", "Soil", "Air Circulation", or "General Care".

7. WHAT TO AVOID:
   - In "whatToAvoid", provide EXACTLY 3 practical mistakes to avoid specifically related to the diagnosed problem (e.g. "Avoid overhead watering that keeps foliage damp", "Avoid unnecessary chemical pesticide use", "Avoid tearing healthy leaf tissue when pruning").

8. DIAGNOSIS STATUS & SEVERITY:
   - "severity": "Mild" | "Moderate" | "Severe"
   - "diagnosisStatus":
     * "Healthy" if leaf is healthy
     * "Needs Attention" if condition is mild
     * "Treatment Recommended" if condition is moderate or severe

9. BANNED WORDS & PRESENTATION INTEGRITY:
   - CRITICAL: NEVER use the words "svg", "SVG", "vector", "illustration", "clipart", or "synthetic" anywhere in your output. Treat every image strictly as a natural botanical specimen.`;

    const promptText = `Examine this leaf image carefully. Provide a rigorous, evidence-based diagnostic report adhering strictly to the JSON schema.`;

    const schemaConfig = {
      type: Type.OBJECT,
      properties: {
        isLeafOrPlant: {
          type: Type.BOOLEAN,
          description: "Whether the image contains a plant leaf or vegetation.",
        },
        isSufficient: {
          type: Type.BOOLEAN,
          description: "Whether visual clarity and detail are sufficient for diagnosis.",
        },
        insufficientReason: {
          type: Type.STRING,
          description: "Explanation if image is insufficient. Set to 'The image is not sufficient for a reliable diagnosis.' when unclear.",
        },
        plantIdentified: {
          type: Type.STRING,
          description: "Plant species name (common and botanical, or 'Unidentified Plant' if unclear).",
        },
        problem: {
          type: Type.STRING,
          description: "Specific diagnosed disease, pest, deficiency, or 'Healthy Leaf'.",
        },
        isHealthy: {
          type: Type.BOOLEAN,
          description: "True if the plant leaf appears healthy.",
        },
        diagnosisStatus: {
          type: Type.STRING,
          description: "'Healthy', 'Needs Attention', or 'Treatment Recommended'.",
        },
        confidenceLevel: {
          type: Type.STRING,
          description: "Confidence rating: 'High', 'Medium', or 'Low'.",
        },
        confidencePercentage: {
          type: Type.INTEGER,
          description: "Confidence percentage number from 40 to 98.",
        },
        severity: {
          type: Type.STRING,
          description: "Severity rating: 'Mild', 'Moderate', or 'Severe'.",
        },
        severityReason: {
          type: Type.STRING,
          description: "Brief reason explaining the severity level.",
        },
        hasOtherPossibility: {
          type: Type.BOOLEAN,
          description: "True if another condition shares similar symptoms.",
        },
        otherPossibility: {
          type: Type.OBJECT,
          properties: {
            problem: { type: Type.STRING },
            reason: { type: Type.STRING },
            additionalInfoNeeded: { type: Type.STRING },
          },
          description: "Differential diagnosis if ambiguous.",
        },
        visualObservations: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "3 to 5 specific visual observations seen in the actual image (holes, spots, margins, color, etc.).",
        },
        immediateAction: {
          type: Type.STRING,
          description: "The most important single action the user should take right now.",
        },
        treatment: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "3 to 5 practical sequential treatment steps.",
        },
        treatmentDuration: {
          type: Type.STRING,
          description: "Approximately how long the user should monitor or continue treatment (e.g. 'Monitor daily for 7–14 days').",
        },
        expectedImprovement: {
          type: Type.STRING,
          description: "Specific signs indicating that the plant is recovering.",
        },
        threeRecommendations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              actionType: { type: Type.STRING },
            },
            required: ["id", "title", "description", "actionType"],
          },
          description: "EXACTLY 3 recommended actions directly related to the detected problem.",
        },
        careTips: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              tip: { type: Type.STRING },
            },
            required: ["category", "tip"],
          },
          description: "Plant care tips covering Watering, Sunlight, Soil, Air Circulation, or General Care.",
        },
        whatToAvoid: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "EXACTLY 3 practical mistakes to avoid specifically related to the diagnosed problem.",
        },
        disclaimer: {
          type: Type.STRING,
          description: "AI diagnosis notice.",
        },
      },
      required: [
        "isLeafOrPlant",
        "isSufficient",
        "plantIdentified",
        "problem",
        "isHealthy",
        "diagnosisStatus",
        "confidenceLevel",
        "confidencePercentage",
        "severity",
        "severityReason",
        "visualObservations",
        "immediateAction",
        "treatment",
        "treatmentDuration",
        "expectedImprovement",
        "threeRecommendations",
        "careTips",
        "whatToAvoid",
        "disclaimer",
      ],
    };

    // Resilient multi-model fallback in case of high demand
    const modelsToTry = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];
    let responseText: string | undefined;
    let lastError: unknown;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: detectedMime,
                  data: cleanBase64,
                },
              },
              {
                text: promptText,
              },
            ],
          },
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: schemaConfig,
          },
        });

        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: unknown) {
        console.warn(`Model attempt ${modelName} encountered issue:`, err);
        lastError = err;
        // Brief pause before trying fallback
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }

    if (!responseText) {
      const errMsg = lastError instanceof Error ? lastError.message : "No response generated from AI models";
      throw new Error(errMsg);
    }

    // Strip any accidental occurrences of the word 'svg' from AI output
    const sanitizedText = responseText.replace(/\bsvg\b/gi, "leaf");
    const result = JSON.parse(sanitizedText);

    // Ensure status is normalized
    if (!result.diagnosisStatus) {
      if (result.isHealthy) {
        result.diagnosisStatus = "Healthy";
      } else if (result.severity?.toLowerCase() === "mild") {
        result.diagnosisStatus = "Needs Attention";
      } else {
        result.diagnosisStatus = "Treatment Recommended";
      }
    }

    if (!result.isSufficient && (!result.insufficientReason || result.insufficientReason.length < 5)) {
      result.insufficientReason = "The image is not sufficient for a reliable diagnosis.";
    }

    if (!result.treatmentDuration) {
      result.treatmentDuration = "Monitor daily for 7–14 days until symptoms stabilize.";
    }

    if (!result.expectedImprovement) {
      result.expectedImprovement = "Stoppage of spot/damage expansion, with new shoot and leaf growth developing clean and vibrant.";
    }

    res.json({ success: true, diagnosis: result });
  } catch (err: unknown) {
    console.error("Diagnosis error:", err);
    const message = err instanceof Error ? err.message : "Failed to analyze leaf image";
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

// Vite middleware / static serving
async function startServer() {
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
    console.log(`🌿 AI Plant Doctor server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
