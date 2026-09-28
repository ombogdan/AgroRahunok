// The config itself, not the i18n index, which also brings the React provider: models stay plain.
import {getLanguage, localeTag, t} from '../../config/i18n/i18n.config';
export type RecordKind = 'work' | 'harvest' | 'sale' | 'other';
export type WorkType = 'oranka' | 'dysk' | 'borona' | 'kult' | 'posiv' | 'posadka' | 'sap' |
  'obpr' | 'pidzh' | 'poliv' | 'mulch' | 'obriz' | 'zbir' | 'inshe';
export type CostMode = 'sum' | 'perHa';
export type Performer = 'self' | 'family' | 'neighbour' | 'hired';

export type RecordDetails = {
  costMode?: CostMode;
  ratePerHaKopecks?: number;
  performer?: Performer;
  unitName?: string;
  kilogramsPerUnit?: number;
  enteredQuantity?: number;
  pricePerUnitKopecks?: number;
  buyer?: string;
  category?: string;
  rowPlantingIds?: string[];
  // The rows' crop and variety as they were when the record was made.
  cropSnapshot?: string;
  varietySnapshot?: string;
  rowNumbersSnapshot?: number[];
};

export type FarmRecord = {
  id: string;
  fieldId: string | null;
  plantingId: string | null;
  kind: RecordKind;
  workType: WorkType | null;
  occurredOn: string; // YYYY-MM-DD in the phone's local time
  season: number;
  amountKopecks: number | null;
  quantityKg: number | null;
  note: string | null;
  details: RecordDetails;
  createdAt: string;
};

export type NewRecord = Omit<FarmRecord, 'id' | 'plantingId' | 'createdAt'>;

// Keep 'poliv' in WorkType for existing records, but omit it from the quick work picker.
export const workTypes: WorkType[] = ['oranka', 'dysk', 'borona', 'kult', 'posiv', 'posadka',
  'sap', 'obpr', 'pidzh', 'mulch', 'obriz', 'zbir', 'inshe'];

export const workTypeLabels: Record<WorkType, string> = {
  oranka: 'ploughing', dysk: 'discHarrowing', borona: 'harrowing', kult: 'cultivation',
  posiv: 'sowing', posadka: 'planting', sap: 'hoeing', obpr: 'spraying',
  pidzh: 'fertilising', poliv: 'irrigation', mulch: 'mulching', obriz: 'pruning', zbir: 'harvestWork', inshe: 'other',
};

export const performerLabels: Record<Performer, string> = {
  self: 'myself', family: 'family', neighbour: 'neighbour', hired: 'hiredMachinery',
};

const NBSP = ' ';
const MONTHS = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];

// The harvest year a record belongs to: autumn work (from August) under a winter crop
// prepares next year's harvest, everything else counts in the calendar year.
export function seasonFor(date: Date, crop: string | null): number {
  const year = date.getFullYear();
  const isWinterCrop = !!crop && /озим/i.test(crop);
  return isWinterCrop && date.getMonth() >= 7 ? year + 1 : year;
}

export function toLocalIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function fromLocalIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// «Сьогодні», «Вчора», «24 вересня» or «24 вересня 2025» for another year.
export function dateLabel(isoDate: string, today = new Date()): string {
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (isoDate === toLocalIsoDate(today)) return t('today');
  if (isoDate === toLocalIsoDate(yesterday)) return t('yesterday');
  return calendarDateLabel(isoDate, today);
}

// «24 вересня», or «24 вересня 2025» for another year (or always with `withYear`), also for today's date.
export function calendarDateLabel(isoDate: string, today = new Date(), withYear = false): string {
  const date = fromLocalIsoDate(isoDate);
  const label = getLanguage() === 'uk' ? `${date.getDate()}${NBSP}${MONTHS[date.getMonth()]}` :
    new Intl.DateTimeFormat(localeTag(), {day: 'numeric', month: 'long'}).format(date);
  return !withYear && date.getFullYear() === today.getFullYear() ? label : `${label} ${date.getFullYear()}`;
}

// Reads «26.09.2026» or «26.9.2026»; null for anything that is not a real calendar date.
export function parseDateInput(value: string): string | null {
  const match = value.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return null;
  const [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return toLocalIsoDate(date);
}

export function formatDateInput(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
}

// «3000», «3 000», «2,50» or «0» hryvnias → kopecks; null for empty or invalid input.
export function parseMoneyInput(value: string): number | null {
  const normalized = value.replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const kopecks = Math.round(Number(normalized) * 100);
  return Number.isSafeInteger(kopecks) ? kopecks : null;
}

// «3 000 грн» or «2,50 грн»; the sign is left to the caller.
export function formatMoney(kopecks: number): string {
  const hryvnias = Math.abs(kopecks) / 100;
  const formatted = new Intl.NumberFormat(localeTag(), {
    minimumFractionDigits: Number.isInteger(hryvnias) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(hryvnias);
  return `${formatted}${NBSP}${getLanguage() === 'uk' ? 'грн' : 'UAH'}`;
}

// The cost of a job: typed directly, or a per-hectare rate multiplied by the plot's area.
export function workCostKopecks(mode: CostMode, valueKopecks: number | null, areaM2: number): number | null {
  if (valueKopecks === null) return null;
  return mode === 'sum' ? valueKopecks : Math.round((valueKopecks * areaM2) / 10000);
}

export function kilogramsFor(quantity: number, kilogramsPerUnit: number): number {
  return Math.round(quantity * kilogramsPerUnit * 1000) / 1000;
}

export function saleAmountKopecks(quantity: number, pricePerUnitKopecks: number): number {
  return Math.round(quantity * pricePerUnitKopecks);
}

export function formatKilograms(kg: number): string {
  return `${new Intl.NumberFormat(localeTag(), {maximumFractionDigits: 3}).format(kg)}${NBSP}${getLanguage() === 'uk' ? 'кг' : 'kg'}`;
}
