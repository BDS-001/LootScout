import { SteamAppUrlData } from '../shared/types';

function formatAppName(appName: string) {
	return appName.trim().replace(/_/g, ' ');
}

export default function parseSteamPageUrl(): SteamAppUrlData {
	const pattern = /store\.steampowered\.com\/app\/(?<appId>\d+)\/(?<appName>[\w-]+)/;
	const match = window.location.href.match(pattern);
	const appId = match?.groups?.appId || null;
	const appName = match?.groups?.appName ? formatAppName(match?.groups?.appName) : null;

	if (appName) appName;

	return { appId, appName };
}
