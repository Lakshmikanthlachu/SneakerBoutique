// Copies the deployable site (HTML + assets) into ./public for static hosts such as Vercel/Netlify.
// Cross-platform (Windows/macOS/Linux), no dependencies. Run via: npm run build
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const out = join(root, 'public');
if (existsSync(out)) rmSync(out, { recursive: true, force: true });
mkdirSync(out);

const pages = readdirSync(root).filter((f) => f.endsWith('.html'));
for (const f of pages) cpSync(join(root, f), join(out, f));
cpSync(join(root, 'assets'), join(out, 'assets'), { recursive: true });

console.log(`public/ ready: ${pages.length} pages + assets`);
