export function getHltbUrl(title: string): string {
	const formattedTitle = title.trim().replace(' ', '%2520');
	return `https://howlongtobeat.com/?q=${formattedTitle}`;
}
