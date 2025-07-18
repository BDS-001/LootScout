import { RegionInfo, RegionCode } from '../shared/types';

export const DEFAULT_REGION: RegionCode = 'us';

export const languageOverrides: Record<string, RegionCode> = {
	en: 'us',
	pt: 'br',
	da: 'dk',
	sv: 'se',
};

const regionMap: Record<RegionCode, RegionInfo> = {
	au: { name: 'Australia', currency: 'AUD', symbol: 'A$' },
	be: { name: 'Belgium', currency: 'EUR', symbol: '€' },
	br: { name: 'Brazil', currency: 'BRL', symbol: 'R$' },
	ca: { name: 'Canada', currency: 'CAD', symbol: 'CA$' },
	ch: { name: 'Switzerland', currency: 'CHF', symbol: 'CHF' },
	de: { name: 'Germany', currency: 'EUR', symbol: '€' },
	dk: { name: 'Denmark', currency: 'DKK', symbol: 'kr' },
	es: { name: 'Spain', currency: 'EUR', symbol: '€' },
	eu: { name: 'European Union', currency: 'EUR', symbol: '€' },
	fi: { name: 'Finland', currency: 'EUR', symbol: '€' },
	fr: { name: 'France', currency: 'EUR', symbol: '€' },
	gb: { name: 'United Kingdom', currency: 'GBP', symbol: '£' },
	ie: { name: 'Ireland', currency: 'EUR', symbol: '€' },
	it: { name: 'Italy', currency: 'EUR', symbol: '€' },
	nl: { name: 'Netherlands', currency: 'EUR', symbol: '€' },
	no: { name: 'Norway', currency: 'NOK', symbol: 'kr' },
	pl: { name: 'Poland', currency: 'PLN', symbol: 'zł' },
	se: { name: 'Sweden', currency: 'SEK', symbol: 'kr' },
	us: { name: 'United States', currency: 'USD', symbol: '$' },
};

export default regionMap;
