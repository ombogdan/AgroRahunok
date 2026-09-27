import React from 'react';
import Svg, {Circle, Line, Path, Polygon, Polyline, Rect} from 'react-native-svg';
import {useScale} from '../../../theme';

// Single-path line icons from the design handoff (docs/design-handoff/design/AgroApp.dc.html, object `I`).
const PATHS = {
  check: 'M5 12.5l4.5 4.5L19 7',
  chevronLeft: 'M15 5l-7 7 7 7',
  chevronRight: 'M9 5l7 7-7 7',
  chevronDown: 'M5 9l7 7 7-7',
  chevronUp: 'M5 15l7-7 7 7',
  locate: 'M12 2v3M12 19v3M2 12h3M19 12h3M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',
  draw: 'M5 18 7.5 6l10.5 3 1.5 8.5zM5 18h.01M7.5 6h.01M18 9h.01',
  ruler: 'M3 16 16 3l5 5L8 21zM7.5 11.5l2 2M10.5 8.5l2 2M13.5 5.5l2 2',
  feet: 'M7 14c-1.5 0-2.5-1.8-2.5-4.5S5.5 4 7 4s2.5 2.8 2.5 5.5S8.5 14 7 14zM5.5 17.5h3M17 20c-1.5 0-2.5-1.8-2.5-4.5S15.5 10 17 10s2.5 2.8 2.5 5.5S18.5 20 17 20zM15.5 7h3',
  spade: 'M14 3.5l6.5 6.5M17.2 6.8 10 14M8 10.5l5.5 5.5-2.8 2.8a3 3 0 0 1-4.2 0l-1.3-1.3a3 3 0 0 1 0-4.2z',
  basket: 'M3.5 10h17l-1.6 9.1a1 1 0 0 1-1 .9H6.1a1 1 0 0 1-1-.9zM8 10l3-6M16 10l-3-6M9 14v3M12 14v3M15 14v3',
  cash: 'M3 7h18v10H3zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM6.5 10v4M17.5 10v4',
  plusMinus: 'M4 7h6M7 4v6M14 17h6M18 5 6 19',
  oranka: 'M3 20h18M6 20l3-7h6l3 7M12 13V5M9 5h6',
  dysk: 'M3 8h18M5 8v5M19 8v5M6 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0M14 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0',
  borona: 'M3 8h18M5 8v9M9 8v9M13 8v9M17 8v9M21 8v9M3 19h18',
  kult: 'M12 3v11M5 14h14M6 14v5M9.5 14v5M14.5 14v5M18 14v5',
  posiv: 'M12 20v-7M12 13c0-3-2-5-6-5 0 3 2 5 6 5zM12 11c0-3 2-5 6-5 0 3-2 5-6 5zM6 20h12',
  posadka: 'M4 20h16M12 20v-9M12 11c-3 0-5-2-5-5 3 0 5 2 5 5zM12 11c0-3 2-5 5-5 0 3-2 5-5 5zM6 17l2 3M18 17l-2 3',
  sap: 'M4 20 15 9M13 5.5l5.5 5.5-2.5 2-5-5z',
  obpr: 'M9 9h6v11a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zM10 9V6h4v3M14 6h3M19.5 4h.01M20.5 7h.01M19.5 10h.01',
  pidzh: 'M7 4h10l1 4v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8zM6 8h12M12 11.5v6M9 14.5h6',
  poliv: 'M12 3c3.5 4.5 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 2.5-6.5 6-11z',
  mulch: 'M3 18h18M5 14h14M7 10h10M9 6h6M5 18l2 3M19 18l-2 3',
  obriz: 'M3 6a3 3 0 1 0 6 0 3 3 0 1 0-6 0M3 18a3 3 0 1 0 6 0 3 3 0 1 0-6 0M8.1 7.9 20 18M8.1 16.1 20 6',
  dots: 'M5 12h.01M12 12h.01M19 12h.01',
  // Work types without their own drawing reuse the design's basket and dots.
  zbir: 'M3.5 10h17l-1.6 9.1a1 1 0 0 1-1 .9H6.1a1 1 0 0 1-1-.9zM8 10l3-6M16 10l-3-6M9 14v3M12 14v3M15 14v3',
  inshe: 'M5 12h.01M12 12h.01M19 12h.01',
} as const;

export type AppIconName = 'home' | 'plots' | 'journal' | 'money' | 'plus' | 'map' | 'settings' | keyof typeof PATHS;

export function AppIcon({
  name,
  color,
  size = 26,
  strokeWidth = 2,
}: {
  name: AppIconName;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const scale = useScale();
  const common = {stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <Svg width={scale(size)} height={scale(size)} viewBox="0 0 24 24" fill="none">
      {name === 'home' && <>
        <Path d="M3 10.5 12 3l9 7.5V21h-6v-7H9v7H3z" {...common} />
      </>}
      {(name === 'plots' || name === 'map') && <>
        <Polyline points="3,5 9,3 15,5 21,3 21,19 15,21 9,19 3,21 3,5" {...common} />
        <Line x1="9" y1="3" x2="9" y2="19" {...common} />
        <Line x1="15" y1="5" x2="15" y2="21" {...common} />
      </>}
      {name === 'journal' && <>
        <Rect x="5" y="3" width="15" height="18" rx="2" {...common} />
        <Line x1="3" y1="7" x2="7" y2="7" {...common} />
        <Line x1="3" y1="12" x2="7" y2="12" {...common} />
        <Line x1="3" y1="17" x2="7" y2="17" {...common} />
        <Line x1="11" y1="9" x2="16" y2="9" {...common} />
        <Line x1="11" y1="14" x2="16" y2="14" {...common} />
      </>}
      {name === 'money' && <>
        <Rect x="3" y="6" width="18" height="15" rx="2" {...common} />
        <Path d="M3 9V5a2 2 0 0 1 2-2h13" {...common} />
        <Circle cx="17" cy="14" r="1" fill={color} />
      </>}
      {name === 'plus' && <>
        <Line x1="12" y1="4" x2="12" y2="20" {...common} />
        <Line x1="4" y1="12" x2="20" y2="12" {...common} />
      </>}
      {name === 'settings' && <>
        <Polygon points="10,2 14,2 14.7,4.2 16.3,4.9 18.4,3.8 20.2,5.6 19.1,7.7 19.8,9.3 22,10 22,14 19.8,14.7 19.1,16.3 20.2,18.4 18.4,20.2 16.3,19.1 14.7,19.8 14,22 10,22 9.3,19.8 7.7,19.1 5.6,20.2 3.8,18.4 4.9,16.3 4.2,14.7 2,14 2,10 4.2,9.3 4.9,7.7 3.8,5.6 5.6,3.8 7.7,4.9 9.3,4.2" {...common} />
        <Circle cx="12" cy="12" r="3" {...common} />
      </>}
      {name in PATHS && <Path d={PATHS[name as keyof typeof PATHS]} {...common} />}
    </Svg>
  );
}
