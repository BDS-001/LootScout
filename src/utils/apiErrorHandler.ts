interface ApiErrorResponse {
	success: false;
	data: {
		name: string;
		message: string;
		code: number;
		status: number;
	};
	error: unknown;
}

export const handleApiError = (error: unknown, serviceName: string): ApiErrorResponse => {
	console.error(`${serviceName} API error:`, error);
	return {
		success: false,
		data: {
			name: 'Network Error',
			message: `Error fetching data from ${serviceName}`,
			code: 0,
			status: 0,
		},
		error,
	};
};
