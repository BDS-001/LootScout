import { SteamReview, SteamReviewsResponse, ProcessedSteamReviews } from '../shared/types';

function truncatePlaytime(playtime: number): number {
	return Math.trunc(playtime * 100) / 100;
}

function calculatePlaytime(reviews: SteamReview[]): number {
	if (reviews.length === 0) return -1;
	
	const reviewPlayTimes = reviews
		.map(review => review.author.playtime_forever)
		.filter(playtime => playtime > 0)
		.sort((a, b) => a - b);
	
	if (reviewPlayTimes.length === 0) return -1;
	
	const removeCount = Math.floor(reviewPlayTimes.length * 0.1);
	
	for (let i = 0; i < removeCount; i++) {
		reviewPlayTimes.pop();
		reviewPlayTimes.shift();
	}
	
	if (reviewPlayTimes.length === 0) return -1;
	
	const sum = reviewPlayTimes.reduce((acc, curr) => acc + curr, 0);
	const average = sum / reviewPlayTimes.length;
	
	return truncatePlaytime(average);
}


function processSteamReviews(response: SteamReviewsResponse): ProcessedSteamReviews {
	const { query_summary, reviews } = response;
	
	const totalReviews = query_summary.total_reviews;
	const positivePercentage = totalReviews > 0 
		? Math.round((query_summary.total_positive / totalReviews) * 100)
		: 0;
	
	const averagePlaytime = calculatePlaytime(reviews);
	
	return {
		totalReviews,
		positivePercentage,
		reviewSummary: query_summary.review_score_desc,
		reviewScore: query_summary.review_score.toString(),
		averagePlaytime
	};
}

export { processSteamReviews };