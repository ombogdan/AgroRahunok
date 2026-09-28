// The config itself, not the i18n index, which also brings the React provider: models stay plain.
import {localeTag, t} from '../../config/i18n/i18n.config';
import type {Field} from '../fields/model';
import type {Planting} from '../fields/plantingsRepository';
import type {FarmRecord} from '../records/model';
import {seasonFor, toLocalIsoDate} from '../records/model';

// A plot's crop rotation, newest harvest year first.
export function fieldRotation(plantings: Planting[], fieldId: string): Planting[] {
  return plantings.filter(item => item.fieldId === fieldId).sort((a, b) => b.season - a.season);
}

// The first harvest year from `fromYear` on that has no planting on the plot yet.
export function firstFreeSeason(rotation: Planting[], fromYear: number): number {
  let season = fromYear;
  while (rotation.some(item => item.season === season)) season++;
  return season;
}

// When a season's works began: the start of works, or the sowing if only that is known.
export function startedOn(planting: Planting): string | null {
  return planting.workStartOn ?? planting.sownOn;
}

// The harvest year a job on the plot belongs to. Once next year's planting has a start date,
// that date decides (autumn tillage and sowing already count for next year); without one,
// the winter-crop rule looks at next year's planned crop, or at the plot's crop.
export function seasonOnField(date: Date, rotation: Planting[], plotCrop: string | null): number {
  const year = date.getFullYear();
  const next = rotation.find(item => item.season === year + 1);
  const nextStart = next ? startedOn(next) : null;
  if (nextStart) return nextStart <= toLocalIsoDate(date) ? year + 1 : year;
  return seasonFor(date, next?.crop ?? plotCrop);
}

// Berries and orchards stay in place for years: their crop is set once and may repeat.
// Every other plot changes its crop from year to year through the crop rotation.
export function rotatesCrops(field: Pick<Field, 'type'>): boolean {
  return field.type !== 'berries' && field.type !== 'orchard';
}

// Crop and variety names typed by hand match regardless of case and stray spaces.
export function sameName(first: string, second: string): boolean {
  return first.trim().toLocaleLowerCase(localeTag()) === second.trim().toLocaleLowerCase(localeTag());
}

// The previous year's planting when it had the same crop: rotations usually alternate crops.
export function repeatedFrom(planting: Pick<Planting, 'season' | 'crop'>, rotation: Planting[]): Planting | null {
  if (!planting.crop) return null;
  const previous = rotation.find(item => item.season === planting.season - 1);
  return previous?.crop && sameName(previous.crop, planting.crop) ? previous : null;
}

// Centners per hectare and kilograms per sotka are the same number (kilograms per hectare / 100);
// plots under half a hectare read better in kilograms per sotka, as on the finances screen.
export function yieldUnit(areaM2: number): string {
  return areaM2 < 5000 ? t('kgAre') : t('qHa');
}

export function formatYield(kgPerHa: number, areaM2: number): string {
  const value = new Intl.NumberFormat(localeTag(), {maximumFractionDigits: 1}).format(kgPerHa / 100);
  return `${value} ${yieldUnit(areaM2)}`;
}

// Harvest records of the plot and season turned into kilograms per hectare.
export function actualYieldKgPerHa(records: FarmRecord[], fieldId: string, season: number, areaM2: number): number | null {
  const harvestedKg = records.filter(record => record.kind === 'harvest' && record.fieldId === fieldId &&
    record.season === season).reduce((sum, record) => sum + (record.quantityKg ?? 0), 0);
  return harvestedKg > 0 && areaM2 > 0 ? (harvestedKg * 10000) / areaM2 : null;
}
