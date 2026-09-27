import type {FarmRecord, NewRecord, RecordDetails, RecordKind, WorkType} from './model';
import {getSupabaseClient} from '../supabase/client';

type RecordRow = {
  id: string;
  field_id: string | null;
  planting_id: string | null;
  kind: RecordKind;
  work_type: WorkType | null;
  occurred_on: string;
  season: number;
  amount_kopecks: number | null;
  quantity_kg: number | null;
  note: string | null;
  details: RecordDetails | null;
  created_at: string;
};

// owner_id comes from the signed-in user and planting_id from a database trigger.
// One literal, so supabase-js can type the selected columns.
const COLUMNS = 'id, field_id, planting_id, kind, work_type, occurred_on, season, amount_kopecks, quantity_kg, note, details, created_at';

function fromRow(row: RecordRow): FarmRecord {
  return {
    id: row.id,
    fieldId: row.field_id,
    plantingId: row.planting_id,
    kind: row.kind,
    workType: row.work_type,
    occurredOn: row.occurred_on,
    season: row.season,
    // bigint arrives as a number for any realistic farm amount.
    amountKopecks: row.amount_kopecks === null ? null : Number(row.amount_kopecks),
    quantityKg: row.quantity_kg,
    note: row.note,
    details: row.details ?? {},
    createdAt: row.created_at,
  };
}

function toRow(input: NewRecord) {
  return {
    field_id: input.fieldId,
    kind: input.kind,
    work_type: input.workType,
    occurred_on: input.occurredOn,
    season: input.season,
    amount_kopecks: input.amountKopecks,
    quantity_kg: input.quantityKg,
    note: input.note,
    details: input.details,
  };
}

function requireClient() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

// Newest first, the order the journal shows them in.
export async function fetchRecords(): Promise<FarmRecord[]> {
  const all: RecordRow[] = [];
  for (let offset = 0; ; offset += 1000) {
    const {data, error} = await requireClient().from('records').select(COLUMNS)
      .order('id', {ascending: true}).range(offset, offset + 999);
    if (error) throw error;
    const page = data as RecordRow[];
    all.push(...page);
    if (page.length < 1000) break;
  }
  return all.map(fromRow).sort((a, b) => b.occurredOn.localeCompare(a.occurredOn) ||
    b.createdAt.localeCompare(a.createdAt));
}

export async function insertRecord(input: NewRecord): Promise<FarmRecord> {
  const {data, error} = await requireClient().from('records').insert(toRow(input))
    .select(COLUMNS).single();
  if (error) throw error;
  return fromRow(data as RecordRow);
}

export async function updateRecord(id: string, input: NewRecord): Promise<FarmRecord> {
  const {data, error} = await requireClient().from('records').update(toRow(input))
    .eq('id', id).select(COLUMNS).single();
  if (error) throw error;
  return fromRow(data as RecordRow);
}

export async function deleteRecord(id: string): Promise<void> {
  const {error} = await requireClient().from('records').delete().eq('id', id);
  if (error) throw error;
}
