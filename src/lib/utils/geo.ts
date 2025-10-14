import { Vector3 } from 'three';

/**
 * Converts latitude/longitude coordinates to 3D sphere position
 * @param lat Latitude in degrees (-90 to 90)
 * @param lon Longitude in degrees (-180 to 180)
 * @param radius Sphere radius
 * @returns Vector3 position on sphere surface
 */
export function latLngToSphere(lat: number, lon: number, radius: number): Vector3 {
	// Convert degrees to radians
	const phi = (90 - lat) * (Math.PI / 180);
	const theta = (lon + 180) * (Math.PI / 180);

	// Calculate 3D position on sphere
	return new Vector3(
		-radius * Math.sin(phi) * Math.cos(theta),
		radius * Math.cos(phi),
		radius * Math.sin(phi) * Math.sin(theta)
	);
}

/**
 * Generates points along a great circle arc between two lat/lng positions with elevation
 * Arc height is proportional to the distance between points
 * @param startLat Starting latitude
 * @param startLng Starting longitude
 * @param endLat Ending latitude
 * @param endLng Ending longitude
 * @param radius Sphere radius
 * @param segments Number of segments in the arc
 * @returns Array of Vector3 points forming the elevated arc
 */
export function createArcPoints(
	startLat: number,
	startLng: number,
	endLat: number,
	endLng: number,
	radius: number,
	segments: number = 50
): Vector3[] {
	const start = latLngToSphere(startLat, startLng, radius);
	const end = latLngToSphere(endLat, endLng, radius);

	const points: Vector3[] = [];

	// Calculate angular distance between points (in radians)
	const angularDistance = start.angleTo(end);

	for (let i = 0; i <= segments; i++) {
		const t = i / segments;

		// Spherical interpolation (slerp) for smooth arc
		const angle = angularDistance;
		const sinAngle = Math.sin(angle);

		if (sinAngle === 0) {
			// Points are too close, use linear interpolation
			points.push(start.clone().lerp(end, t));
		} else {
			const a = Math.sin((1 - t) * angle) / sinAngle;
			const b = Math.sin(t * angle) / sinAngle;

			const point = new Vector3(
				a * start.x + b * end.x,
				a * start.y + b * end.y,
				a * start.z + b * end.z
			);

			// Dynamic arc height based on distance
			// Closer points = lower arc (min 5% height)
			// Farther points = higher arc (max 25% height)
			// Angular distance ranges from 0 to PI (opposite sides of globe)
			const normalizedDistance = angularDistance / Math.PI; // 0 to 1
			const arcHeight = 0.05 + normalizedDistance * 0.2; // 5% to 25% of radius

			const elevation = Math.sin(t * Math.PI) * radius * arcHeight;
			const direction = point.clone().normalize();
			point.add(direction.multiplyScalar(elevation));

			points.push(point);
		}
	}

	return points;
}
