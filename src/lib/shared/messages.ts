// Messages exchanged over browser.runtime.sendMessage/onMessage.
// The extension messaging API is untyped at its boundary (message: any), so every
// message must be validated at runtime before being treated as one of these variants.
export type ExtensionMessage =
	| { action: 'getAppData'; appId: string }
	| { action: 'getCountryCode' }
	| { action: 'updateCountryCode'; countryCode: string }
	| { action: 'openSettings' };

export function isExtensionMessage(value: unknown): value is ExtensionMessage {
	if (typeof value !== 'object' || value === null || !('action' in value)) {
		return false;
	}

	if (typeof value.action !== 'string') {
		return false;
	}

	switch (value.action) {
		case 'getAppData':
			return 'appId' in value && typeof value.appId === 'string';
		case 'updateCountryCode':
			return 'countryCode' in value && typeof value.countryCode === 'string';
		case 'getCountryCode':
		case 'openSettings':
			return true;
		default:
			return false;
	}
}
