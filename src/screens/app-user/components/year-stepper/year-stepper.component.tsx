import {t} from '../../../../shared/config/i18n';
import {useStyles} from './year-stepper.styles';
import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {AppIcon} from '../../../../shared/components/ui';
import {useTheme} from '../../../../shared/theme';

const FIRST_YEAR = 2000;
const LAST_YEAR = 2100;

type Props = {value: number; onChange: (year: number) => void};

// The harvest year with big arrows on both sides; a note says when it is this or next year.
export function YearStepper({value, onChange}: Props) {
  const styles = useStyles();
  const {theme} = useTheme();
  const currentYear = new Date().getFullYear();
  const relative = value === currentYear ? t("thisYearNote") : value === currentYear + 1 ? t("nextYearNote") : null;
  return <View style={styles.row}>
    <Pressable accessibilityRole="button" accessibilityLabel={t("showPreviousYear")} disabled={value <= FIRST_YEAR}
      onPress={() => onChange(value - 1)} style={({pressed}) => [styles.step, pressed && styles.pressed]}>
      <AppIcon name="chevronLeft" color={theme.colors.primary} size={28} strokeWidth={2.4} />
    </Pressable>
    <View style={styles.value} accessibilityLiveRegion="polite">
      <Text style={styles.year}>{value}</Text>
      {relative ? <Text style={styles.relative}>{relative}</Text> : null}
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel={t("showNextYear")} disabled={value >= LAST_YEAR}
      onPress={() => onChange(value + 1)} style={({pressed}) => [styles.step, pressed && styles.pressed]}>
      <AppIcon name="chevronRight" color={theme.colors.primary} size={28} strokeWidth={2.4} />
    </Pressable>
  </View>;
}
