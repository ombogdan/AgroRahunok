import type {AreaSource, Field, FieldType, GeoPoint, NewField} from './model';
import {getSupabaseClient} from '../supabase/client';

type FieldRow = {
  id: string;
  name: string;
  type: FieldType;
  crop: string | null;
  variety: string | null;
  document_area_m2: number | null;
  measured_area_m2: number | null;
  area_source: AreaSource;
  polygon: GeoPoint[];
  created_at: string;
};

// owner_id is filled in by the database from the signed-in user, and RLS limits every query to it.
const COLUMNS = 'id, name, type, crop, variety, document_area_m2, measured_area_m2, area_source, polygon, created_at';

function fromRow(row: FieldRow): Field {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    crop: row.crop,
    variety: row.variety,
    documentAreaM2: row.document_area_m2,
    measuredAreaM2: row.measured_area_m2,
    areaSource: row.area_source,
    polygon: row.polygon,
    createdAt: row.created_at,
  };
}

function requireClient() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

export async function fetchFields(): Promise<Field[]> {
  const all: FieldRow[] = [];
  for (let offset = 0; ; offset += 1000) {
    const {data, error} = await requireClient().from('fields').select(COLUMNS)
      .order('id', {ascending: true}).range(offset, offset + 999);
    if (error) throw error;
    const page = data as FieldRow[];
    all.push(...page);
    if (page.length < 1000) break;
  }
  return all.map(fromRow).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function toRow(input: NewField) {
  return {
    name: input.name,
    type: input.type,
    crop: input.crop,
    variety: input.variety,
    document_area_m2: input.documentAreaM2,
    measured_area_m2: input.measuredAreaM2,
    area_source: input.areaSource,
    polygon: input.polygon,
  };
}

export async function insertField(input: NewField): Promise<Field> {
  const {data, error} = await requireClient().from('fields').insert(toRow(input))
    .select(COLUMNS).single();
  if (error) throw error;
  return fromRow(data as FieldRow);
}

export async function updateField(id: string, input: NewField): Promise<Field> {
  const {data, error} = await requireClient().from('fields').update(toRow(input))
    .eq('id', id).select(COLUMNS).single();
  if (error) throw error;
  return fromRow(data as FieldRow);
}

export async function deleteField(id: string): Promise<void> {
  const {error} = await requireClient().from('fields').delete().eq('id', id);
  if (error) throw error;
}
