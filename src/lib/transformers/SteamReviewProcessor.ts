import { removeOutliers, calculateMean } from '../utils/MathUtils';
import { debug } from '../utils/debug';

// Steam review processing types
export interface SimplifiedSteamReview {
	voted_up: boolean;
	author: {
		playtime_forever: number;
	};
}

export interface SteamReviewQuerySummary {
	num_reviews: number;
	review_score: number;
	review_score_desc: string;
	total_positive: number;
	total_negative: number;
	total_reviews: number;
}

export interface SteamReviewsResponse {
	success: number;
	query_summary: SteamReviewQuerySummary;
	reviews: SimplifiedSteamReview[];
	cursor?: string;
}

export interface ProcessedSteamReviews {
	totalReviews: number;
	positivePercentage: number;
	reviewSummary: string;
	reviewScore: number;
	averagePlaytime: number;
}

function calculatePlaytime(reviews: SimplifiedSteamReview[]): number {
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

	debug.log(
		`Average playtime: ${averageMinutes.toFixed(2)} minutes (${averageHours.toFixed(2)} hours)`
	);

	return Math.round(averageHours * 10) / 10;
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
