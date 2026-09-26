import React from 'react';
import Svg, {Circle, Line, Path, Polyline, Rect} from 'react-native-svg';

export type AppIconName = 'home' | 'plots' | 'journal' | 'money' | 'plus' | 'map';

export function AppIcon({
  name,
  color,
  size = 26,
}: {
  name: AppIconName;
  color: string;
  size?: number;
}) {
  const common = {stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
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
    </Svg>
  );
}
