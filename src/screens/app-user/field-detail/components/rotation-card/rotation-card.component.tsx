import {t} from '../../../../../shared/config/i18n';
import {useStyles} from './rotation-card.styles';
import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {AppButton, AppIcon, InfoCard} from '../../../../../shared/components/ui';
import type {Field} from '../../../../../shared/core/fields/model';
import {selectedAreaM2} from '../../../../../shared/core/fields/model';
import type {Planting} from '../../../../../shared/core/fields/plantingsRepository';
import type {FarmRecord} from '../../../../../shared/core/records/model';
import {calendarDateLabel} from '../../../../../shared/core/records/model';
import {
  actualYieldKgPerHa, formatYield, plantingCrops, plantingLabel, repeatedFrom, rotatesCrops, seasonOnField,
} from '../../../../../shared/core/rotation/model';
import {useTheme} from '../../../../../shared/theme';

type Props = {
  field: Field;
  rotation: Planting[];
  records: FarmRecord[];
  onOpen: (season: number) => void;
  onAdd: () => void;
};

// The plot's crop rotation, newest year first: dates, plan against the harvested yield,
// and a warning when a crop follows itself.
export function RotationCard({field, rotation, records, onOpen, onAdd}: Props) {
  const styles = useStyles();
  const {theme} = useTheme();
  const currentSeason = seasonOnField(new Date(), rotation, field.crop);
  return <InfoCard>
    <Text style={styles.title}>{t("cropRotation")}</Text>
    {rotation.length === 0 && <Text style={styles.hint}>{t("rotationEmpty")}</Text>}
    {rotation.map(planting => {
      const plotAreaM2 = selectedAreaM2(field);
      const areaM2 = planting.areaM2 ?? plotAreaM2;
      const label = plantingLabel(planting, plotAreaM2);
      // Several crops on the plot: each one's harvest is counted over its own area.
      const shares = planting.extraCrops.length > 0 ? plantingCrops(planting, plotAreaM2) : [];
      const facts = shares.length > 0
        ? shares.flatMap((share, index) => {
          const fact = actualYieldKgPerHa(records, field.id, planting.season, share.areaM2,
            {name: share.crop, isMain: index === 0});
          return fact ? [`${share.crop} ${formatYield(fact, share.areaM2)}`] : [];
        })
        : [actualYieldKgPerHa(records, field.id, planting.season, areaM2)].flatMap(fact =>
          (fact ? [formatYield(fact, areaM2)] : []));
      const repeat = rotatesCrops(field) ? repeatedFrom(planting, rotation) : null;
      const details = [
        planting.sownOn ? t("sownOnValue", [calendarDateLabel(planting.sownOn)]) : null,
        planting.harvestOn ? t("harvestOnValue", [calendarDateLabel(planting.harvestOn)]) : null,
        planting.plannedYieldKgPerHa ? t("planValue", [formatYield(planting.plannedYieldKgPerHa, areaM2)]) : null,
        facts.length > 0 ? t("factValue", [facts.join(', ')]) : null,
      ].filter(Boolean).join(' · ');
      return <Pressable key={planting.season} accessibilityRole="button" onPress={() => onOpen(planting.season)}
        style={({pressed}) => [styles.row, pressed && styles.pressed]}>
        <Text style={styles.season}>{planting.season}</Text>
        <View style={styles.body}>
          <Text style={label ? styles.crop : styles.cropMissing}>{label ?? t("cropNotSet")}</Text>
          {planting.season === currentSeason && <View style={styles.badge}>
            <Text style={styles.badgeText}>{t("inProgress")}</Text>
          </View>}
          {planting.season > currentSeason && <View style={[styles.badge, styles.badgePlanned]}>
            <Text style={[styles.badgeText, styles.badgePlannedText]}>{t("planned")}</Text>
          </View>}
          {details ? <Text style={styles.detail}>{details}</Text> : null}
          {repeat ? <View style={styles.warning}>
            <AppIcon name="warning" color={theme.colors.warning} size={18} />
            <Text style={styles.warningText}>{t("sameCropAsYear", [repeat.season])}</Text>
          </View> : null}
        </View>
        <AppIcon name="chevronRight" color={theme.colors.textMuted} size={22} strokeWidth={2.2} />
      </Pressable>;
    })}
    <AppButton label={t("addCrop")} variant="quiet" onPress={onAdd} />
  </InfoCard>;
}
