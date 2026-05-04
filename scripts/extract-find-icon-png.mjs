import fs from 'node:fs';

const svgPath = new URL('../assets/Find_icon.svg', import.meta.url);
const outPath = new URL('../assets/Find_icon.png', import.meta.url);

const s = fs.readFileSync(svgPath, 'utf8');
const m = s.match(/xlink:href="data:image\/png;base64,([^"]+)"/);
if (!m) {
  console.error('No embedded PNG found in SVG');
  process.exit(1);
}
const buf = Buffer.from(m[1], 'base64');
fs.writeFileSync(outPath, buf);
console.log('Wrote', outPath.pathname, 'bytes', buf.length);
