const GG_DEALS_BASE_URL = 'https://api.gg.deals/v1/prices/by-steam-app-id/';
const VALID_REGIONS = [
	'au',
	'be',
	'br',
	'ca',
	'ch',
	'de',
	'dk',
	'es',
	'eu',
	'fi',
	'fr',
	'gb',
	'ie',
	'it',
	'nl',
	'no',
	'pl',
	'se',
	'us',
];

const isExtensionOrigin = (origin) =>
	origin?.startsWith('chrome-extension://') ||
	origin?.startsWith('moz-extension://') ||
	origin?.startsWith('safari-web-extension://');

const validateRequest = (request) => {
	if (!isExtensionOrigin(request.headers.get('origin'))) {
		throw new Error('Forbidden');
	}
	if (request.method === 'OPTIONS') return null;
	if (request.method !== 'POST') {
		throw new Error('Method not allowed');
	}
	return request;
};

const validateParams = (appId, region) => {
	if (!appId || !region) throw new Error('Missing required parameters');
	if (!/^\d+$/.test(appId)) throw new Error('Invalid appId format');
	if (!VALID_REGIONS.includes(region.toLowerCase())) throw new Error('Invalid region');
};

const getCorsHeaders = (origin) => ({
	'Access-Control-Allow-Origin': origin,
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
});

const fetchGamePrices = async (appId, region, apiKey) => {
	const url = `${GG_DEALS_BASE_URL}?ids=${appId}&key=${apiKey}&region=${region}`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`GG Deals API error: ${response.status}`);
	}

	return response.json();
};

const createErrorResponse = (error, origin) => {
	const status =
		error.message.includes('Invalid') ||
		error.message.includes('Missing') ||
		error.message.includes('Forbidden')
			? 400
			: error.message.includes('Method not allowed')
				? 405
				: error.message.includes('Forbidden')
					? 403
					: 500;

	return new Response(JSON.stringify({ error: error.message }), {
		status,
		headers: {
			'Content-Type': 'application/json',
			...getCorsHeaders(origin),
		},
	});
};

export default async function handler(request) {
	const origin = request.headers.get('origin');

	try {
		const validatedRequest = validateRequest(request);

		if (!validatedRequest) {
			return new Response(null, {
				status: 200,
				headers: getCorsHeaders(origin),
			});
		}

		const { appId, region } = await request.json();

		const apiKey = process.env.GG_DEALS_API_KEY;
		if (!apiKey) {
			throw new Error('Server configuration error: Missing API key');
		}

		validateParams(appId, region);

		const data = await fetchGamePrices(appId, region, apiKey);

		return new Response(JSON.stringify(data), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				...getCorsHeaders(origin),
			},
		});
	} catch (error) {
		return createErrorResponse(error, origin);
	}
}

export const config = {
	runtime: 'edge',
};
