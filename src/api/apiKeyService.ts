import fetchGgDealsData from './ggDealsApi';
import { getStorageItem, setStorageItem } from '../services/storageService';

export interface ApiKeyTestResult {
	success: boolean;
	message: string;
}

const STORAGE_KEY = 'apiKey';
const TEST_APP_ID = '620'; // Portal 2 Steam Id
const TEST_REGION = 'us';

export const loadApiKey = async (): Promise<string> => {
	const apiKey = await getStorageItem<string>(STORAGE_KEY);
	return apiKey || '';
};

export const saveApiKey = async (apiKey: string): Promise<void> => {
	await setStorageItem(STORAGE_KEY, apiKey);
};

export const testApiKey = async (apiKey: string): Promise<ApiKeyTestResult> => {
	if (!apiKey.trim()) {
		return { success: false, message: 'Please enter an API key' };
	}

	try {
		const testResult = await fetchGgDealsData({
			appId: TEST_APP_ID,
			apiKey: apiKey.trim(),
			region: TEST_REGION,
		});

		if (testResult.success) {
			return { success: true, message: 'API key verified and saved' };
		} else {
			return { success: false, message: 'Invalid API key' };
		}
	} catch (error) {
		console.error('API key test failed:', error);
		return { success: false, message: 'Failed to verify API key' };
	}
};

export const validateAndSaveApiKey = async (apiKey: string): Promise<ApiKeyTestResult> => {
	const testResult = await testApiKey(apiKey);

	if (testResult.success) {
		await saveApiKey(apiKey.trim());
	}

	return testResult;
};
