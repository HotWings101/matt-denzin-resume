// Generates the social-share (OG) card: the Alamo-dusk hero image with the
// brand headline composited on top in Fraunces. Run: node scripts/gen-og.mjs
import sharp from "sharp";

const W = 1200;
const H = 630;
const base = "public/hero/hero-banner.jpg";
const out = "public/og.jpg";

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="v" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="rgb(20,18,14)" stop-opacity="0.92"/>
      <stop offset="0.5" stop-color="rgb(20,18,14)" stop-opacity="0.5"/>
      <stop offset="1" stop-color="rgb(20,18,14)" stop-opacity="0.18"/>
    </linearGradient>
    <linearGradient id="h" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="rgb(20,18,14)" stop-opacity="0.62"/>
      <stop offset="0.62" stop-color="rgb(20,18,14)" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#v)"/>
  <rect width="${W}" height="${H}" fill="url(#h)"/>

  <!-- kicker -->
  <circle cx="68" cy="73" r="5" fill="#4f46e5"/>
  <text x="84" y="80" font-family="DejaVu Sans Mono" font-size="21" letter-spacing="3" fill="#ffffff" fill-opacity="0.82">MATTHEW DENZIN &#183; PMP</text>

  <!-- headline -->
  <text x="62" y="436" font-family="Fraunces" font-weight="600" font-size="88" letter-spacing="-2" fill="#ffffff">The proven leader</text>
  <text x="62" y="524" font-family="Fraunces" font-weight="600" font-size="88" letter-spacing="-2" fill="#ffffff">your future needs.</text>

  <!-- domain -->
  <text x="64" y="576" font-family="DejaVu Sans Mono" font-size="24" letter-spacing="2" fill="#ffffff" fill-opacity="0.85">matthewdenzin.ai</text>
</svg>`;

const baseBuf = await sharp(base)
  .resize(W, H, { fit: "cover", position: "centre" })
  .toBuffer();

await sharp(baseBuf)
  .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(out);

const meta = await sharp(out).metadata();
console.log(`wrote ${out} ${meta.width}x${meta.height} ${Math.round((await sharp(out).toBuffer()).length / 1024)}KB`);
