import {getSupabaseClient} from '../supabase/client';

// What the field form knows about a season's crop; the rest of the planting is kept as it was.
export type PlantingInput = {
  fieldId: string;
  season: number;
  crop: string;
  variety: string | null;
  areaM2: number;
};

// One line of the crop rotation: what grows on a plot in a harvest year and when.
export type Planting = {
  id: string;
  fieldId: string;
  season: number;
  crop: string | null;
  variety: string | null;
  areaM2: number | null;
  // YYYY-MM-DD in the phone's local time, like record dates.
  workStartOn: string | null;
  sownOn: string | null;
  harvestOn: string | null;
  plannedYieldKgPerHa: number | null;
  note: string | null;
};

export type NewPlanting = Omit<Planting, 'id'>;

type PlantingRow = {
  id: string;
  field_id: string;
  season: number;
  crop: string | null;
  variety: string | null;
  area_m2: number | null;
  work_start_on: string | null;
  sown_on: string | null;
  harvest_on: string | null;
  planned_yield_kg_per_ha: number | null;
  note: string | null;
};

function requireClient() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

// Plantings saved on the phone by an older version of the app lack the rotation details.
export function withRotationDefaults(planting: Pick<Planting, 'id' | 'fieldId' | 'season'> & Partial<Planting>): Planting {
  return {
    crop: null, variety: null, areaM2: null, workStartOn: null, sownOn: null, harvestOn: null,
    plannedYieldKgPerHa: null, note: null, ...planting,
  };
}

export async function fetchPlantings(): Promise<Planting[]> {
  const all: PlantingRow[] = [];
  for (let offset = 0; ; offset += 1000) {
    const {data, error} = await requireClient().from('plantings')
      .select('id, field_id, season, crop, variety, area_m2, work_start_on, sown_on, harvest_on, ' +
        'planned_yield_kg_per_ha, note')
      .order('id', {ascending: true}).range(offset, offset + 999);
    if (error) throw error;
    const page = data as unknown as PlantingRow[];
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
    workStartOn: row.work_start_on,
    sownOn: row.sown_on,
    harvestOn: row.harvest_on,
    plannedYieldKgPerHa: row.planned_yield_kg_per_ha,
    note: row.note,
  }));
}
