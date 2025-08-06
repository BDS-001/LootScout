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
interface Env {
	GG_DEALS_API_KEY: string;
}

interface RequestBody {
	appId: string;
	region: string;
}

const GG_DEALS_BASE_URL = 'https://api.gg.deals/v1/prices/by-steam-app-id/';
const VALID_REGIONS = ['au', 'be', 'br', 'ca', 'ch', 'de', 'dk', 'es', 'eu', 'fi', 'fr', 'gb', 'ie', 'it', 'nl', 'no', 'pl', 'se', 'us'];

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

function validateParams(appId: string, region: string): void {
	if (!appId || !region) throw new Error('Missing required parameters');
	if (!/^\d+$/.test(appId)) throw new Error('Invalid appId format');
	if (!VALID_REGIONS.includes(region.toLowerCase())) throw new Error('Invalid region');
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
	if (request.method === 'OPTIONS') {
		return new Response(null, {
			status: 200,
			headers: getCorsHeaders(request.headers.get('origin')!),
		});
	}

	if (request.method === 'POST') {
		return await handlePostRequest(request, env);
	}

	throw new Error('Method not allowed');
}

async function handlePostRequest(request: Request, env: Env): Promise<Response> {
	const { appId, region } = (await request.json()) as RequestBody;

	const apiKey = env.GG_DEALS_API_KEY;
	if (!apiKey) {
		throw new Error('Server configuration error: Missing API key');
	}

	validateParams(appId, region);

	const data = await getApiResponse(appId, region, apiKey);

	return new Response(JSON.stringify(data), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			...getCorsHeaders(request.headers.get('origin')!),
		},
	});
}

async function getApiResponse(appId: string, region: string, apiKey: string): Promise<any> {
	const url = `${GG_DEALS_BASE_URL}?ids=${appId}&key=${apiKey}&region=${region}`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`GG Deals API error: ${response.status}`);
	}

	return response.json();
}

export default {
	async fetch(request, env, _ctx): Promise<Response> {
		const origin = request.headers.get('origin');

		if (!isExtensionOrigin(origin)) {
			throw new Error('Forbidden');
		}

		try {
			return await handleRequest(request, env);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			const status =
				message.includes('Invalid') || message.includes('Missing') || message.includes('Forbidden')
					? 400
					: message.includes('Method not allowed')
						? 405
						: message.includes('Forbidden')
							? 403
							: 500;

			return new Response(JSON.stringify({ error: message }), {
				status,
				headers: {
					'Content-Type': 'application/json',
					...getCorsHeaders(origin!),
				},
			});
		}
	},
} satisfies ExportedHandler<Env>;
