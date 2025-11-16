import { json } from '@sveltejs/kit';
import { requestAuthCode } from '$lib/server/services/auth';
import { logger } from '$lib/server';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, request }) => {
	try {
		logger.info('📬 API /request-auth called');
		logger.info('Origin:', url.origin);
		await requestAuthCode(url.origin);
		logger.success('✅ Auth code requested via GET');

		// Check if request is from browser (wants HTML) or API call (wants JSON)
		const acceptsHTML = request.headers.get('accept')?.includes('text/html');

		if (acceptsHTML) {
			// Return HTML with JavaScript alert for browser requests
			return new Response(
				`
                <!DOCTYPE html>
                <html lang="none">
									<head>
											<title>Auth Code Sent</title>
									</head>
									<body>
											<script>
													alert('Auth code sent!');
													window.history.back();
											</script>
									</body>
                </html>
            `,
				{
					headers: { 'content-type': 'text/html' }
				}
			);
		} else {
			// Return JSON for API calls
			return json({
				success: true,
				message: 'Auth code sent to email'
			});
		}
	} catch (error) {
		logger.error('Failed to request auth code via GET', error);

		const acceptsHTML = request.headers.get('accept')?.includes('text/html');

		if (acceptsHTML) {
			return new Response(
				`
                <!DOCTYPE html>
                <html lang="none">
									<head>
											<title>Error</title>
									</head>
									<body>
											<script>
													alert('Failed to send auth code');
													window.history.back();
											</script>
									</body>
                </html>
            `,
				{
					headers: { 'content-type': 'text/html' },
					status: 500
				}
			);
		} else {
			return json(
				{
					success: false,
					error: 'Failed to send auth code'
				},
				{ status: 500 }
			);
		}
	}
};
