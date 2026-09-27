function slugify(title: string, separator: string): string {
	return title
		.replace(/[^\p{L}\p{N}]+/gu, ' ')
		.trim()
		.replace(/\s+/g, separator);
}

export function getUrl(base: string, queryParam: string, title: string, separator: string): string {
	const processedTitle = slugify(title, separator);
	return `${base}?${queryParam}=${processedTitle}`;
}
