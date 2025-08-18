import { env } from '$env/dynamic/private';

const CLOVIS_API_BASE = env.CLOVIS_API_URL || 'http://localhost:5173';
const CLOVIS_API_KEY = env.CLOVIS_API_KEY;

if (!CLOVIS_API_KEY) {
	throw new Error('CLOVIS_API_KEY environment variable is required');
}

export async function fetchClovisEvents() {
	try {
		const response = await fetch(`${CLOVIS_API_BASE}/api/events`, {
			headers: {
				'clovis-api-key': CLOVIS_API_KEY!,
				'Origin': 'https://stratus-ventures.org'
			}
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();
		return data.events || [];
	} catch (error) {
		console.error('Failed to fetch Clovis events:', error);
		throw error;
	}
}

export async function fetchClovisProducts() {
	try {
		const response = await fetch(`${CLOVIS_API_BASE}/api/products`, {
			headers: {
				'clovis-api-key': CLOVIS_API_KEY!,
				'Origin': 'https://stratus-ventures.org'
			}
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();
		return data.products || {};
	} catch (error) {
		console.error('Failed to fetch Clovis products:', error);
		throw error;
	}
}