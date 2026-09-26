import type {GeoPoint} from './model';

// A new point is recorded once the phone has moved at least this far from the previous one.
export const TRACK_STEP_M = 2;
// Fixes less precise than this are skipped, so a weak signal cannot bend the boundary.
export const TRACK_MAX_ACCURACY_M = 10;

export type GpsFix = GeoPoint & {accuracy: number; timestamp: number};

const EARTH_RADIUS_M = 6371008.8;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

// Great-circle distance, precise to centimetres over the few metres between track points.
export function distanceM(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function isPreciseFix(fix: GpsFix): boolean {
  return fix.accuracy > 0 && fix.accuracy <= TRACK_MAX_ACCURACY_M &&
    !(fix.latitude === 0 && fix.longitude === 0);
}

// The point to append for this fix, or null when it is imprecise, older than `notBefore`
// (a cached location from before the walk started) or closer than TRACK_STEP_M to the last point.
export function nextTrackPoint(track: GeoPoint[], fix: GpsFix, notBefore = 0): GeoPoint | null {
  if (!isPreciseFix(fix) || fix.timestamp < notBefore) return null;
  const point = {latitude: fix.latitude, longitude: fix.longitude};
  const last = track[track.length - 1];
  return last && distanceM(last, point) < TRACK_STEP_M ? null : point;
}

export function trackLengthM(track: GeoPoint[]): number {
  let total = 0;
  for (let index = 1; index < track.length; index++) total += distanceM(track[index - 1], track[index]);
  return total;
}
