import { getUrl } from './getUrl';

export function getYouTubeUrl(title: string): string {
	return getUrl('https://www.youtube.com/results', 'search_query', title, '+');
}
