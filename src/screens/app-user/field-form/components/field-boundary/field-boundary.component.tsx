import {t} from '../../../../../shared/config/i18n';
import {useStyles} from './field-boundary.styles';
import React from 'react';
import {Text, View} from 'react-native';
import {AppButton} from '../../../../../shared/components/ui';
import {FieldMapPreview} from '../../../../../shared/components/field-map-preview/field-map-preview.component';
import type {GeoPoint} from '../../../../../shared/core/fields/model';

type Props = {polygon: GeoPoint[]; onDraw: () => void; onWalk: () => void};

// The plot's contour in the edit form: fix it point by point on the map, walk it again,
// or mark it for the first time when only the area was typed in.
export function FieldBoundary({polygon, onDraw, onWalk}: Props) {
  const styles = useStyles();
  const hasContour = polygon.length >= 3;
  return <View style={styles.section}>
    <Text style={styles.label}>{t("fieldBoundaryOnMap")}</Text>
    {hasContour ? <FieldMapPreview polygon={polygon} /> : <Text style={styles.note}>{t("boundaryNotMarkedYet")}</Text>}
    <AppButton label={hasContour ? t("adjustOnMap") : t("drawOnMap")} variant="quiet" onPress={onDraw} />
    <AppButton label={hasContour ? t("walkAgain") : t("walkWithPhone")} variant="quiet" onPress={onWalk} />
  </View>;
}
