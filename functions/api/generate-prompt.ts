export const onRequestPost: PagesFunction<{ GEMINI_API_KEY?: string }> = async (context) => {
  try {
    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: "GEMINI_API_KEY is missing. Please configure it in your Cloudflare Pages dashboard under Settings > Environment variables." 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { images, options } = (await context.request.json()) as any;

    let instruction = "You are a professional sculptor and high-end 3D character artist concept designer. " +
      "Your task is to analyze the uploaded image(s) and synthesize a highly detailed, professional descriptive prompt " +
      "suitable for image generators (such as Midjourney, Imagen, or Stable Diffusion) and 3D modeling guidance. " +
      "Explain the anatomy, pose, visual cues, and features accurately.\n\n" +
      "STRICT HUMANOID HAND ANATOMY RULE: If the reference image features a humanoid, human-like, or bipedal character/anatomy, you MUST strictly enforce that both hands have exactly 5 fingers (five fingers per hand, including the thumb). In your generated prompt, explicitly state that each hand has exactly 5 clearly defined, fully formed, well-proportioned fingers (no more, no less) with no extra or merged digits to prevent AI hallucinations of extra fingers.";

    if (options) {
      const {
        materials,
        color,
        lighting,
        view,
        anatomy,
        removeAccessoriesClothing,
        backgroundColor,
        forcePose,
        customInstruction
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
          ? "Enforce a strict anatomical character A-pose (arms rotated downwards symmetrically at 45 degrees, fingers spread natural and neutral with exactly 5 fingers per hand, straight standing spine, symmetrical alignment) designed for flawless rigging."
          : "Enforce a strict character T-pose (arms stretched fully horizontal and parallel to the ground, fingers extended neutrally with exactly 5 fingers per hand, straight vertical posture, symmetrically balanced alignment) ideal for rigid character setup and game engines.";
        instruction += `\n- Forced Character Posture: ${poseDesc}`;
      }
      if (anatomy && anatomy.length > 0) {
        instruction += `\n- Key anatomical focus areas: Emphasize highly precise anatomy description for ${anatomy.join(", ")}. Describe proportions, musculature, flow lines, and structural landmarks.`;
        if (anatomy.some((a: string) => a.toUpperCase().includes("HAND") || a.toUpperCase().includes("FINGER"))) {
          instruction += " Pay extreme attention to the hands and fingers. Ensure each hand is described as having exactly 5 distinct, well-proportioned fingered digits (including the thumb), completely free of nesting, duplication, or webbing.";
        }
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

    const parts: any[] = [];

    // Add image components
    if (images && Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        if (img.data && img.mimeType) {
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

    // Add instruction text
    parts.push({ text: instruction });

    const candidateModels = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    let lastError = null;
    let responseText = "";

    for (const modelName of candidateModels) {
      let attempts = 2;
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          const response = await fetch(apiURL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "cloudflare-pages-function"
            },
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: "object",
                  properties: {
                    prompt: {
                      type: "string",
                      description: "The complete descriptive prompt optimized for AI image generation, fully combining the specified styling selections, artistic materials, lighting, background, anatomy, and forms present in the reference images."
                    },
                    analysis: {
                      type: "string",
                      description: "An elegant, descriptive analysis detailing the physical forms, anatomy, volumetric flow, and style detected in the reference images."
                    },
                    tags: {
                      type: "array",
                      items: { type: "string" },
                      description: "A list of relevant tags or keywords highlighting the style, 3D render properties, views, and materials."
                    }
                  },
                  required: ["prompt", "analysis", "tags"]
                }
              }
            })
          });

          if (response.ok) {
            const data = (await response.json()) as any;
            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
              responseText = data.candidates[0].content.parts[0].text;
              break;
            }
          } else {
            const errorText = await response.text();
            lastError = `Status ${response.status}: ${errorText}`;
          }
        } catch (err: any) {
          lastError = err.message || err;
        }

        if (responseText) break;
        if (attempt < attempts) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 500));
        }
      }
      if (responseText) break;
    }

    if (!responseText) {
      return new Response(
        JSON.stringify({ error: `All models failed during prompt generation. Last error details: ${lastError}` }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    let parsedJSON;
    try {
      parsedJSON = JSON.parse(responseText.trim());
    } catch (jsonErr) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedJSON = JSON.parse(jsonMatch[0].trim());
      } else {
        throw new Error("Failed to parse Gemini response as standard structured JSON.");
      }
    }

    return new Response(JSON.stringify(parsedJSON), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Something went wrong in the edge environment." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
