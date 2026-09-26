import {distanceM, nextTrackPoint, trackLengthM} from '../src/shared/core/fields/track';

// One metre northwards is about 0.00000899° of latitude.
const METRE_LAT = 1 / 111195;
const start = {latitude: 49, longitude: 31};
const north = (metres: number) => ({latitude: start.latitude + metres * METRE_LAT, longitude: start.longitude});
const fix = (metres: number, accuracy = 4, timestamp = 1000) => ({...north(metres), accuracy, timestamp});

describe('distanceM', () => {
  it('measures a few metres precisely', () => {
    expect(distanceM(start, north(2))).toBeCloseTo(2, 2);
    expect(distanceM(start, north(100))).toBeCloseTo(100, 1);
  });
});

describe('nextTrackPoint', () => {
  it('records the first precise fix', () => {
    expect(nextTrackPoint([], fix(0))).toEqual(start);
  });

  it('waits until the phone has moved at least 2 m', () => {
    expect(nextTrackPoint([start], fix(1.5))).toBeNull();
    expect(nextTrackPoint([start], fix(2.1))).toEqual(north(2.1));
  });

  it('skips imprecise, empty and stale fixes', () => {
    expect(nextTrackPoint([start], fix(5, 15))).toBeNull();
    expect(nextTrackPoint([start], {latitude: 0, longitude: 0, accuracy: 3, timestamp: 1000})).toBeNull();
    expect(nextTrackPoint([], fix(0, 4, 500), 1000)).toBeNull();
  });
});

describe('trackLengthM', () => {
  it('adds up the walked segments', () => {
    expect(trackLengthM([start, north(2), north(5)])).toBeCloseTo(5, 2);
    expect(trackLengthM([start])).toBe(0);
  });
});
