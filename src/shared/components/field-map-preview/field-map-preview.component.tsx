import {t} from '../../config/i18n';
import {useStyles} from './field-map-preview.styles';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import MapView, {Polygon} from 'react-native-maps';
import type {GeoPoint} from '../../core/fields/model';
import {regionForPoints} from '../../core/fields/model';
import {useScale, useTheme} from '../../theme';

// A still satellite view of a plot's contour; touches pass through to the scrolling screen.
export function FieldMapPreview({polygon}: {polygon: GeoPoint[]}) {
  const styles = useStyles();
  const {theme} = useTheme();
  const scale = useScale();
  const region = useMemo(() => regionForPoints(polygon), [polygon]);
  return <View style={styles.map} pointerEvents="none" accessibilityLabel={t("fieldBoundaryOnMap")}>
    <MapView style={styles.fill} mapType="hybrid" region={region} liteMode
      scrollEnabled={false} zoomEnabled={false} rotateEnabled={false} pitchEnabled={false}>
      <Polygon coordinates={polygon} strokeColor={theme.colors.accent}
        fillColor="rgba(227,164,59,0.28)" strokeWidth={scale(3)} />
    </MapView>
  </View>;
}
