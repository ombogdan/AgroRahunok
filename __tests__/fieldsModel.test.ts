import {
  formatArea,
  formatHectares,
  formatSotky,
  parseAreaInput,
  polygonAreaM2,
  polygonHasCrossingEdges,
  sotkyWord,
} from '../src/shared/core/fields/model';

const NBSP = ' ';

describe('sotkyWord', () => {
  it.each([
    [1, 'сотка'], [21, 'сотка'], [101, 'сотка'],
    [2, 'сотки'], [24, 'сотки'], [1.5, 'сотки'],
    [0, 'соток'], [5, 'соток'], [11, 'соток'], [12, 'соток'], [14, 'соток'], [111, 'соток'], [220, 'соток'],
  ])('%p → %s', (value, word) => {
    expect(sotkyWord(value)).toBe(word);
  });
});

describe('area formatting', () => {
  it('shows plots under half a hectare in sotky', () => {
    expect(formatArea(2100)).toBe(`21${NBSP}сотка`);
    expect(formatArea(2000)).toBe(`20${NBSP}соток`);
    expect(formatArea(250)).toBe(`2,5${NBSP}сотки`);
  });

  it('switches to hectares with two decimals from half a hectare', () => {
    expect(formatArea(5000)).toBe(`0,50${NBSP}га`);
    expect(formatArea(20000)).toBe(`2,00${NBSP}га`);
  });

  it('trims zeros in totals and keeps them in exact values', () => {
    expect(formatHectares(22000)).toBe(`2,2${NBSP}га`);
    expect(formatHectares(22000, {exact: true})).toBe(`2,20${NBSP}га`);
    expect(formatSotky(22000)).toBe(`220${NBSP}соток`);
    expect(formatSotky(2057)).toBe(`21${NBSP}сотка`);
  });
});

describe('parseAreaInput', () => {
  it('reads sotky and hectares with a comma or a dot', () => {
    expect(parseAreaInput('20', 'sotka')).toBe(2000);
    expect(parseAreaInput('2,5', 'hectare')).toBe(25000);
    expect(parseAreaInput('0.2', 'hectare')).toBe(2000);
  });

  it('rejects empty, zero and non-numeric input', () => {
    expect(parseAreaInput('', 'sotka')).toBeNull();
    expect(parseAreaInput('0', 'sotka')).toBeNull();
    expect(parseAreaInput('-1', 'hectare')).toBeNull();
    expect(parseAreaInput('2,', 'hectare')).toBeNull();
  });
});

describe('polygon helpers', () => {
  // About 100 m × 100 m near latitude 49°.
  const square = [
    {latitude: 49, longitude: 31},
    {latitude: 49.000898, longitude: 31},
    {latitude: 49.000898, longitude: 31.001369},
    {latitude: 49, longitude: 31.001369},
  ];

  it('measures a one-hectare square within 2%', () => {
    const area = polygonAreaM2(square);
    expect(area).toBeGreaterThan(9800);
    expect(area).toBeLessThan(10200);
  });

  it('needs at least three points', () => {
    expect(polygonAreaM2(square.slice(0, 2))).toBe(0);
  });

  it('detects a crossed contour', () => {
    expect(polygonHasCrossingEdges(square)).toBe(false);
    expect(polygonHasCrossingEdges([square[0], square[2], square[1], square[3]])).toBe(true);
  });
});
