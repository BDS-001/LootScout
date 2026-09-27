import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import webExtension, { readJsonFile } from 'vite-plugin-web-extension';

const browser = process.env.TARGET_BROWSER ?? 'dev';

function generateManifest() {
	const manifest = readJsonFile('src/manifest.json');
	const pkg = readJsonFile('package.json');
	return {
		name: pkg.name,
		description: pkg.description,
		...manifest,
		version: pkg.version,
	};
}

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		webExtension({
			manifest: generateManifest,
			browser,
			disableAutoLaunch: true,
			additionalInputs: ['src/pages/templates/about.html', 'src/pages/templates/settings.html'],
		}),
	],
	test: {
		globals: true,
		environment: 'node',
		exclude: ['proxies/**', 'node_modules/**'],
	},
});
