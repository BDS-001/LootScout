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

const setCorsHeaders = (res, origin) => {
	res.setHeader('Access-Control-Allow-Origin', origin);
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const validateParams = (appId, apiKey, region) => {
	if (!appId || !apiKey || !region) throw new Error('Missing required parameters');
	if (!/^\d+$/.test(appId)) throw new Error('Invalid appId format');
	if (!VALID_REGIONS.includes(region.toLowerCase())) throw new Error('Invalid region');
};

export default async function handler(req, res) {
	const origin = req.headers.origin;

	if (!isExtensionOrigin(origin)) {
		return res.status(403).json({ error: 'Forbidden' });
	}

	setCorsHeaders(res, origin);

	if (req.method === 'OPTIONS') return res.status(200).end();
	if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

	try {
		const { appId, apiKey, region } = req.body;
		const effectiveApiKey = apiKey || process.env.GG_DEALS_API_KEY;

		validateParams(appId, effectiveApiKey, region);

		const url = `${GG_DEALS_BASE_URL}?ids=${appId}&key=${effectiveApiKey}&region=${region}`;
		const response = await fetch(url);

		if (!response.ok) throw new Error(`GG Deals API error: ${response.status}`);

		return res.status(200).json(await response.json());
	} catch (error) {
		const status =
			error.message.includes('Invalid') || error.message.includes('Missing') ? 400 : 500;
		return res.status(status).json({ error: error.message });
	}
}
