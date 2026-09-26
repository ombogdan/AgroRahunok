import type {Field, FieldType, GeoPoint, AreaSource} from './model';
import type {FieldsSnapshot, PendingFieldChange} from './repository';
import {getSupabaseClient} from '../supabase/client';

type FieldRow = {
  owner_uid: string;
  id: string;
  name: string;
  type: FieldType;
  crop: string | null;
  document_area_m2: number | null;
  measured_area_m2: number | null;
  area_source: AreaSource;
  polygon: GeoPoint[];
  created_at: string;
};

function toRow(ownerUid: string, field: Field): FieldRow {
  return {
    owner_uid: ownerUid,
    id: field.id,
    name: field.name,
    type: field.type,
    crop: field.crop,
    document_area_m2: field.documentAreaM2,
    measured_area_m2: field.measuredAreaM2,
    area_source: field.areaSource,
    polygon: field.polygon,
    created_at: field.createdAt,
  };
}

function fromRow(row: FieldRow): Field {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    crop: row.crop,
    documentAreaM2: row.document_area_m2,
    measuredAreaM2: row.measured_area_m2,
    areaSource: row.area_source,
    polygon: row.polygon,
    createdAt: row.created_at,
  };
}

export function applyPendingChanges(remote: Field[], pending: PendingFieldChange[]): Field[] {
  const byId = new Map(remote.map(field => [field.id, field]));
  for (const change of pending) {
    if (change.kind === 'upsert') byId.set(change.field.id, change.field);
    else byId.delete(change.fieldId);
  }
  return [...byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function syncRemoteFields(userId: string, snapshot: FieldsSnapshot): Promise<Field[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase environment is not configured');

  if (!snapshot.initialUploadComplete && snapshot.fields.length > 0) {
    const {error} = await supabase.from('fields').upsert(
      snapshot.fields.map(field => toRow(userId, field)),
      {onConflict: 'owner_uid,id'},
    );
    if (error) throw error;
  }

  for (const change of snapshot.pending) {
    if (change.kind === 'upsert') {
      const {error} = await supabase.from('fields').upsert(toRow(userId, change.field),
        {onConflict: 'owner_uid,id'});
      if (error) throw error;
    } else {
      const {error} = await supabase.from('fields').delete()
        .eq('owner_uid', userId).eq('id', change.fieldId);
      if (error) throw error;
    }
  }

  const {data, error} = await supabase.from('fields').select('*')
    .eq('owner_uid', userId).order('created_at', {ascending: true});
  if (error) throw error;
  return ((data ?? []) as FieldRow[]).map(fromRow);
}
