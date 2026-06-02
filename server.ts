import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increased limit for transferring multiple high-res reference images encoded as base64
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API health route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Main Prompt Generation API
  app.post("/api/generate-prompt", async (req, res) => {
    try {
      const { images, options } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is missing. Please add it via the Settings > Secrets panel on the top right."
        });
      }

      // Instantiate local GoogleGenAI client (Recommended full-stack approach)
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Construct customized prompt rules
      let instruction = "You are a professional sculptor and high-end 3D character artist concept designer. " +
        "Your task is to analyze the uploaded image(s) and synthesize a highly detailed, professional descriptive prompt " +
        "suitable for image generators (such as Midjourney, Imagen, or Stable Diffusion) and 3D modeling guidance. " +
        "Explain the anatomy, pose, visual cues, and features accurately.";

      if (options) {
        const {
          materials, // array of strings (e.g. ['ZBRUSH MATERIAL'])
          color, // string (e.g. 'GREY SCALE COLOR')
          lighting, // string (e.g. 'SOFT LIGHTING')
          view, // string (e.g. 'FRONT')
          anatomy, // array of strings (e.g. ['HEAD'])
          removeAccessoriesClothing, // boolean
          backgroundColor, // string (e.g. 'WHITE')
          forcePose, // string (e.g. 'NONE', 'A_POSE', 'T_POSE')
          customInstruction // string
        } = options;

        instruction += "\n\nCRITICAL SPECIFICATIONS AND CONSTRAINTS TO INTEGRATE INTO THE PROMPT:";

        if (materials && materials.length > 0) {
          instruction += `\n- Material details: Enforce these materials strictly: ${materials.join(", ")}. Reference physical characteristics such as clay texture, matcap surface reflections, polished silicone, or clay tooling marks.`;
        }
        if (color) {
          instruction += `\n- Color palette choice: Specially style as ${color}.`;
        }
        if (lighting) {
          instruction += `\n- Lighting arrangement: Configure as ${lighting}, highlighting anatomical volumes, contours, and delicate shadows.`;
        }
        if (view) {
          instruction += `\n- Viewport angle / camera: Render/visualize specifically from a ${view}.`;
        }
        if (forcePose && forcePose !== "NONE") {
          const poseDesc = forcePose === "A_POSE"
            ? "Enforce a strict anatomical character A-pose (arms rotated downwards symmetrically at 45 degrees, fingers spread natural and neutral, straight standing spine, symmetrical alignment) designed for flawless rigging."
            : "Enforce a strict character T-pose (arms stretched fully horizontal and parallel to the ground, fingers extended neutrally, straight vertical posture, symmetrically balanced alignment) ideal for rigid character setup and game engines.";
          instruction += `\n- Forced Character Posture: ${poseDesc}`;
        }
        if (anatomy && anatomy.length > 0) {
          instruction += `\n- Key anatomical focus areas: Emphasize highly precise anatomy description for ${anatomy.join(", ")}. Describe proportions, musculature, flow lines, and structural landmarks.`;
        }
        if (removeAccessoriesClothing) {
          instruction += `\n- Sculpt / Accessory Removal Constraint: Strictly strip away and remove any superficial clothing, armor, drapery, or mechanized sci-fi accessory from the character. Reveal the raw anatomical model underneath as a pure ecorche or raw clay sculpt study focusing on body proportions and organic forms.`;
        }
        if (backgroundColor) {
          instruction += `\n- Background layout: Ensure the background setting is a plain, flat, clean ${backgroundColor} background.`;
        }
        if (customInstruction && customInstruction.trim()) {
          instruction += `\n- Additional user directives: ${customInstruction}`;
        }
      }

      // Prepare contents
      const parts: any[] = [];

      // Add image components
      if (images && Array.isArray(images) && images.length > 0) {
        for (const img of images) {
          if (img.data && img.mimeType) {
            // strip clean base64 data prefix if present
            const cleanBase64 = img.data.includes("base64,")
              ? img.data.split("base64,")[1]
              : img.data;

            parts.push({
              inlineData: {
                data: cleanBase64,
                mimeType: img.mimeType,
              }
            });
          }
        }
      }

      // Add instructions part
      parts.push({ text: instruction });

      // Generate precise structured output using Gemini 3.5 Flash, with automatic fallback to gemini-3.1-flash-lite in case of rate limits or service load
      let response;
      try {
        console.log("Attempting prompt generation with gemini-3.5-flash...");
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: { parts },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                prompt: {
                  type: Type.STRING,
                  description: "The complete descriptive prompt optimized for AI image generation, fully combining the specified styling selections, artistic materials, lighting, background, anatomy, and forms present in the reference images.",
                },
                analysis: {
                  type: Type.STRING,
                  description: "An elegant, descriptive analysis detailing the physical forms, anatomy, volumetric flow, and style detected in the reference images.",
                },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "A list of relevant tags or keywords highlighting the style, 3D render properties, views, and materials.",
                }
              },
              required: ["prompt", "analysis", "tags"],
            }
          }
        });
      } catch (primaryErr: any) {
        console.warn("Primary gemini-3.5-flash model offline or rate-limited. Falling back immediately to gemini-3.1-flash-lite as safe reserve...", primaryErr);
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: { parts },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                prompt: {
                  type: Type.STRING,
                  description: "The complete descriptive prompt optimized for AI image generation, fully combining the specified styling selections, artistic materials, lighting, background, anatomy, and forms present in the reference images.",
                },
                analysis: {
                  type: Type.STRING,
                  description: "An elegant, descriptive analysis detailing the physical forms, anatomy, volumetric flow, and style detected in the reference images.",
                },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "A list of relevant tags or keywords highlighting the style, 3D render properties, views, and materials.",
                }
              },
              required: ["prompt", "analysis", "tags"],
            }
          }
        });
      }

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No output text received from Gemini server.");
      }

      let parsedJSON;
      try {
        parsedJSON = JSON.parse(responseText.trim());
      } catch (jsonErr) {
        console.error("Fuzzy parsing fallback for response:", responseText);
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedJSON = JSON.parse(jsonMatch[0].trim());
        } else {
          throw new Error("Failed to parse Gemini output as clean structured JSON format.");
        }
      }
      res.json(parsedJSON);

    } catch (err: any) {
      console.error("Gemini pipeline error:", err);
      res.status(500).json({ error: err.message || "Something went wrong during prompt generation." });
    }
  });

  // Nano Banana Image-to-Image Generation Endpoint
  app.post("/api/generate-banana", async (req, res) => {
    try {
      const { image, prompt, aspectRatio } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is missing. Please add it via the Settings > Secrets panel on the top right."
        });
      }

      if (!image || !image.data || !image.mimeType) {
        return res.status(400).json({ error: "Reference image is missing." });
      }

      // Instantiate local GoogleGenAI client (Recommended full-stack approach)
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const cleanBase64 = image.data.includes("base64,")
        ? image.data.split("base64,")[1]
        : image.data;

      const parts: any[] = [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: image.mimeType,
          }
        },
        {
          text: prompt || "Synthesize an exquisite Orange Clay sculpture recreation of this reference form. It should look like a beautifully hand-carved miniature studio clay sculpture on a solid flat neutral background, featuring smooth physical finger indentation marks and precise ecorche anatomy volume."
        }
      ];

      console.log("Attempting image generation with gemini-2.5-flash-image (Nano Banana)...");

      let responseImageBase64 = null;
      let textResponse = "";

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio || "1:1",
            }
          }
        });

        if (response && response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              responseImageBase64 = part.inlineData.data;
            } else if (part.text) {
              textResponse += part.text;
            }
          }
        }
      } catch (primaryErr: any) {
        console.warn("Primary gemini-2.5-flash-image model offline or rate-limited. Trying gemini-3.1-flash-image...", primaryErr);
      }

      if (!responseImageBase64) {
        console.log("No image data found or primary model was rate-limited. Running fallback with gemini-3.1-flash-image (Nano Banana 2)...");
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image',
          contents: { parts },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio || "1:1",
              imageSize: "1K"
            }
          }
        });

        if (fallbackResponse && fallbackResponse.candidates && fallbackResponse.candidates[0] && fallbackResponse.candidates[0].content && fallbackResponse.candidates[0].content.parts) {
          for (const part of fallbackResponse.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              responseImageBase64 = part.inlineData.data;
            } else if (part.text) {
              textResponse += part.text;
            }
          }
        }
      }

      if (!responseImageBase64) {
        throw new Error("No image was returned by Gemini Nano Banana models. Try adding more description or simplified reference shapes.");
      }

      res.json({
        imageUrl: `data:image/png;base64,${responseImageBase64}`,
        text: textResponse || "Successful Nano Banana render synthesis."
      });

    } catch (err: any) {
      console.error("Banana generation error:", err);
      res.status(500).json({ error: err.message || "Something went wrong during Nano Banana sculpting." });
    }
  });

  // Vite middleware setup for Development vs Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULLSTACK] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
