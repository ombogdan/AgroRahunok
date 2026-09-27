import {getSupabaseClient} from '../supabase/client';

export type PlantingInput = {
  fieldId: string;
  season: number;
  crop: string;
  variety: string | null;
  areaM2: number;
};

export type Planting = {
  id: string;
  fieldId: string;
  season: number;
  crop: string | null;
  variety: string | null;
  areaM2: number | null;
};

type PlantingRow = {
  id: string;
  field_id: string;
  season: number;
  crop: string | null;
  variety: string | null;
  area_m2: number | null;
};

function requireClient() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

export async function fetchPlantings(): Promise<Planting[]> {
  const all: PlantingRow[] = [];
  for (let offset = 0; ; offset += 1000) {
    const {data, error} = await requireClient().from('plantings')
      .select('id, field_id, season, crop, variety, area_m2')
      .order('id', {ascending: true}).range(offset, offset + 999);
    if (error) throw error;
    const page = data as PlantingRow[];
    all.push(...page);
    if (page.length < 1000) break;
  }
  return all.map(row => ({
    id: row.id,
    fieldId: row.field_id,
    season: row.season,
    crop: row.crop,
    variety: row.variety,
    areaM2: row.area_m2,
  }));
}

// What grows on the plot in a season: one row per plot and harvest year, rewritten when the crop changes.
export async function savePlanting(input: PlantingInput): Promise<void> {
  const {error} = await requireClient().from('plantings').upsert({
    field_id: input.fieldId,
    season: input.season,
    crop: input.crop,
    variety: input.variety,
    area_m2: input.areaM2,
  }, {onConflict: 'field_id,season'});
  if (error) throw error;
}
