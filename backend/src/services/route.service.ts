/**
 * Route geometry service
 * Handles calculation and formatting of route geometry
 */

export interface Coordinate {
  latitude: number;
  longitude: number;
}

/**
 * Calculate route geometry from stops
 * Returns a simple polyline array format: [[lat, lng], [lat, lng], ...]
 */
export function calculateRouteGeometry(stops: Array<{ latitude: number; longitude: number }>): number[][] {
  return stops.map((stop) => [stop.latitude, stop.longitude]);
}

/**
 * Format route geometry as GeoJSON LineString
 */
export function formatAsGeoJSON(coordinates: number[][]): any {
  return {
    type: 'LineString',
    coordinates: coordinates.map(([lat, lng]) => [lng, lat]), // GeoJSON uses [lng, lat]
  };
}

