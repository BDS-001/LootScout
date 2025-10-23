export const RECENT_RELEASE_THRESHOLD_DAYS = 14;

export function isRecentlyReleased(releaseDate: string): boolean {
	try {
		const releaseTime = new Date(releaseDate).getTime();
		const now = Date.now();
		const thresholdMs = RECENT_RELEASE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
		return now - releaseTime <= thresholdMs;
	} catch {
		return false;
	}
}
