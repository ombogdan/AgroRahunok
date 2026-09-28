import {t} from '../../../../../shared/config/i18n';
import React from 'react';
import {Text, TextInput, View} from 'react-native';
import {AppButton, AutocompleteInput, InfoCard} from '../../../../../shared/components/ui';
import {useTheme} from '../../../../../shared/theme';
import {useStyles} from './row-variety-form.styles';

type Props = {
  rowCount: number;
  first: string;
  last: string;
  onFirstChange: (value: string) => void;
  onLastChange: (value: string) => void;
  crop: string;
  onCropChange: (value: string) => void;
  cropSuggestions: string[];
  variety: string;
  onVarietyChange: (value: string) => void;
  year: string;
  onYearChange: (value: string) => void;
  canSave: boolean;
  saving: boolean;
  onSave: () => void;
};

export function RowVarietyForm(props: Props) {
  const styles = useStyles();
  const {theme} = useTheme();
  return <InfoCard>
    <Text style={styles.title}>{t("whatGrowsInEachRow")}</Text>
    <Text style={styles.muted}>{t("rowsCountPrefix", [], "after")}{props.rowCount}{t("initialVarietyHint")}</Text>
    <Text style={styles.muted}>{t("singleRowNumberHint")}</Text>
    <View style={styles.range}>
      <TextInput value={props.first} onChangeText={props.onFirstChange} keyboardType="number-pad"
        placeholder={t("fromRowNo")} accessibilityLabel={t("fromRowNo")} style={[styles.input, styles.half]} />
      <TextInput value={props.last} onChangeText={props.onLastChange} keyboardType="number-pad"
        placeholder={t("toNoOptional")} accessibilityLabel={t("toRowNoOptional")} style={[styles.input, styles.half]} />
    </View>
    <View style={styles.section}>
      <Text style={styles.label}>{t("cropLabel")}</Text>
      <AutocompleteInput value={props.crop} onChangeText={props.onCropChange} suggestions={props.cropSuggestions}
        placeholder={t("forExampleRaspberry")} accessibilityLabel={t("cropLabel")} />
    </View>
    <View style={styles.section}>
      <Text style={styles.label}>{t("variety")}</Text>
      <TextInput value={props.variety} onChangeText={props.onVarietyChange} maxLength={60}
        placeholder={t("forExamplePolka")} placeholderTextColor={theme.colors.textMuted}
        accessibilityLabel={t("variety")} style={styles.input} />
    </View>
    <View style={styles.section}>
      <Text style={styles.label}>{t("plantingYear")}</Text>
      <TextInput value={props.year} onChangeText={props.onYearChange} keyboardType="number-pad"
        placeholder={t("forExample2026")} accessibilityLabel={t("plantingYear")} style={styles.input} />
    </View>
    <Text style={styles.muted}>{t("changeVarietyPlantingYearHint")}</Text>
    <AppButton label={props.saving ? t("saving") : t("assignVariety")}
      disabled={!props.canSave} onPress={props.onSave} />
  </InfoCard>;
}
