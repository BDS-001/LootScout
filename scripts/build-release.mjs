import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(rootDir, 'dist');
const releaseDir = join(rootDir, 'releaseBuilds');

const TARGETS = ['chrome', 'firefox'];
const requested = process.argv.slice(2);
const targets = requested.length > 0 ? requested : TARGETS;

for (const target of targets) {
	if (!TARGETS.includes(target)) {
		console.error(`Unknown target "${target}". Expected one of: ${TARGETS.join(', ')}`);
		process.exit(1);
	}
}

const { version } = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));

mkdirSync(releaseDir, { recursive: true });

for (const target of targets) {
	console.log(`Building ${target}...`);
	rmSync(distDir, { recursive: true, force: true });
	execFileSync('npm', ['run', 'build'], {
		cwd: rootDir,
		stdio: 'inherit',
		env: { ...process.env, TARGET_BROWSER: target },
	});

	const zipName = `lootscout_${target}_build_v${version}.zip`;
	const zipPath = join(releaseDir, zipName);
	rmSync(zipPath, { force: true });

	console.log(`Zipping ${target} build -> releaseBuilds/${zipName}`);
	execFileSync('zip', ['-rq', zipPath, '.'], { cwd: distDir, stdio: 'inherit' });
}

console.log('Done.');
