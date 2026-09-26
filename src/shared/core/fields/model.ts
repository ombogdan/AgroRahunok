import {area} from '@turf/area';

export type FieldType = 'field' | 'garden' | 'berries' | 'orchard' | 'greenhouse';
export type AreaSource = 'document' | 'measured';
export type GeoPoint = {latitude: number; longitude: number};

export type Field = {
  id: string;
  name: string;
  type: FieldType;
  crop: string | null;
  documentAreaM2: number | null;
  measuredAreaM2: number | null;
  areaSource: AreaSource;
  polygon: GeoPoint[];
  createdAt: string;
};

export type NewField = Omit<Field, 'id' | 'createdAt'>;

export const fieldTypeLabels: Record<FieldType, string> = {
  field: 'Поле', garden: 'Город', berries: 'Ягідник',
  orchard: 'Сад', greenhouse: 'Теплиця',
};

const NBSP = ' ';
// Plots under half a hectare read more naturally in sotky, as in the design.
const SOTKY_THRESHOLD_M2 = 5000;

const formatNumber = (value: number, minDigits: number, maxDigits: number) =>
  new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  }).format(value);

export function selectedAreaM2(field: Field): number {
  return (field.areaSource === 'document' ? field.documentAreaM2 : field.measuredAreaM2) ?? 0;
}

// Ukrainian agreement: 1/21 сотка, 2–4/22–24 сотки, 5–20/25 соток; fractions take «сотки».
export function sotkyWord(value: number): string {
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
  return `${formatNumber(areaM2 / 10000, exact ? 2 : 0, 2)}${NBSP}га`;
}

export function formatArea(areaM2: number): string {
  return areaM2 < SOTKY_THRESHOLD_M2 ? formatSotky(areaM2) : formatHectares(areaM2, {exact: true});
}

export function parseAreaInput(value: string, unit: 'sotka' | 'hectare'): number | null {
  const normalized = value.replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;
  const numeric = Number(normalized);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return numeric * (unit === 'hectare' ? 10000 : 100);
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
