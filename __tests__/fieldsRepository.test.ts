import {deleteField, fetchFields, insertField} from '../src/shared/core/fields/fieldsRepository';

const mockRow = {
  id: 'field-1', name: 'Малинник', type: 'berries', crop: 'Малина',
  document_area_m2: 2000, measured_area_m2: null, area_source: 'document',
  polygon: [], created_at: '2026-09-26T10:00:00.000Z',
};
const mockCalls: {table?: string; inserted?: Record<string, unknown>; deletedId?: string} = {};

// A minimal stand-in for the Supabase query builder used by the repository.
jest.mock('../src/shared/core/supabase/client', () => ({
  getSupabaseClient: () => ({
    from: (table: string) => {
      mockCalls.table = table;
      return {
        select: () => ({order: async () => ({data: [mockRow], error: null})}),
        insert: (values: Record<string, unknown>) => {
          mockCalls.inserted = values;
          return {select: () => ({single: async () => ({data: mockRow, error: null})})};
        },
        delete: () => ({eq: async (_column: string, id: string) => {
          mockCalls.deletedId = id;
          return {error: null};
        }}),
      };
    },
  }),
}));

const expectedField = {
  id: 'field-1', name: 'Малинник', type: 'berries', crop: 'Малина',
  documentAreaM2: 2000, measuredAreaM2: null, areaSource: 'document',
  polygon: [], createdAt: '2026-09-26T10:00:00.000Z',
};

it('reads plots from the fields table', async () => {
  await expect(fetchFields()).resolves.toEqual([expectedField]);
  expect(mockCalls.table).toBe('fields');
});

it('inserts only plot columns and leaves id and owner to the database', async () => {
  const field = await insertField({
    name: 'Малинник', type: 'berries', crop: 'Малина',
    documentAreaM2: 2000, measuredAreaM2: null, areaSource: 'document', polygon: [],
  });
  expect(field).toEqual(expectedField);
  expect(mockCalls.inserted).toEqual({
    name: 'Малинник', type: 'berries', crop: 'Малина',
    document_area_m2: 2000, measured_area_m2: null, area_source: 'document', polygon: [],
  });
});

it('deletes a plot by id', async () => {
  await deleteField('field-1');
  expect(mockCalls.deletedId).toBe('field-1');
});
