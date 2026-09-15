import { SampleLeaf } from "../types";

// High-fidelity botanical SVG leaf illustrations encoded as data URLs with distinct visual symptoms
// This allows immediate one-click testing of visual analysis even without a camera or physical plant handy.

function createLeafSvgDataUrl(svgContent: string): string {
  const fullSvg = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f4f7f4"/>
      <stop offset="100%" stop-color="#e8efe9"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="3" dy="8" stdDeviation="6" flood-opacity="0.15"/>
    </filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGlow)"/>
  ${svgContent}
</svg>`;
  const base64 = typeof btoa !== "undefined"
    ? btoa(unescape(encodeURIComponent(fullSvg)))
    : Buffer.from(fullSvg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}

// 1. Tomato Leaf with Early Blight (Target test scenario: Alternaria solani with dark concentric rings, yellow halo)
const tomatoEarlyBlightSvg = createLeafSvgDataUrl(`
  <g filter="url(#shadow)">
    <!-- Stem -->
    <path d="M 300 560 Q 302 460 300 320" stroke="#4d6e32" stroke-width="12" stroke-linecap="round" fill="none"/>
    <!-- Leaf Blade with Early Blight Yellowing and Necrotic Rings -->
    <path d="M 300 120 C 440 160 480 340 330 460 C 290 490 280 500 300 530 C 260 490 140 400 130 290 C 120 180 220 110 300 120 Z" fill="#698f3c"/>
    
    <!-- Central Main Vein & Lateral Veins -->
    <path d="M 300 500 Q 302 300 300 130" stroke="#486827" stroke-width="4" fill="none"/>
    <path d="M 300 420 Q 360 380 410 370" stroke="#486827" stroke-width="2.5" fill="none"/>
    <path d="M 300 380 Q 230 350 170 340" stroke="#486827" stroke-width="2.5" fill="none"/>
    <path d="M 300 320 Q 370 270 420 250" stroke="#486827" stroke-width="2.5" fill="none"/>
    <path d="M 300 260 Q 220 220 160 200" stroke="#486827" stroke-width="2.5" fill="none"/>
    <path d="M 300 200 Q 350 170 380 150" stroke="#486827" stroke-width="2" fill="none"/>

    <!-- Yellowing chlorotic halo areas -->
    <path d="M 230 250 Q 260 220 290 250 Q 280 290 240 280 Z" fill="#d4c944" opacity="0.85"/>
    <path d="M 340 310 Q 390 300 400 350 Q 360 390 330 350 Z" fill="#d8cd45" opacity="0.85"/>
    <path d="M 180 330 Q 220 320 220 360 Q 180 380 160 350 Z" fill="#cfbf38" opacity="0.85"/>
    <path d="M 290 410 Q 330 400 340 440 Q 300 460 280 430 Z" fill="#d2c33a" opacity="0.85"/>

    <!-- Concentric Target-Board Blight Lesions (Brown/Black Necrotic Spots) -->
    <!-- Spot 1 -->
    <circle cx="260" cy="255" r="22" fill="#523219"/>
    <circle cx="260" cy="255" r="16" fill="#382110"/>
    <circle cx="260" cy="255" r="10" fill="#5a381c"/>
    <circle cx="260" cy="255" r="5" fill="#24140a"/>

    <!-- Spot 2 -->
    <ellipse cx="365" cy="340" rx="26" ry="20" fill="#4d2f16"/>
    <ellipse cx="365" cy="340" rx="18" ry="14" fill="#331e0c"/>
    <ellipse cx="365" cy="340" rx="11" ry="8" fill="#563519"/>
    <circle cx="365" cy="340" r="4" fill="#1f1207"/>

    <!-- Spot 3 -->
    <circle cx="190" cy="345" r="18" fill="#4a2e16"/>
    <circle cx="190" cy="345" r="12" fill="#2e1a0b"/>
    <circle cx="190" cy="345" r="6" fill="#180e06"/>

    <!-- Margin dieback / brown crisp edge -->
    <path d="M 130 290 Q 120 240 145 200 C 138 230 145 270 140 295 Z" fill="#4e2c14"/>
    <path d="M 460 300 Q 480 340 420 380 Q 450 340 450 310 Z" fill="#523116"/>
  </g>
