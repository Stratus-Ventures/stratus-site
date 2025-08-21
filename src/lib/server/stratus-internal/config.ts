import { env } from '$env/dynamic/private';



export interface ProductConfig {
	name: string;
	apiUrl: string;
	apiKey: string;
}



// Get all product configurations dynamically
export function getAllProductConfigs(): ProductConfig[] {
	const configs: ProductConfig[] = [];

	// Dynamically scan for all API configurations
	const envKeys = Object.keys(env);
	const productNames = new Set<string>();

	// Extract product names from environment variables
	envKeys.forEach(key => {
		if (key.endsWith('_API_URL')) {
			const productName = key.replace('_API_URL', '').toLowerCase();
			productNames.add(productName);
		}
	});

	// Build configurations for each product
	productNames.forEach(name => {
		const urlKey = `${name.toUpperCase()}_API_URL`;
		const keyKey = `${name.toUpperCase()}_API_KEY`;
		
		const apiUrl = env[urlKey];
		const apiKey = env[keyKey];

		// Security: Validate URL format and API key length
		if (apiUrl && apiKey && apiUrl.startsWith('http') && apiKey.length > 10) {
			configs.push({
				name,
				apiUrl,
				apiKey
			});
		}
	});

	return configs;
}


// Common headers for all API requests
export const getApiHeaders = (apiKey: string) => ({
	'clovis-api-key': apiKey,
	'Origin': 'https://stratus-ventures.org',
	'Content-Type': 'application/json'
});