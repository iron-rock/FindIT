import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../assets/ai-tools');

/** Порядок = популярность среди разработчиков (слева направо, сверху вниз). */
/** @type {{ id: string; url?: string; file?: string }[]} */
const TOOLS = [
  { id: 'githubCopilot', url: 'https://cdn.simpleicons.org/githubcopilot/ffffff' },
  { id: 'cursor', url: 'https://cdn.simpleicons.org/cursor/ffffff' },
  { id: 'claude', url: 'https://cdn.simpleicons.org/anthropic/ffffff' },
  { id: 'codex', file: 'codex.svg' },
  { id: 'windsurf', url: 'https://cdn.simpleicons.org/windsurf/ffffff' },
  { id: 'gemini', url: 'https://cdn.simpleicons.org/googlegemini/ffffff' },
  {
    id: 'microsoftCopilot',
    url: 'https://cdn.jsdelivr.net/gh/callback-io/allogo@main/public/logos/microsoft-copilot/icon.svg',
  },
  { id: 'jetbrainsAi', url: 'https://cdn.simpleicons.org/jetbrains/ffffff' },
  {
    id: 'antigravity',
    url: 'https://cdn.jsdelivr.net/gh/lobehub/lobe-icons@latest/packages/static-svg/icons/antigravity.svg',
  },
  { id: 'replit', url: 'https://cdn.simpleicons.org/replit/ffffff' },
  {
    id: 'amazonQ',
    url: 'https://cdn.jsdelivr.net/npm/simple-icons@14.0.0/icons/amazonwebservices.svg',
  },
  {
    id: 'chatgpt',
    url: 'https://cdn.jsdelivr.net/npm/simple-icons@14/icons/openai.svg',
  },
];

function normalizeSvgToWhite(svg) {
  return svg
    .replace(/fill="url\(#.*?\)"/g, 'fill="#FFFFFF"')
    .replace(/fill='url\(#.*?\)'/g, "fill='#FFFFFF'")
    .replace(/fill="[^"]*"/g, 'fill="#FFFFFF"')
    .replace(/fill='[^']*'/g, "fill='#FFFFFF'")
    .replace(/stroke="[^"]*"/g, 'stroke="#FFFFFF"')
    .replace(/stop-color="[^"]*"/g, 'stop-color="#FFFFFF"')
    .replace(/<style>[\s\S]*?<\/style>/g, '')
    .replace(/<defs>[\s\S]*?<\/defs>/g, '')
    .replace(/<path(?![^>]*fill=)/g, '<path fill="#FFFFFF"')
    .replace(/<circle(?![^>]*fill=)/g, '<circle fill="#FFFFFF"')
    .replace(/<rect(?![^>]*fill=)/g, '<rect fill="#FFFFFF"');
}

/** Любой непрозрачный пиксель → белый (фикс чёрных OpenAI / AWS SVG). */
async function rasterizeWhiteIcon(svgBuffer, outPath) {
  const { data, info } = await sharp(svgBuffer, { density: 320 })
    .resize(128, 128, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] > 20) {
      pixels[i] = 255;
      pixels[i + 1] = 255;
      pixels[i + 2] = 255;
    }
  }

  await sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .webp({ quality: 95 })
    .toFile(outPath);
}

async function download(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function convertTool({ id, url, file }) {
  const raw = file
    ? fs.readFileSync(path.join(outDir, file))
    : await download(url);
  const svg = Buffer.from(normalizeSvgToWhite(raw.toString('utf8')), 'utf8');
  const outPath = path.join(outDir, `${id}.webp`);
  await rasterizeWhiteIcon(svg, outPath);
  console.log(`OK ${id}.webp`);
}

fs.mkdirSync(outDir, { recursive: true });

for (const tool of TOOLS) {
  await convertTool(tool);
}