`);

// 2. Squash / Cucumber Leaf with Powdery Mildew (White powdery talcum-powder coating, yellowing)
const powderyMildewSvg = createLeafSvgDataUrl(`
  <g filter="url(#shadow)">
    <!-- Stem -->
    <path d="M 300 550 Q 295 450 300 350" stroke="#5d7b3a" stroke-width="14" stroke-linecap="round" fill="none"/>
    <!-- Broad Lobed Cucurbit Leaf -->
    <path d="M 300 130 C 370 110 490 190 480 290 C 470 370 410 430 350 450 C 320 460 310 480 300 520 C 290 480 260 460 230 440 C 160 410 110 340 120 250 C 130 170 230 110 300 130 Z" fill="#58853b"/>
    
    <!-- Veins radiating from palmate base -->
    <path d="M 300 350 L 300 140" stroke="#77a552" stroke-width="4"/>
    <path d="M 300 350 L 440 220" stroke="#77a552" stroke-width="3.5"/>
    <path d="M 300 350 L 440 330" stroke="#77a552" stroke-width="3"/>
    <path d="M 300 350 L 160 210" stroke="#77a552" stroke-width="3.5"/>
    <path d="M 300 350 L 150 320" stroke="#77a552" stroke-width="3"/>

    <!-- Chlorotic pale patches -->
    <circle cx="240" cy="240" r="60" fill="#a4bd56" opacity="0.6"/>
    <circle cx="370" cy="260" r="70" fill="#9db74f" opacity="0.6"/>
    <circle cx="310" cy="360" r="50" fill="#a8be5d" opacity="0.5"/>

    <!-- Powdery White / Grayish Fungal Patches (Erysiphe / Podosphaera) -->
    <ellipse cx="235" cy="235" rx="45" ry="38" fill="#f0f4ea" opacity="0.88"/>
    <ellipse cx="365" cy="250" rx="55" ry="48" fill="#edf3e6" opacity="0.9"/>
    <ellipse cx="300" cy="350" rx="40" ry="35" fill="#f4f7ee" opacity="0.85"/>
    <circle cx="180" cy="300" r="28" fill="#edf2e6" opacity="0.82"/>
    <circle cx="420" cy="330" r="32" fill="#eef3e8" opacity="0.85"/>
    <circle cx="310" cy="180" r="25" fill="#f1f5eb" opacity="0.8"/>
  </g>
`);

// 3. Monstera Deliciosa (Healthy, Glossy Green Leaf with Natural Fenestrations)
const healthyMonsteraSvg = createLeafSvgDataUrl(`
  <g filter="url(#shadow)">
    <!-- Thick Healthy Petiole -->
    <path d="M 300 570 Q 302 460 300 320" stroke="#25622b" stroke-width="14" stroke-linecap="round" fill="none"/>
    <!-- Deep Glossy Vibrant Heart Leaf -->
    <path d="M 300 90 C 450 110 500 280 430 420 C 370 490 320 500 300 530 C 280 500 230 490 170 420 C 100 280 150 110 300 90 Z" fill="#2d6e35"/>
    
    <!-- Prominent Midrib & Lateral Veins -->
    <path d="M 300 520 Q 301 300 300 100" stroke="#488c4f" stroke-width="6" fill="none"/>
    <path d="M 300 420 Q 370 380 420 370" stroke="#3d8144" stroke-width="3" fill="none"/>
    <path d="M 300 360 Q 210 320 160 310" stroke="#3d8144" stroke-width="3" fill="none"/>
    <path d="M 300 300 Q 390 250 440 230" stroke="#3d8144" stroke-width="3" fill="none"/>
    <path d="M 300 230 Q 200 180 170 160" stroke="#3d8144" stroke-width="3" fill="none"/>
    <path d="M 300 160 Q 370 120 400 105" stroke="#3d8144" stroke-width="2.5" fill="none"/>

    <!-- Healthy Natural Fenestrations (Slits / Holes) -->
    <ellipse cx="230" cy="240" rx="14" ry="40" transform="rotate(-30 230 240)" fill="#f4f7f4"/>
    <ellipse cx="370" cy="250" rx="15" ry="45" transform="rotate(35 370 250)" fill="#f4f7f4"/>
    <ellipse cx="220" cy="340" rx="12" ry="32" transform="rotate(-40 220 340)" fill="#f4f7f4"/>
    <ellipse cx="380" cy="350" rx="14" ry="35" transform="rotate(45 380 350)" fill="#f4f7f4"/>

    <!-- Glossy Leaf Highlight / Waxy Sheen -->
    <path d="M 285 140 Q 240 200 270 320 Q 290 220 292 145 Z" fill="#ffffff" opacity="0.18"/>
  </g>
