export type RecordKind = 'work' | 'harvest' | 'sale' | 'other';
export type WorkType = 'oranka' | 'kult' | 'posiv' | 'sap' | 'obpr' | 'pidzh' | 'poliv' | 'obriz' | 'zbir' | 'inshe';
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

export const workTypes: WorkType[] = ['oranka', 'kult', 'posiv', 'sap', 'obpr', 'pidzh', 'poliv', 'obriz', 'zbir', 'inshe'];

export const workTypeLabels: Record<WorkType, string> = {
  oranka: 'Оранка', kult: 'Культивація', posiv: 'Посів', sap: 'Сапання', obpr: 'Обприскування',
  pidzh: 'Підживлення', poliv: 'Полив', obriz: 'Обрізка', zbir: 'Збір', inshe: 'Інше',
};

export const performerLabels: Record<Performer, string> = {
  self: 'Сама', family: 'Родина', neighbour: 'Сусід', hired: 'Найняла техніку',
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
  const date = fromLocalIsoDate(isoDate);
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (isoDate === toLocalIsoDate(today)) return 'Сьогодні';
  if (isoDate === toLocalIsoDate(yesterday)) return 'Вчора';
  const label = `${date.getDate()}${NBSP}${MONTHS[date.getMonth()]}`;
  return date.getFullYear() === today.getFullYear() ? label : `${label} ${date.getFullYear()}`;
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

// «3000», «3 000» or «2,50» hryvnias → kopecks; null for anything else or ≤ 0.
export function parseMoneyInput(value: string): number | null {
  const normalized = value.replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const kopecks = Math.round(Number(normalized) * 100);
  return kopecks > 0 ? kopecks : null;
}

// «3 000 грн» or «2,50 грн»; the sign is left to the caller.
export function formatMoney(kopecks: number): string {
  const hryvnias = Math.abs(kopecks) / 100;
  const formatted = new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: Number.isInteger(hryvnias) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(hryvnias);
  return `${formatted}${NBSP}грн`;
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
  return `${new Intl.NumberFormat('uk-UA', {maximumFractionDigits: 3}).format(kg)}${NBSP}кг`;
}
