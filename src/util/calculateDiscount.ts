export default function calculateDiscount(originalPrice: number, discountedPrice: number): number {
	if (originalPrice <= 0 || discountedPrice < 0) {
		return 0;
	}

	if (discountedPrice >= originalPrice) {
		return 0;
	}

	return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}
