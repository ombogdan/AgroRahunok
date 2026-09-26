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

const numberFormat = (digits: number) => new Intl.NumberFormat('uk-UA', {
  maximumFractionDigits: digits,
});

export function selectedAreaM2(field: Field): number {
  return (field.areaSource === 'document' ? field.documentAreaM2 : field.measuredAreaM2) ?? 0;
}

export function formatArea(areaM2: number): string {
  return areaM2 < 10000
    ? `${numberFormat(2).format(areaM2 / 100)} соток`
    : `${numberFormat(2).format(areaM2 / 10000)} га`;
}

export function formatHectares(areaM2: number): string {
  return `${numberFormat(2).format(areaM2 / 10000)} га`;
}

export function formatSotkas(areaM2: number): string {
  return `${numberFormat(2).format(areaM2 / 100)} соток`;
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