`);

// 4. Citrus Leaf with Iron Deficiency Chlorosis (Vivid yellow blade with stark green veins)
const ironChlorosisSvg = createLeafSvgDataUrl(`
  <g filter="url(#shadow)">
    <!-- Stem -->
    <path d="M 300 550 Q 301 450 300 350" stroke="#486629" stroke-width="10" stroke-linecap="round" fill="none"/>
    <!-- Citrus Leaf Blade (Severe Interveinal Yellowing) -->
    <path d="M 300 110 C 420 180 450 360 340 470 C 315 495 305 505 300 520 C 295 505 285 495 260 470 C 150 360 180 180 300 110 Z" fill="#e0d64a"/>
    
    <!-- Distinctive Dark Green Vein Network against Pale Yellow Blade -->
    <path d="M 300 510 L 300 120" stroke="#3f722a" stroke-width="5"/>
    <!-- Lateral and sub-lateral green veins -->
    <path d="M 300 450 Q 350 420 380 400" stroke="#487e31" stroke-width="3" fill="none"/>
    <path d="M 300 410 Q 240 370 205 350" stroke="#487e31" stroke-width="3" fill="none"/>
    <path d="M 300 360 Q 370 320 405 290" stroke="#487e31" stroke-width="3" fill="none"/>
    <path d="M 300 310 Q 220 260 185 240" stroke="#487e31" stroke-width="3" fill="none"/>
    <path d="M 300 250 Q 360 210 390 180" stroke="#487e31" stroke-width="3" fill="none"/>
    <path d="M 300 190 Q 230 160 210 130" stroke="#487e31" stroke-width="2.5" fill="none"/>

    <!-- Fine reticulate green veinlets -->
    <path d="M 250 300 Q 265 280 280 300" stroke="#4f8534" stroke-width="1.8" fill="none"/>
    <path d="M 320 300 Q 340 280 355 295" stroke="#4f8534" stroke-width="1.8" fill="none"/>
    <path d="M 230 380 Q 250 360 270 375" stroke="#4f8534" stroke-width="1.8" fill="none"/>
    <path d="M 330 380 Q 350 360 370 375" stroke="#4f8534" stroke-width="1.8" fill="none"/>
  </g>
`);

export const SAMPLE_LEAVES: SampleLeaf[] = [
  {
    id: "tomato-early-blight",
    name: "Tomato Leaf",
    plant: "Tomato (Solanum lycopersicum)",
    condition: "Early Blight",
    description: "Target-shaped brown necrotic lesions with chlorotic yellow halos on older foliage.",
    imageUrl: tomatoEarlyBlightSvg,
  },
  {
    id: "powdery-mildew-squash",
    name: "Squash Leaf",
    plant: "Squash / Zucchini (Cucurbita pepo)",
    condition: "Powdery Mildew",
    description: "Superficial white powdery fungal patches spreading across upper leaf blade.",
    imageUrl: powderyMildewSvg,
  },
  {
    id: "monstera-healthy",
    name: "Monstera Leaf",
    plant: "Swiss Cheese Plant (Monstera deliciosa)",
    condition: "Healthy Leaf",
    description: "Lush, glossy deep emerald foliage with clean natural fenestrations and firm turgor.",
    imageUrl: healthyMonsteraSvg,
  },
  {
    id: "citrus-iron-chlorosis",
    name: "Lemon / Citrus Leaf",
    plant: "Lemon (Citrus limon)",
    condition: "Iron Chlorosis",
    description: "Severe interveinal yellowing with striking dark green main and secondary veins.",
    imageUrl: ironChlorosisSvg,
  },
];
