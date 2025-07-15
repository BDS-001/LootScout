export function getHltbUrl(title: string): string {
	const formattedTitle = title.trim().replace(/ /g, '%2520');
	return `https://howlongtobeat.com/?q=${formattedTitle}`;
}
