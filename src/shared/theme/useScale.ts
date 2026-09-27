import {useCallback} from 'react';
import {useWindowDimensions} from 'react-native';
import type {Scale} from './theme';

const BASE_WIDTH = 375;

export function useScale(): Scale {
  const {width, height} = useWindowDimensions();
  const ratio = Math.min(width, height) / BASE_WIDTH;
  return useCallback((size: number) => size * ratio, [ratio]);
}
