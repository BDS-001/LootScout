import { debug } from './debug';

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
	debug.error(`${serviceName} API error:`, error);

	let errorMessage = `Error fetching data from ${serviceName}`;
	let errorCode = 0;
	let errorStatus = 0;

	if (error instanceof Error) {
		errorMessage = `${serviceName}: ${error.message}`;

		// Extract HTTP status codes from error messages
		const httpMatch = error.message.match(/HTTP (\d+):/);
		if (httpMatch) {
			errorStatus = parseInt(httpMatch[1]);
			errorCode = errorStatus;
		}
	}

	return {
		success: false,
		data: {
			name: `${serviceName} API Error`,
			message: errorMessage,
			code: errorCode,
			status: errorStatus,
		},
		error,
	};
};
