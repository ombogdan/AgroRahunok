import {getSupabaseClient} from '../supabase/client';

export type QuantityUnit = {
  id: string;
  name: string;
  kilogramsPerUnit: number;
};

type UnitRow = {id: string; name: string; kilograms_per_unit: number};

function requireClient() {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured');
  return client;
}

function fromRow(row: UnitRow): QuantityUnit {
  return {id: row.id, name: row.name, kilogramsPerUnit: Number(row.kilograms_per_unit)};
}

export async function fetchQuantityUnits(): Promise<QuantityUnit[]> {
  const {data, error} = await requireClient().from('quantity_units')
    .select('id, name, kilograms_per_unit').order('created_at', {ascending: true});
  if (error) throw error;
  return (data as UnitRow[]).map(fromRow);
}

export async function addQuantityUnit(name: string, kilogramsPerUnit: number): Promise<QuantityUnit> {
  const {data, error} = await requireClient().from('quantity_units')
    .insert({name, kilograms_per_unit: kilogramsPerUnit})
    .select('id, name, kilograms_per_unit').single();
  if (error) throw error;
  return fromRow(data as UnitRow);
}
