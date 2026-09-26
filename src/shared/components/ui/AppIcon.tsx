import React from 'react';
import Svg, {Circle, Line, Path, Polyline, Rect} from 'react-native-svg';

export type AppIconName =
  | 'home' | 'plots' | 'journal' | 'money' | 'plus' | 'map'
  | 'chevronLeft' | 'chevronRight' | 'locate' | 'draw' | 'ruler' | 'feet' | 'check';

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
  const common = {stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
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
      {name === 'check' && <Path d="M5 12.5l4.5 4.5L19 7" {...common} />}
      {name === 'chevronLeft' && <Path d="M15 5l-7 7 7 7" {...common} />}
      {name === 'chevronRight' && <Path d="M9 5l7 7-7 7" {...common} />}
      {name === 'locate' && <Path d="M12 2v3M12 19v3M2 12h3M19 12h3M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" {...common} />}
      {name === 'draw' && <Path d="M5 18 7.5 6l10.5 3 1.5 8.5zM5 18h.01M7.5 6h.01M18 9h.01" {...common} />}
      {name === 'ruler' && <Path d="M3 16 16 3l5 5L8 21zM7.5 11.5l2 2M10.5 8.5l2 2M13.5 5.5l2 2" {...common} />}
      {name === 'feet' && <Path d="M7 14c-1.5 0-2.5-1.8-2.5-4.5S5.5 4 7 4s2.5 2.8 2.5 5.5S8.5 14 7 14zM5.5 17.5h3M17 20c-1.5 0-2.5-1.8-2.5-4.5S15.5 10 17 10s2.5 2.8 2.5 5.5S18.5 20 17 20zM15.5 7h3" {...common} />}
    </Svg>
  );
}
