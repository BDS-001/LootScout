import { SteamAppUrlData } from '../shared/types';

export default function parseSteamPageUrl(): SteamAppUrlData {
	const pattern = /store\.steampowered\.com\/app\/(?<appId>\d+)\/(?<appName>[\w-]+)/;
	const match = window.location.href.match(pattern);
	const appId = match?.groups?.appId || null;
	const appName = match?.groups?.appName || null;

	return { appId, appName };
}
