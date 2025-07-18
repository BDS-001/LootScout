export function removeOutliers(numbers: number[]): number[] {
	if (numbers.length === 0) return numbers;

	const q1Index = Math.floor(numbers.length * 0.25);
	const q3Index = Math.floor(numbers.length * 0.75);

	const q1 = numbers[q1Index];
	const q3 = numbers[q3Index];

	const iqr = q3 - q1;
	const iqrMin = q1 - 1.5 * iqr;
	const iqrMax = q3 + 1.5 * iqr;

	return numbers.filter((num) => num >= iqrMin && num <= iqrMax);
}

export function calculateMean(numbers: number[]): number {
	if (numbers.length === 0) return 0;

	const sum = numbers.reduce((acc, curr) => acc + curr, 0);
	return sum / numbers.length;
}
