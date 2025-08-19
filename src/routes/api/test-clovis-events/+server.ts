import { json, error, type RequestEvent} from '@sveltejs/kit';
import { getAllMetrics } from '$lib/server/stratus-internal';



export async function GET() {
	try {
		// Get all metrics from our database
		const metrics = await getAllMetrics();
		
		return json({
			success: true,
			message: 'Metrics retrieved from database',
			metricsCount: metrics.length,
			recentMetrics: metrics.slice(-5),
			timestamp: new Date().toISOString()
		});
	} catch (err) {
		console.error('Error in test-clovis-events:', err);
		throw error(500, `Failed to get metrics: ${err instanceof Error ? err.message : 'Unknown error'}`);
	}
}