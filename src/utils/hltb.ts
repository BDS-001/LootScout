import { getUrl } from './getUrl';

export function getHltbUrl(title: string): string {
	return getUrl('https://howlongtobeat.com/', 'q', title, '%2520');
}
