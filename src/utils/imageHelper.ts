/**
 * Prepares and normalizes images for Gemini Vision analysis.
 * Scales down high-resolution smartphone photos (e.g. 48MP) to an optimal 1280px max dimension,
 * rasterizes SVGs onto an offscreen canvas, and outputs a clean JPEG base64 payload.
 */
export async function normalizeImageForAnalysis(
  sourceUrl: string
): Promise<{ dataUrl: string; base64: string; mimeType: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const maxDim = 1280;
      let width = img.naturalWidth || 600;
      let height = img.naturalHeight || 600;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        const clean = sourceUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
        return resolve({
          dataUrl: sourceUrl,
          base64: clean,
          mimeType: "image/jpeg",
        });
      }

      // White background for transparent PNG/SVGs
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.92);
      const cleanBase64 = jpegDataUrl.replace(/^data:image\/jpeg;base64,/, "");

      resolve({
        dataUrl: jpegDataUrl,
        base64: cleanBase64,
        mimeType: "image/jpeg",
      });
    };

    img.onerror = () => {
      const clean = sourceUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
      resolve({
        dataUrl: sourceUrl,
        base64: clean,
        mimeType: "image/jpeg",
      });
    };

    img.src = sourceUrl;
  });
}
