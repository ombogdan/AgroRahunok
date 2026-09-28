import {getLanguage, localeTag} from '../../config/i18n';
import {area} from '@turf/area';

export type FieldType = 'field' | 'garden' | 'berries' | 'orchard' | 'greenhouse';
export type AreaSource = 'document' | 'measured';
export type GeoPoint = {latitude: number; longitude: number};

export type Field = {
  id: string;
  name: string;
  type: FieldType;
  crop: string | null;
  variety: string | null;
  documentAreaM2: number | null;
  measuredAreaM2: number | null;
  areaSource: AreaSource;
  polygon: GeoPoint[];
  createdAt: string;
};

export type NewField = Omit<Field, 'id' | 'createdAt'>;

export const fieldTypeLabels: Record<FieldType, string> = {
  field: 'fieldType', garden: 'vegetableGarden', berries: 'berryPlot',
  orchard: 'orchard', greenhouse: 'greenhouse',
};

const NBSP = ' ';
// Plots under half a hectare read more naturally in sotky, as in the design.
const SOTKY_THRESHOLD_M2 = 5000;

const formatNumber = (value: number, minDigits: number, maxDigits: number) =>
  new Intl.NumberFormat(localeTag(), {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  }).format(value);

export function selectedAreaM2(field: Field): number {
  return (field.areaSource === 'document' ? field.documentAreaM2 : field.measuredAreaM2) ?? 0;
}

// Ukrainian agreement: 1/21 сотка, 2–4/22–24 сотки, 5–20/25 соток; fractions take «сотки».
export function sotkyWord(value: number): string {
  if (getLanguage() !== 'uk') return 'a';
  if (!Number.isInteger(value)) return 'сотки';
  const lastTwo = Math.abs(value) % 100;
  const last = lastTwo % 10;
  if (last === 1 && lastTwo !== 11) return 'сотка';
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'сотки';
  return 'соток';
}

// Whole sotky from 10 up; a decimal below that so a small bed never shows as «0 соток».
export function formatSotky(areaM2: number): string {
  const sotky = areaM2 / 100;
  const rounded = sotky >= 10 ? Math.round(sotky) : Math.round(sotky * 10) / 10;
  return `${formatNumber(rounded, 0, 1)}${NBSP}${sotkyWord(rounded)}`;
}

// `exact` keeps two decimals («2,00 га») for rows and the live map area; totals trim zeros («2,2 га»).
export function formatHectares(areaM2: number, {exact = false}: {exact?: boolean} = {}): string {
  return `${formatNumber(areaM2 / 10000, exact ? 2 : 0, 2)}${NBSP}${getLanguage() === 'uk' ? 'га' : 'ha'}`;
}

export function formatArea(areaM2: number): string {
  return areaM2 < SOTKY_THRESHOLD_M2 ? formatSotky(areaM2) : formatHectares(areaM2, {exact: true});
}

export type AreaUnit = 'sotka' | 'hectare';

// Reads «2,5», «2.5» or «1 000» typed on the decimal pad; null for anything else or ≤ 0.
export function parsePositiveNumber(value: string): number | null {
  const normalized = value.replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;
  const numeric = Number(normalized);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

export function parseAreaInput(value: string, unit: AreaUnit): number | null {
  const numeric = parsePositiveNumber(value);
  return numeric === null ? null : numeric * (unit === 'hectare' ? 10000 : 100);
}

// The text to prefill an area field with, e.g. «20» sotky or «2,05» hectares.
export function areaInputValue(areaM2: number, unit: AreaUnit): string {
  const value = areaM2 / (unit === 'hectare' ? 10000 : 100);
  return String(Number(value.toFixed(2))).replace('.', ',');
}

// Area of a rectangular plot from its length and width in metres.
export function rectangleAreaM2(length: string, width: string): number | null {
  const a = parsePositiveNumber(length);
  const b = parsePositiveNumber(width);
  return a === null || b === null ? null : a * b;
}

// A map region that fits the whole contour with a margin around it.
export function regionForPoints(points: GeoPoint[]) {
  const latitudes = points.map(point => point.latitude);
  const longitudes = points.map(point => point.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLon + maxLon) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.6, 0.0008),
    longitudeDelta: Math.max((maxLon - minLon) * 1.6, 0.0008),
  };
}

export function polygonAreaM2(points: GeoPoint[]): number {
  if (points.length < 3) return 0;
  const ring = points.map(point => [point.longitude, point.latitude]);
  ring.push([points[0].longitude, points[0].latitude]);
  return area({type: 'Polygon', coordinates: [ring]});
}

// A crossed contour is not a valid field boundary; reject it before saving.
export function polygonHasCrossingEdges(points: GeoPoint[]): boolean {
  const cross = (a: GeoPoint, b: GeoPoint, c: GeoPoint) =>
    (b.longitude - a.longitude) * (c.latitude - a.latitude) -
    (b.latitude - a.latitude) * (c.longitude - a.longitude);
  const onSegment = (a: GeoPoint, b: GeoPoint, c: GeoPoint) =>
    Math.min(a.longitude, b.longitude) <= c.longitude && c.longitude <= Math.max(a.longitude, b.longitude) &&
    Math.min(a.latitude, b.latitude) <= c.latitude && c.latitude <= Math.max(a.latitude, b.latitude);
  const intersect = (a: GeoPoint, b: GeoPoint, c: GeoPoint, d: GeoPoint) => {
    const abc = cross(a, b, c);
    const abd = cross(a, b, d);
    const cda = cross(c, d, a);
    const cdb = cross(c, d, b);
    return (abc * abd < 0 && cda * cdb < 0) ||
      (abc === 0 && onSegment(a, b, c)) ||
      (abd === 0 && onSegment(a, b, d)) ||
      (cda === 0 && onSegment(c, d, a)) ||
      (cdb === 0 && onSegment(c, d, b));
  };
  for (let first = 0; first < points.length; first++) {
    for (let second = first + 1; second < points.length; second++) {
      if (second === first + 1 || (first === 0 && second === points.length - 1)) continue;
      if (intersect(points[first], points[(first + 1) % points.length],
        points[second], points[(second + 1) % points.length])) return true;
    }
  }
  return false;
}

// Earlier entries that contain what is typed (any case), in the given order, without the exact value itself.
// With nothing typed yet it offers the first few, so a crop used before is one tap away.
export function matchSuggestions(input: string, options: (string | null)[], limit = 5): string[] {
  const query = input.trim().toLocaleLowerCase(localeTag());
  const seen = new Set<string>();
  const result: string[] = [];
  for (const option of options) {
    const value = option?.trim();
    if (!value) continue;
    const key = value.toLocaleLowerCase(localeTag());
    if (seen.has(key)) continue;
    seen.add(key);
    if (key === query || (query && !key.includes(query))) continue;
    result.push(value);
    if (result.length >= limit) break;
  }
  return result;
}
