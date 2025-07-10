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
	return steamPrice - retailPrice;
}

export function formatPrice(priceInCents: number, currency: string): string {
	return `${(priceInCents / 100).toFixed(2)} ${currency}`;
}
