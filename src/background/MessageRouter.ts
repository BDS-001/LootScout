import browser from 'webextension-polyfill';
import { updateRegion, getRegion } from '../services/SettingsService';
import { RegionCode } from '../shared/types';
import { DataCoordinator } from './DataCoordinator';

export class MessageRouter {
	private dataCoordinator: DataCoordinator;

	constructor() {
		this.dataCoordinator = new DataCoordinator();
	}

	public setupEventListeners(): void {
		browser.runtime.onMessage.addListener(async (msg, _sender, sendResponse) => {
			if (msg.action === 'updateCountryCode') {
				return this.handleUpdateCountryCode(msg.countryCode);
			} else if (msg.action === 'getAppData') {
				return this.dataCoordinator.fetchGameData(msg.appId);
			} else if (msg.action === 'getCountryCode') {
				return this.handleGetCountryCode();
			}
		});
	}

	private async handleUpdateCountryCode(
		countryCode: string
	): Promise<{ success: boolean; error?: any }> {
		try {
			await updateRegion(countryCode as RegionCode);
			return { success: true };
		} catch (error) {
			console.error('Error updating country code:', error);
			return { success: false, error };
		}
	}

	private async handleGetCountryCode(): Promise<string> {
		return await getRegion();
	}
}
