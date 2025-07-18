export type GameStatus = 'not_released' | 'free' | 'paid';

export function getGameStatus(steamAppData: any): GameStatus {
	if (steamAppData?.data?.release_date?.coming_soon) {
		return 'not_released';
	}
	if (steamAppData?.data?.is_free) {
		return 'free';
	}
	return 'paid';
}

export function shouldFetchReviews(gameStatus: GameStatus, hasCachedReviews: boolean): boolean {
	return gameStatus !== 'not_released' && !hasCachedReviews;
}

export function shouldFetchDeals(gameStatus: GameStatus): boolean {
	return gameStatus === 'paid';
}
