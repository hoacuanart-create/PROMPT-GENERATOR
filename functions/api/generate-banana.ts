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

    const { image, prompt, aspectRatio } = (await context.request.json()) as any;

    if (!image || !image.data || !image.mimeType) {
      return new Response(
        JSON.stringify({ error: "Reference image is missing." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const cleanBase64 = image.data.includes("base64,")
      ? image.data.split("base64,")[1]
      : image.data;

    const parts = [
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

    let responseImageBase64 = null;
    let textResponse = "";
    let lastError = null;

    const candidateModels = ["gemini-2.5-flash-image", "gemini-3.1-flash-image"];

    for (const modelName of candidateModels) {
      try {
        const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const bodyContent: any = {
          contents: [{ parts }],
          generationConfig: {
            imageConfig: {
              aspectRatio: aspectRatio || "1:1"
            }
          }
        };

        if (modelName === "gemini-3.1-flash-image") {
          bodyContent.generationConfig.imageConfig.imageSize = "1K";
        }

        const response = await fetch(apiURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "cloudflare-pages-function"
          },
          body: JSON.stringify(bodyContent)
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          if (data.candidates && data.candidates[0]?.content?.parts) {
            for (const part of data.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                responseImageBase64 = part.inlineData.data;
              } else if (part.text) {
                textResponse += part.text;
              }
            }
          }
        } else {
          lastError = await response.text();
        }
      } catch (err: any) {
        lastError = err.message || err;
      }

      if (responseImageBase64) {
        break;
      }
    }

    if (!responseImageBase64) {
      return new Response(
        JSON.stringify({ error: `No image was returned by Gemini Nano Banana models. Last error: ${lastError}` }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        imageUrl: `data:image/png;base64,${responseImageBase64}`,
        text: textResponse || "Successful Nano Banana render synthesis."
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Something went wrong in the edge environment." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
