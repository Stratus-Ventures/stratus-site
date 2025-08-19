import { json, error, type RequestEvent} from '@sveltejs/kit';
import { getAllMetrics } from '$lib/server/stratus-api';



export async function GET() {
	try {
		// Get all metrics from our database
		const metrics = await getAllMetrics();
		
		return json({
			success: true,
			message: 'Metrics retrieved from database',
			metricsCount: metrics.length,
			recentMetrics: metrics.slice(-5), // Show last 5 metrics
			timestamp: new Date().toISOString()
		});
	} catch (err) {
		throw error(500, `Failed to get metrics: ${err instanceof Error ? err.message : 'Unknown error'}`);
	}
}