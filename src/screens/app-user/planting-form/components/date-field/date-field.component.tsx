import {t} from '../../../../../shared/config/i18n';
import {useStyles} from './date-field.styles';
import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {AppIcon} from '../../../../../shared/components/ui';
import {calendarDateLabel} from '../../../../../shared/core/records/model';
import {useTheme} from '../../../../../shared/theme';

type Props = {label: string; value: string | null; onPress: () => void; onClear: () => void; hint?: string};

// An optional date: tapping opens the calendar, the cross clears it again.
export function DateField({label, value, onPress, onClear, hint}: Props) {
  const styles = useStyles();
  const {theme} = useTheme();
  const text = value ? calendarDateLabel(value, new Date(), true) : null;
  return <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.row}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${text ?? t("notSet")}`} onPress={onPress}
        style={({pressed}) => [styles.input, pressed && styles.pressed]}>
        <Text style={text ? styles.value : styles.placeholder}>{text ?? t("chooseADate")}</Text>
        <AppIcon name="calendar" color={theme.colors.primary} size={22} />
      </Pressable>
      {value ? <Pressable accessibilityRole="button" accessibilityLabel={t("clearDate")} onPress={onClear}
        hitSlop={8} style={styles.clear}>
        <AppIcon name="close" color={theme.colors.textMuted} size={22} strokeWidth={2.2} />
      </Pressable> : null}
    </View>
    {hint ? <Text style={styles.hint}>{hint}</Text> : null}
  </View>;
}
