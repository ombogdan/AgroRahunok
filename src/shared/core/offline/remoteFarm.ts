import {fetchFields} from '../fields/fieldsRepository';
import {fetchPlantings} from '../fields/plantingsRepository';
import {fetchRecords} from '../records/recordsRepository';
import {fetchQuantityUnits} from '../records/quantityUnitsRepository';
import {fetchRowPlantings} from '../rows/rowsRepository';
import {getSupabaseClient} from '../supabase/client';
import type {Change, FarmData, Remote} from './farmStore';

function client() {
  const value = getSupabaseClient();
  if (!value) throw new Error('Supabase не налаштовано');
  return value;
}

async function push(change: Change): Promise<void> {
  const supabase = client();
  if (change.table === 'fields') {
    if (change.action === 'delete') {
      const {error} = await supabase.from('fields').delete().eq('id', change.id);
      if (error) throw error;
      return;
    }
    const field = change.value;
    const {error} = await supabase.from('fields').upsert({
      id: field.id, created_at: field.createdAt, name: field.name, type: field.type,
      crop: field.crop, variety: field.variety, document_area_m2: field.documentAreaM2,
      measured_area_m2: field.measuredAreaM2, area_source: field.areaSource, polygon: field.polygon,
    }, {onConflict: 'id'});
    if (error) throw error;
    return;
  }
  if (change.table === 'plantings') {
    const planting = change.value;
    // The records trigger may have made this row first, so identify it by field and season.
    const {error} = await supabase.from('plantings').upsert({
      field_id: planting.fieldId, season: planting.season, crop: planting.crop,
      variety: planting.variety, area_m2: planting.areaM2,
    }, {onConflict: 'field_id,season'});
    if (error) throw error;
    return;
  }
  if (change.table === 'records') {
    if (change.action === 'delete') {
      const {error} = await supabase.from('records').delete().eq('id', change.id);
      if (error) throw error;
      return;
    }
    const record = change.value;
    const {error} = await supabase.from('records').upsert({
      id: record.id, created_at: record.createdAt, field_id: record.fieldId,
      kind: record.kind, work_type: record.workType, occurred_on: record.occurredOn,
      season: record.season, amount_kopecks: record.amountKopecks,
      quantity_kg: record.quantityKg, note: record.note, details: record.details,
    }, {onConflict: 'id'});
    if (error) throw error;
    return;
  }
  if (change.table === 'plot_rows') {
    if (change.action === 'delete') {
      const {error} = await supabase.from('plot_rows').delete().eq('id', change.id);
      if (error) throw error;
      return;
    }
    const row = change.value;
    const {error} = await supabase.from('plot_rows').upsert({
      id: row.id, field_id: row.fieldId, row_number: row.rowNumber,
      variety: row.variety, planted_year: row.plantedYear,
      ended_year: row.endedYear, created_at: row.createdAt,
    }, {onConflict: 'id'});
    if (error) throw error;
    return;
  }
  const unit = change.value;
  const {error} = await supabase.from('quantity_units').upsert({
    id: unit.id, name: unit.name, kilograms_per_unit: unit.kilogramsPerUnit,
  }, {onConflict: 'id'});
  if (error) throw error;
}

async function pull(): Promise<FarmData> {
  const [fields, records, plantings, units, rows] = await Promise.all([
    fetchFields(), fetchRecords(), fetchPlantings(), fetchQuantityUnits(), fetchRowPlantings(),
  ]);
  return {fields, records, plantings, units, rows};
}

export const remoteFarm: Remote = {push, pull};
