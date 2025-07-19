import { SteamReview, SteamReviewsResponse, ProcessedSteamReviews } from '../shared/types';
import { removeOutliers, calculateMean } from '../utils/MathUtils';

function calculatePlaytime(reviews: SteamReview[]): number {
	if (reviews.length === 0) return -1;

	const reviewPlayTimes = reviews
		.map((review) => review.author.playtime_forever)
		.filter((playtime) => playtime > 0)
		.sort((a, b) => a - b);

	if (reviewPlayTimes.length === 0) return -1;

	const filteredPlaytimes =
		reviewPlayTimes.length < 10 ? reviewPlayTimes : removeOutliers(reviewPlayTimes);

	const averageMinutes = calculateMean(filteredPlaytimes);
	const averageHours = averageMinutes / 60;

	console.log(
		`Average playtime: ${averageMinutes.toFixed(2)} minutes (${averageHours.toFixed(2)} hours)`
	);

	return averageHours;
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
		reviewScore: query_summary.review_score,
		averagePlaytime,
	};
}

export { processSteamReviews };
