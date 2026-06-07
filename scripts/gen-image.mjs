// One-off Nano Banana (Gemini image) generator for design assets.
// Usage: GEMINI_API_KEY=... node scripts/gen-image.mjs <model> <outfile> <aspect> "<prompt>"
import { writeFileSync } from "node:fs";

const KEY = process.env.GEMINI_API_KEY;
const [model, outfile, aspect, prompt] = process.argv.slice(2);
if (!KEY || !model || !outfile || !prompt) {
  console.error("missing args/key");
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;

async function call(withImageConfig) {
  const generationConfig = { responseModalities: ["IMAGE"] };
  if (withImageConfig && aspect) generationConfig.imageConfig = { aspectRatio: aspect };
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig }),
  });
  return res;
}

let res = await call(true);
if (res.status === 400) {
  // retry without imageConfig in case the field is unsupported for this model
  const txt = await res.text();
  console.error("400 with imageConfig, retrying without. detail:", txt.slice(0, 200));
  res = await call(false);
}
if (!res.ok) {
  console.error("HTTP", res.status, (await res.text()).slice(0, 600));
  process.exit(1);
}
const json = await res.json();
const parts = json?.candidates?.[0]?.content?.parts ?? [];
const img = parts.find((p) => p.inlineData?.data);
if (!img) {
  console.error("No image in response:", JSON.stringify(json).slice(0, 800));
  process.exit(1);
}
const buf = Buffer.from(img.inlineData.data, "base64");
writeFileSync(outfile, buf);
console.log(`wrote ${outfile} (${img.inlineData.mimeType}, ${buf.length} bytes)`);
