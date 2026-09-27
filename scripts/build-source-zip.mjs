import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const releaseDir = join(rootDir, 'releaseBuilds');

const { version } = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
const stageName = `lootscout_firefox_source_v${version}`;
const stageDir = join(releaseDir, stageName);
const zipPath = join(releaseDir, `${stageName}.zip`);

const INCLUDE = ['src', 'public', 'scripts', 'package.json', 'package-lock.json', 'vite.config.ts', 'tsconfig.json', 'tsconfig.node.json', 'README.md'];

mkdirSync(releaseDir, { recursive: true });
rmSync(stageDir, { recursive: true, force: true });
rmSync(zipPath, { force: true });
mkdirSync(stageDir, { recursive: true });

for (const entry of INCLUDE) {
	cpSync(join(rootDir, entry), join(stageDir, entry), { recursive: true });
}

writeFileSync(
	join(stageDir, 'BUILD_INSTRUCTIONS.md'),
	`# LootScout Firefox Source Bundle – Build Guide (v${version})

This archive contains the exact code submitted for Mozilla review. Follow the
steps below to reproduce the Firefox build locally:

## Prerequisites
- Node.js 18+ (or the version you normally use for the project)
- npm (bundled with Node.js)

## Steps
1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
2. Build the Firefox extension:
   \`\`\`bash
   npm run build:firefox
   \`\`\`
3. This produces \`releaseBuilds/lootscout_firefox_build_v${version}.zip\`,
   the exact package submitted to AMO.

## Notes
- The \`.env\` file is not required for AMO review builds.
- \`src/manifest.json\` contains all three build variants (dev/chrome/firefox)
  tagged with \`{{browser}}.\` prefixes; \`npm run build:firefox\` selects the
  Firefox ones automatically. No manual manifest editing is needed.
`
);

console.log(`Zipping source -> releaseBuilds/${stageName}.zip`);
execFileSync('zip', ['-rq', zipPath, '.'], { cwd: stageDir, stdio: 'inherit' });
rmSync(stageDir, { recursive: true, force: true });

console.log('Done.');
