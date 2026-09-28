import {t} from '../../../../../shared/config/i18n';
import {useStyles} from './extra-crops.styles';
import React from 'react';
import {Pressable, Text, TextInput, View} from 'react-native';
import {AppButton, AppIcon, AutocompleteInput} from '../../../../../shared/components/ui';
import {formatArea} from '../../../../../shared/core/fields/model';
import {useTheme} from '../../../../../shared/theme';
import {Chip} from '../../../components/record-chip/record-chip.component';
import type {ExtraCropDraft} from './extra-crop-draft';
import {newExtraDraft, parseExtraDraft, unitForArea} from './extra-crop-draft';

type Props = {
  drafts: ExtraCropDraft[];
  onChange: (drafts: ExtraCropDraft[]) => void;
  suggestionsFor: (input: string) => string[];
  mainCrop: string;
  plotAreaM2: number;
  keyboardBarId: string;
};

// Other crops sharing the plot this season, each on its own area; the main crop keeps what is left.
export function ExtraCrops({drafts, onChange, suggestionsFor, mainCrop, plotAreaM2, keyboardBarId}: Props) {
  const styles = useStyles();
  const {theme} = useTheme();
  const shares = drafts.flatMap(draft => parseExtraDraft(draft).share ?? []);
  const mainAreaM2 = plotAreaM2 - shares.reduce((sum, share) => sum + share.areaM2, 0);
  const update = (next: ExtraCropDraft) => onChange(drafts.map(item => (item.key === next.key ? next : item)));

  return <View style={styles.section}>
    <Text style={styles.label}>{t("otherCropsOnPlotOptional")}</Text>
    {drafts.map(draft => {
      const {valid} = parseExtraDraft(draft);
      return <View key={draft.key} style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.cardTitle}>{t("cropLabel")}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={t("removeCrop")} hitSlop={8}
            onPress={() => onChange(drafts.filter(item => item.key !== draft.key))} style={styles.remove}>
            <AppIcon name="close" color={theme.colors.textMuted} size={20} strokeWidth={2.2} />
          </Pressable>
        </View>
        <AutocompleteInput value={draft.crop} onChangeText={crop => update({...draft, crop})}
          suggestions={suggestionsFor(draft.crop)} placeholder={t("forExampleOnion")}
          accessibilityLabel={t("cropLabel")} />
        <TextInput value={draft.variety} onChangeText={variety => update({...draft, variety})} maxLength={60}
          placeholder={t("varietyHybridOptional")} placeholderTextColor={theme.colors.textMuted}
          accessibilityLabel={t("variety")} style={styles.input} />
        <View style={styles.areaRow}>
          <TextInput value={draft.area} onChangeText={area => update({...draft, area})} keyboardType="decimal-pad"
            inputAccessoryViewID={keyboardBarId} placeholder={t("cropAreaPlaceholder")}
            placeholderTextColor={theme.colors.textMuted} accessibilityLabel={t("cropAreaPlaceholder")}
            style={[styles.input, styles.area]} />
          <Chip label={t("ares")} selected={draft.unit === 'sotka'} onPress={() => update({...draft, unit: 'sotka'})} />
          <Chip label={t("hectares")} selected={draft.unit === 'hectare'}
            onPress={() => update({...draft, unit: 'hectare'})} />
        </View>
        {!valid && <Text style={styles.error}>{t("extraCropNeedsNameAndArea")}</Text>}
      </View>;
    })}
    <AppButton label={t("addAnotherCrop")} variant="quiet"
      onPress={() => onChange([...drafts, newExtraDraft(unitForArea(plotAreaM2))])} />
    {shares.length > 0 && (mainAreaM2 >= 1
      ? <Text style={styles.note}>{t("mainCropAreaValue", [mainCrop || t("mainCrop"), formatArea(mainAreaM2)])}</Text>
      : <Text style={styles.error}>{t("extraCropsTooLarge", [formatArea(plotAreaM2)])}</Text>)}
  </View>;
}
