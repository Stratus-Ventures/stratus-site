import { env } from '$env/dynamic/private';



const CLOVIS_API_BASE = env.CLOVIS_API_URL || 'http://localhost:5174';
const CLOVIS_API_KEY = env.CLOVIS_API_KEY;



if (!CLOVIS_API_KEY) {
	throw new Error('CLOVIS_API_KEY environment variable is required');
}

// Next we need to work on these. the 

export async function fetchClovisEvents() {
	try {
		const response = await fetch(`${CLOVIS_API_BASE}/api/stratus-product-events`, {
			headers: {
				'clovis-api-key': CLOVIS_API_KEY!,
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


export async function fetchClovisProductMeta() {
	try {
		const response = await fetch(`${CLOVIS_API_BASE}/api/stratus-product-meta`, {
			headers: {
				'clovis-api-key': CLOVIS_API_KEY!,
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