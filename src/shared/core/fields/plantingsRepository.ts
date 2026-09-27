import {getSupabaseClient} from '../supabase/client';

export type PlantingInput = {
  fieldId: string;
  season: number;
  crop: string;
  variety: string | null;
  areaM2: number;
};

function requireClient() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
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
