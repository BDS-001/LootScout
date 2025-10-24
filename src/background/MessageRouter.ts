import browser from 'webextension-polyfill';
import { updateRegion, getRegion } from '../services/SettingsService';
import { RegionCode } from '../shared/types';
import { DataCoordinator } from './DataCoordinator';
import { debug } from '../utils/debug';
import { STEAM_ORIGINS } from '../constants/steamOrigins';
import { STEAM_PERMISSION_INSTRUCTIONS } from '../constants/messages';

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
				return this.handleGetAppData(msg.appId);
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
			debug.error('Error updating country code:', error);
			return { success: false, error };
		}
	}

	private async handleGetCountryCode(): Promise<string> {
		return await getRegion();
	}

	private async handleGetAppData(appId: string) {
		try {
			debug.log('getAppData request received', { appId });
			const hasSteamPermission = await browser.permissions.contains({ origins: STEAM_ORIGINS });
			if (!hasSteamPermission) {
				debug.warn('Steam permission missing, returning instructions', { appId });
				return {
					success: false,
					data: {
						name: 'MissingSteamPermission',
						message: STEAM_PERMISSION_INSTRUCTIONS,
						code: 0,
						status: 0,
					},
				};
			}

			const result = await this.dataCoordinator.fetchGameData(appId);
			debug.log('getAppData response', { appId, success: result?.success ?? false });
			return result;
		} catch (error) {
			debug.error('Failed to handle getAppData request:', error);
			return {
				success: false,
				data: {
					name: 'FetchError',
					message: 'Unable to fetch game data.',
					code: 0,
					status: 0,
				},
			};
		}
	}
}
