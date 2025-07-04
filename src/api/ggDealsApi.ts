import { GameDataApiResponse } from '../shared/types';

export default async function fetchGameData(apiUrl: string): Promise<GameDataApiResponse> {
	try {
		console.log(apiUrl);
		const result = await fetch(apiUrl);
		console.log('fetch result', result);
		return result.json();
	} catch (error) {
		console.log('error', error);
		return {
			success: false,
			data: {
				name: 'Network Error',
				message: 'Error fetching data from GG Deals',
				code: 0,
				status: 0,
			},
		};
	}
}
