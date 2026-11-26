// Entry point for the "China in Numbers" national statistics site (Node 22, standard library only).
//
// The site itself is the app/ folder next to this file: plain static HTML, CSS and ES modules that a
// browser opens directly at app/index.html. Nothing the site shows is fetched over the network; every
// figure lives in app/data.js. This program's only job is the hand-in: copy app/ and screenshots/ into
// the output directory and write dossier.json there with the vendored make.fun library, so the scorer
// sees exactly the bytes the site was tested with. vendor/makefun-frontend.ts must stay untouched —
// the scorer compares dossier.json against what its own copy of that library produces.
//
// Run it with:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (MAKEFUN_OUTPUT_DIR stands in for /output outside the grader's container.)
// Preview the site itself with:  node serve.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy the site. Screenshots are optional at this stage: create the folder either way so the output
// layout is always app/, screenshots/, dossier.json.
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// Caps taken from the scorer's gate: at most 4 screenshots of 256 KiB each, at most 993 entries and
// 16 MiB inside app/, and text files summarised up to 160 KiB in the dossier.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
