// A crop rotation line and what the app fills in for older data; no Supabase here, so the offline
// store can use it on its own.

// What the field form knows about a season's crop; the rest of the planting is kept as it was.
export type PlantingInput = {
  fieldId: string;
  season: number;
  crop: string;
  variety: string | null;
  areaM2: number;
};

// One of several crops sharing a plot in a season, e.g. onions on 2 of 12 sotok.
export type CropShare = {crop: string; variety: string | null; areaM2: number};

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
  // Other crops of the same plot and season; the planting's own crop, variety and area are the main one.
  extraCrops: CropShare[];
};

export type NewPlanting = Omit<Planting, 'id'>;

// Plantings saved on the phone by an older version of the app lack the rotation details.
export function withRotationDefaults(planting: Pick<Planting, 'id' | 'fieldId' | 'season'> & Partial<Planting>): Planting {
  return {
    crop: null, variety: null, areaM2: null, workStartOn: null, sownOn: null, harvestOn: null,
    plannedYieldKgPerHa: null, note: null, extraCrops: [], ...planting,
  };
}
