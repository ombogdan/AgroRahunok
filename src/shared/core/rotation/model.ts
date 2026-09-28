// The config itself, not the i18n index, which also brings the React provider: models stay plain.
import {localeTag, t} from '../../config/i18n/i18n.config';
import type {Field} from '../fields/model';
import {formatArea, selectedAreaM2} from '../fields/model';
import type {CropShare, Planting} from '../fields/planting';
import type {FarmRecord} from '../records/model';
import {seasonFor, toLocalIsoDate} from '../records/model';
import type {RowPlanting} from '../rows/model';
import {rowsForSeason, rowsSummary, usesRows, varietyGroups} from '../rows/model';

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

// Harvest records of the plot and season turned into kilograms per hectare. With several crops on the plot,
// `crop` limits them to one; harvests saved without a crop count for the main one.
export function actualYieldKgPerHa(records: FarmRecord[], fieldId: string, season: number, areaM2: number,
  crop?: {name: string; isMain: boolean}): number | null {
  const harvestedKg = records.filter(record => record.kind === 'harvest' && record.fieldId === fieldId &&
    record.season === season && (!crop || (record.details.cropSnapshot
      ? sameName(record.details.cropSnapshot, crop.name) : crop.isMain)))
    .reduce((sum, record) => sum + (record.quantityKg ?? 0), 0);
  return harvestedKg > 0 && areaM2 > 0 ? (harvestedKg * 10000) / areaM2 : null;
}

// Every crop of a season's planting with its area: the main one first, then those sharing the plot.
export function plantingCrops(planting: Planting, plotAreaM2: number): CropShare[] {
  const main = planting.crop
    ? [{crop: planting.crop, variety: planting.variety, areaM2: planting.areaM2 ?? plotAreaM2}] : [];
  return [...main, ...planting.extraCrops];
}

// «Озима пшениця · Богдана», or «Картопля 10 соток, Цибуля 2 сотки» when several crops share the plot.
export function plantingLabel(planting: Planting, plotAreaM2: number): string | null {
  if (planting.extraCrops.length === 0) {
    return planting.crop ? [planting.crop, planting.variety].filter(Boolean).join(' · ') : null;
  }
  return plantingCrops(planting, plotAreaM2)
    .map(share => `${[share.crop, share.variety].filter(Boolean).join(' · ')} ${formatArea(share.areaM2)}`).join(', ');
}

// What a plot grows in a season, as the home screen and the farm map show it. Berry plots and orchards
// show their rows; other plots their crop rotation line, or the plot's current crop in the season it is in now.
export function seasonCropOf(field: Field, season: number, plantings: Planting[], rows: RowPlanting[],
  today = new Date()): {crop: string | null; label: string | null} {
  const groups = varietyGroups(rowsForSeason(rows, field.id, season));
  if (usesRows(field)) {
    return {crop: groups.find(group => group.crop)?.crop ?? field.crop, label: rowsSummary(groups) || null};
  }
  const planting = plantings.find(item => item.fieldId === field.id && item.season === season);
  if (planting && planting.extraCrops.length > 0) {
    return {crop: planting.crop, label: plantingLabel(planting, selectedAreaM2(field))};
  }
  const isCurrent = season === seasonOnField(today, fieldRotation(plantings, field.id), field.crop);
  const crop = planting ? planting.crop : isCurrent ? field.crop : null;
  const variety = groups.length > 0 ? groups.map(group => group.variety).join(', ') : planting?.variety;
  return {crop, label: crop ? [crop, variety].filter(Boolean).join(' · ') : null};
}
