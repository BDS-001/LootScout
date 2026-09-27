import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const { version } = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));

const templatesDir = join(rootDir, 'manifest-templates');
const files = readdirSync(templatesDir).filter((f) => f.endsWith('.json'));

for (const file of files) {
	const filePath = join(templatesDir, file);
	const contents = readFileSync(filePath, 'utf8');
	const updated = contents.replace(/("version"\s*:\s*)"[^"]*"/, `$1"${version}"`);
	if (updated !== contents) {
		writeFileSync(filePath, updated);
		console.log(`Synced ${file} -> ${version}`);
	}
}
