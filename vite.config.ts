import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import webExtension, { readJsonFile } from 'vite-plugin-web-extension';

function generateManifest() {
	const manifest = readJsonFile('src/manifest.json');
	const pkg = readJsonFile('package.json');
	return {
		name: pkg.name,
		description: pkg.description,
		version: pkg.version,
		...manifest,
	};
}

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		webExtension({
			manifest: generateManifest,
			disableAutoLaunch: true,
			additionalInputs: ['src/about.html'],
		}),
	],
	test: {
		globals: true,
		environment: 'node',
	},
});
