import {localeTag, t} from '../../../../../shared/config/i18n';
import {useStyles} from './material-row.styles';
import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {AppIcon} from '../../../../../shared/components/ui';
import type {MaterialUse} from '../../../../../shared/core/records/model';
import {
  formatMoney, formatNpk, materialCostKopecks, materialKindLabels, materialUnitLabels,
} from '../../../../../shared/core/records/model';
import {useTheme} from '../../../../../shared/theme';

type Props = {material: MaterialUse; first: boolean; onPress: () => void};

// A material already added to the job: everything typed in its sheet, which a tap opens again.
export function MaterialRow({material, first, onPress}: Props) {
  const styles = useStyles();
  const {theme} = useTheme();
  const cost = materialCostKopecks(material);
  const unitLabel = t(materialUnitLabels[material.unit]);
  const amount = material.quantity === null ? null
    : `${new Intl.NumberFormat(localeTag(), {maximumFractionDigits: 3}).format(material.quantity)} ${unitLabel}`;
  const price = material.pricePerUnitKopecks === null ? null
    : `${formatMoney(material.pricePerUnitKopecks)}/${unitLabel}`;
  const details = [material.npk ? `NPK ${formatNpk(material.npk)}` : null,
    [amount, price].filter(Boolean).join(' × ')].filter(Boolean).join(' · ');

  return <Pressable accessibilityRole="button" onPress={onPress}
    style={({pressed}) => [styles.row, !first && styles.divider, pressed && styles.pressed]}>
    <View style={styles.body}>
      <Text style={styles.kind}>{t(materialKindLabels[material.kind])}</Text>
      <Text style={styles.name}>{material.name}</Text>
      {details ? <Text style={styles.detail}>{details}</Text> : null}
    </View>
    {cost !== null && <Text style={styles.cost}>{formatMoney(cost)}</Text>}
    <AppIcon name="pencil" color={theme.colors.primary} size={18} />
  </Pressable>;
}
