import {getSupabaseClient} from '../supabase/client';
import type {RowPlanting} from './model';

type Row = {
  id: string;
  field_id: string;
  row_number: number;
  crop: string | null;
  variety: string | null;
  planted_year: number | null;
  ended_year: number | null;
  created_at: string;
};

export async function fetchRowPlantings(): Promise<RowPlanting[]> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase не налаштовано');
  const all: Row[] = [];
  for (let offset = 0; ; offset += 1000) {
    const {data, error} = await client.from('plot_rows')
      .select('id, field_id, row_number, crop, variety, planted_year, ended_year, created_at')
      .order('id', {ascending: true}).range(offset, offset + 999);
    if (error) throw error;
    const page = data as Row[];
    all.push(...page);
    if (page.length < 1000) break;
  }
  return all.map(row => ({
    id: row.id, fieldId: row.field_id, rowNumber: row.row_number, crop: row.crop,
    variety: row.variety, plantedYear: row.planted_year,
    endedYear: row.ended_year, createdAt: row.created_at,
  }));
}
