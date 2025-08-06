/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

function getCorsHeaders(origin: string): Record<string, string> {
	return {
		'Access-Control-Allow-Origin': origin,
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
	};
}

function isExtensionOrigin(origin: string | null): boolean {
	return !!(
		origin?.startsWith('chrome-extension://') ||
		origin?.startsWith('moz-extension://') ||
		origin?.startsWith('safari-web-extension://')
	);
}

function validateRequest(request: Request): Boolean {
	if (!isExtensionOrigin(request.headers.get('origin'))) throw new Error('Forbidden');
	if (request.method === 'OPTIONS') return false;
	if (request.method !== 'POST') throw new Error('Method not allowed');
	return true;
}

export default {
	async fetch(request, _env, _ctx): Promise<Response> {
		const origin = request.headers.get('origin');
		try {
			const validRequest = validateRequest(request);
			if (!validRequest) {
				return new Response(null, {
					status: 204,
					headers: getCorsHeaders(origin!),
				});
			}
		} catch (error) {}
		return new Response('Hello World!');
	},
} satisfies ExportedHandler<Env>;
