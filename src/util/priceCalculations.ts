export function calculateDiscount(originalPrice: number, discountedPrice: number): number {
	if (originalPrice <= 0 || discountedPrice < 0) {
		return 0;
	}

	if (discountedPrice >= originalPrice) {
		return 0;
	}

	return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

export function calculateSavings(steamPrice: number, retailPrice: number): number {
	return (steamPrice - retailPrice) / 100;
}

export function formatPrice(priceInCents: number, currency: string): string {
	return `${(priceInCents / 100).toFixed(2)} ${currency}`;
}

export function isPriceEqual(price1: number, price2: number): boolean {
	return price1 === price2;
}

export interface PriceComparison {
	currentRawDiscount: number;
	historicalRawDiscount: number;
	currentDiscount: number;
	historicalDiscount: number;
	currentSavings: number;
	historicalSavings: number;
	steamEqualsCurrent: boolean;
	steamEqualsHistorical: boolean;
}

export function calculatePriceComparison(
	steamPrice: number,
	steamOriginalPrice: number,
	currentRetail: number,
	historicalRetail: number
): PriceComparison {
	return {
		currentRawDiscount: calculateDiscount(steamOriginalPrice, currentRetail),
		historicalRawDiscount: calculateDiscount(steamOriginalPrice, historicalRetail),
		currentDiscount: calculateDiscount(steamPrice, currentRetail),
		historicalDiscount: calculateDiscount(steamPrice, historicalRetail),
		currentSavings: calculateSavings(steamPrice, currentRetail),
		historicalSavings: calculateSavings(steamPrice, historicalRetail),
		steamEqualsCurrent: isPriceEqual(steamPrice, currentRetail),
		steamEqualsHistorical: isPriceEqual(steamPrice, historicalRetail),
	};
}
