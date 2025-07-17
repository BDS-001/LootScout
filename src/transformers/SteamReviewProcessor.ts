import { SteamReview, SteamReviewsResponse, ProcessedSteamReviews } from '../shared/types';

function removeOutliers(playtime: Array<number>): Array<number> {
	const q1Index = Math.floor(playtime.length * 0.25);
	const q3Index = Math.floor(playtime.length * 0.75);

	const q1 = playtime[q1Index];
	const q3 = playtime[q3Index];

	const iqr = q3 - q1;
	const iqrMin = q1 - 1.5 * iqr;
	const iqrMax = q3 + 1.5 * iqr;

	return playtime.filter((time) => time >= iqrMin && time <= iqrMax);
}

function calculateMean(playtime: Array<number>): number {
	const sum = playtime.reduce((acc, curr) => acc + curr, 0);
	const average = sum / playtime.length;
	const averageHours = average / 60;

	console.log(`Average playtime: ${average.toFixed(2)} minutes (${averageHours.toFixed(2)} hours)`);

	return averageHours;
}

function calculatePlaytime(reviews: SteamReview[]): number {
	if (reviews.length === 0) return -1;

	const reviewPlayTimes = reviews
		.map((review) => review.author.playtime_forever)
		.filter((playtime) => playtime > 0)
		.sort((a, b) => a - b);

	if (reviewPlayTimes.length === 0) return -1;

	const filteredPlaytimes =
		reviewPlayTimes.length < 10 ? reviewPlayTimes : removeOutliers(reviewPlayTimes);

	return calculateMean(filteredPlaytimes);
}

function processSteamReviews(response: SteamReviewsResponse): ProcessedSteamReviews {
	const { query_summary, reviews } = response;

	const totalReviews = query_summary.total_reviews;
	const positivePercentage =
		totalReviews > 0 ? Math.round((query_summary.total_positive / totalReviews) * 100) : 0;

	const averagePlaytime = calculatePlaytime(reviews);

	return {
		totalReviews,
		positivePercentage,
		reviewSummary: query_summary.review_score_desc,
		reviewScore: query_summary.review_score.toString(),
		averagePlaytime,
	};
}

export { processSteamReviews };
